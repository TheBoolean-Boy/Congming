"use server"

import { generateEmbedding } from '@/lib/llm'
import { db } from "@/server/db";
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
})

const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY
})

interface Issue {
  title: string
  body: string
  risk_level: 'high' | 'moderate' | 'mild'
}

const createIssueTool = async (githubUrl: string, title: string, body: string) => {
  const [owner, repo] = githubUrl.split("/").slice(-2)

  if (!owner || !repo) throw new Error("Invalid GitHub URL")

  try {
    const response = await octokit.rest.issues.create({ owner, repo, title, body })
    return response
  } catch (error) {
    console.error("Couldn't create an issue", error)
  }
}

const issueSchema = {
  type: "object",
  properties: {
    issues: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          body: { type: "string" },
          risk_level: { type: "string", enum: ["high", "moderate", "mild"] }
        },
        required: ["title", "body", "risk_level"]
      }
    }
  },
  required: ["issues"],
  additionalProperties: false
};

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4) // < Actually here I am calculating approximate number of tokens >
}

export async function scanCodebase(githubUrl: string, projectId: string){
  const question = `
Go through the codebase and find security vulnerabilities that are severe or high-risk.
Ignore secured API keys like process.env.KEY_NAME.
`

  const embeddings = await generateEmbedding(question)
  if (!embeddings || embeddings.length === 0) throw new Error("Failed to get embeddings")

  const queryVector = embeddings[0]?.values
  const vectorQuery = `[${queryVector?.join(',')}]`

  const result = await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
  ` as { fileName: string; sourceCode: string; summary: string }[]

  // console.log(`<-----------Results of Vector Search-------> \n ${result}`)
  // console.log(result)
  let context = ''
  let tokensUsed = 0
  const MAX_TOKENS = 65000

  for (const doc of result) {
    const snippet = `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`
    const snippetTokens = estimateTokens(snippet)
    if (tokensUsed + snippetTokens > MAX_TOKENS) break
    context += snippet
    tokensUsed += snippetTokens
  }

  try {
    const schemaCompletion: any = await cerebras.chat.completions.create({
      // model: 'llama3.3-70b',
      model: 'gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: `
You are an AI security assistant. Identify vulnerabilities in the codebase.
Focus on business logic flaws, exposed .env files, and other high-risk issues.
Ignore secure API keys (process.env.KEY_NAME).

Format each issue professionally for GitHub Markdown with the following sections:
- Vulnerability Description
- Affected File(s)
- Steps to Reproduce (if applicable)
- Risk Level
- Recommendation

START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START QUESTION
${question}
END OF QUESTION

Respond strictly in JSON format with a single top-level key "issues" containing an array of issues following the schema.
 AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
         AI assistant will not invent anything that is not drawn directly from the context.
         Format each issue professionally for GitHub Markdown with the following sections:
- Vulnerability Description
- Affected File(s)
- Steps to Reproduce (if applicable)
- Risk Level
- Recommendation

          `
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema:  {
          name: 'issue_schema',
          strict: true,
          schema: issueSchema
        }
      }
    })

    const schemaIssueDataResponse = JSON.parse(schemaCompletion.choices[0].message.content)
    const schemaIssueData: Issue[] = schemaIssueDataResponse.issues

    for (const issue of schemaIssueData) {
      if (issue.risk_level === 'high') {
        const professionalTitle = `[Security][High] ${issue.title}`
        const res = await createIssueTool(githubUrl, professionalTitle, issue.body)
        // console.log(res)
        if (res?.status === 201) console.log(`GitHub issue created: ${professionalTitle}`)
      }
    }


  } catch (err) {
    console.error("Error while scanning or creating issues:", err)
  }
}




