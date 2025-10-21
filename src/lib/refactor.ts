"use server";

import { generateEmbedding } from '@/lib/llm';
import { db } from '@/server/db';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY
});

type Refactor = {
  filepath: string;
  refactor: string;
};

const refactorSchema = {
  type: 'object',
  properties: {
    refactors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          filepath: { type: 'string' },
          refactor: { type: 'string' }
        },
        required: ['filepath', 'refactor']
      }
    }
  },
  required: ['refactors'],
  additionalProperties: false
};

function estimateTokens(text: string): number {
  // Approximate token count by dividing character count by 4
  return Math.ceil(text.length / 4);
}

export async function refactorCodebase(githubUrl: string, projectId: string) {
  const question = `
Go through the codebase and find the files which can be refactored by writing better code. Only prefer the files which are written very badly and refactor them in a way that it will be worth. if you aren't sure about dependecies then be careful not to break the application with the refactor
`;

  const embeddings = await generateEmbedding(question);
  if (!embeddings || embeddings.length === 0) {
    throw new Error('Failed to get embeddings');
  }

  const queryVector = embeddings[0]?.values;
  const vectorQuery = `[${queryVector?.join(',')}]`;

  const result = await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.4
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 5
  ` as { fileName: string; sourceCode: string; summary: string }[];

  console.log(`<----------------------------->`);

  let context = '';
  let tokensUsed = 0;
  const MAX_TOKENS = 65000;

  for (const doc of result) {
    const snippet = `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`;
    const snippetTokens = estimateTokens(snippet);
    if (tokensUsed + snippetTokens > MAX_TOKENS) break;
    context += snippet;
    tokensUsed += snippetTokens;
  }

  try {
    const schemaCompletion: any = await cerebras.chat.completions.create({
      model: 'llama3.3-70b',
      messages: [
        {
          role: 'system',
          content: `
You are an AI code refactoring assistant. Your task is to improve the given codebase by applying modern best practices.

Focus areas:
- Refactor for clean, maintainable, and modular code.
- Apply security and performance best practices.
- Replace deprecated or unsafe patterns with recommended approaches.
- Ensure environment variables (process.env.KEY_NAME) are used safely.
- Improve readability, structure, and consistency across the codebase.

For each refactor you propose, provide output in GitHub Markdown with the following sections:
- Refactor Description
- Affected File(s)
- Before (original snippet)
- After (refactored snippet)
- Benefit

Format your entire response strictly in JSON with a single top-level key "refactors" containing an object following the schema above.
The fileName field in the context below is actually the full file path.
In your JSON output, set "filepath" exactly equal to that fileName value.
For each refactor, provide JSON with:
- filepath: must exactly match the fileName shown in context
- refactor: must be a JSON-safe string containing the refactored full code (shouldn't be description rather should stringified refactored code of the original sourcecode of the file).
Ensure the code is valid JavaScript/TypeScript and keep imports intact.
Below is an example of how the output should be, note that this just an example Don't include this example in your output:
{
  "refactors": [
    {
  //Donot include the below example in the output
      "filepath": "backend/src/lib/db.js",
      "refactor": "import mongoose from 'mongoose';\n       const connectDB = async () => { \n        try {   \n         await mongoose.connect(process.env.MONGO_URI, {    \n          useNewUrlParser: true,     \n          useUnifiedTopology: true,    \n         });   \n        console.log('MongoDB connected');  \n      } catch (err) {    \n       console.error('DB connection error:', err);   \n        process.exit(1);  \n      }};\n      export default connectDB;"
    }
  ]
}

START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START QUESTION
${question}
END OF QUESTION

AI will never assume, guess or propose anything out of the context for refactoring. 
AI will never produce refactored code that will break or could potentially change application.
AI will only produce minor helpful better practice refactor in the context files.
AI will only refactor the code file inside the context block.
`
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'refactor_schema',
          strict: true,
          schema: refactorSchema
        }
      }
    });

    const schemaRefactorDataResponse = JSON.parse(schemaCompletion.choices[0].message.content);
    const schemaRefactorData: Refactor[] = schemaRefactorDataResponse.refactors.map((r: any) => ({
      filepath: r.filepath,
      refactor: r.refactor
    }));

    console.log(schemaRefactorData);
    return schemaRefactorData;

  } catch (err) {
    console.error('Error while scanning or creating issues:', err);
    return [];
  }
}
