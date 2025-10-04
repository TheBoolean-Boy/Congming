import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { GoogleGenAI } from "@google/genai";
import type { Document } from "@langchain/core/documents";

const cerebrasClient = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

export const aiCerebrusLlamaSummariseCommit = async (diff: string) => {
  const resposne: any = await cerebrasClient.chat.completions.create({
    messages: [
      {
        "role": "system",
        "content": `You are an expert programmer summarizing a git diff.

         Return the summary in this format:
         * Short, clear bullet points
         * Each line starts with "*"
         * Include the filename at the end in square brackets
         * Do not include explanations, quotes, or extra text

         Example style:
         * Updated the welcome message for the root route [app.js]
         * Added a new /health endpoint [app.js]
         * Do include the file where the chnages were made and a super clean and clear summary of what kind of chages were made
         * Must include detailed summary of changes 
         * Each line must include the file name and the route where the changes were made like ('/'), ('/about) etc.

         Summarise the following diff:\n\n${diff}`
      },

    ],
    model: 'llama-4-maverick-17b-128e-instruct',
    stream: false,
    max_completion_tokens: 7000,
    temperature: 0.6,
    top_p: 0.9,
    // reasoning_effort: "medium"
  });

  const summary = resposne.choices[0].message.content
  return summary
}

// console.log(await aiCerebrusLlamaSummariseCommit(`diff --git a/app.js b/app.js
// index 3d2e1f7..8b1c4a2 100644
// --- a/app.js
// +++ b/app.js
// @@ -1,6 +1,10 @@
//  const express = require('express');
//  const app = express();
 
// -app.get('/', (req, res) => {
// -  res.send('Hello World');
// -});
// +// Updated welcome route
// +app.get('/', (req, res) => {
// +  res.send('Hello, GitHub Diff Example!');
// +});
// +
// +// Added new health check route
// +app.get('/health', (req, res) => {
// +  res.status(200).json({ status: 'ok' });
// +});
 
//  app.listen(3000, () => {
//    console.log('Server running on port 3000');
// `))


// Fall Back Mechanism
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

export const aiSummariseCommit = async (diff: string) => {
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents:
      ` You are an expert programmer, and you are trying to summarize a git diff.
                Reminders about the git diff format:
                For every file, there are a few metadata lines, like (for example):
                \`\`\`
                diff --git a/lib/index.js b/lib/index.js
                index aadf691..bfef603 100644
                --- a/lib/index.js
                +++ b/lib/index.js
                \`\`\`

                This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
                Then there is a specifier of the lines that were modified.
                A line starting with \`+\` means it was added.
                A line that starting with \`-\` means that line was deleted.
                A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
                It is not part of the diff.
                [...]

                EXAMPLE SUMMARY COMMENTS:
                \`\`\`
                * Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
                * Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
                * Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
                * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
                * Lowered numeric tolerance for test files
                \`\`\`

                Most commits will have less comments than this examples list.
                The last comment does not include the file names,
                because there were more than two relevant files in the hypothetical commit.
                Do not include parts of the example in your summary.
                It is given only as an example of appropriate comments.,

                Please summarise the following diff file: \n\n${diff}\``

  })
  return response.text
}

// console.log(await aiSummariseCommit(`diff --git a/app.js b/app.js
// index 3d2e1f7..8b1c4a2 100644
// --- a/app.js
// +++ b/app.js
// @@ -1,6 +1,10 @@
//  const express = require('express');
//  const app = express();
 
// -app.get('/', (req, res) => {
// -  res.send('Hello World');
// -});
// +// Updated welcome route
// +app.get('/', (req, res) => {
// +  res.send('Hello, GitHub Diff Example!');
// +});
// +
// +// Added new health check route
// +app.get('/health', (req, res) => {
// +  res.status(200).json({ status: 'ok' });
// +});
 
//  app.listen(3000, () => {
//    console.log('Server running on port 3000');
// `))


export async function summariseCode(doc: Document) {
  console.log(`getting summaries for: ${doc.metadata.source}`)
  try {
    const code = doc.pageContent.slice(0, 10000)
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file
    Here is the code:
    ${code}

    Give a summary in no more than 100 words of the code above,`
    })
    return response.text 
  } catch (error) {
    return 'empty'
  }
}


export async function generateEmbedding(summary: string) {
  const respose = await genAI.models.embedContent({
    model: 'gemini-embedding-001',
    contents: `${summary}`,
    config: {
      outputDimensionality: 768
    }
  })
  // console.log( "inside Gemini.ts", typeof respose.embeddings)
  return respose.embeddings
}


// console.log("Inside Gemini Ts ", await generateEmbedding("Wahtsaoo"))
// console.log(await generateEmbedding("Hellow"))