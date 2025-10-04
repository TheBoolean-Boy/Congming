# Introduction
Congming is a super useful agentic codebase interaction and intelligence platform. It is created to help developers interact with not so familiar or newer codebases with ease and speed. For founders with small, fast and hard teams it is very useful since it can sigficantly reduce the project onboarding time for new hires. For Developers congming can will drastically reduce the time require get familiar and make intial interactions with codebases. It has lightning fast response time across all pipelines and highly sophisticated agentic workflows thanks to **Cerebras** cloud inferencing sdk and **Llama** models. 
Live Link: [CongmingAI](https://congming-ai.vercel.app)

## screenshots of congming in action
<img width="1892" height="863" alt="Screenshot 2025-10-04 121646" src="https://github.com/user-attachments/assets/35023165-8c0b-42dc-9256-3eba94e790dc" />
<img width="1919" height="860" alt="Screenshot 2025-10-04 121321" src="https://github.com/user-attachments/assets/df251b27-2537-4f1f-b6fb-5443a4660bfe" />
<img width="1917" height="867" alt="Screenshot 2025-10-04 121515" src="https://github.com/user-attachments/assets/c75e2db1-7cd3-40b0-9af7-ca6e213fa085" />
<img width="1919" height="879" alt="Screenshot 2025-10-04 121622" src="https://github.com/user-attachments/assets/346e635e-ff59-4741-896b-ecca95d13f8d" />

# Documentation!
This is comprehensive documentation will have 3 parts. 
1. Setup
2. Architecture
3. Usage


# Setup

Step1: Clone the repository to your local or cloud computer 

    https://github.com/TheBoolean-Boy/Congming

Step 2: Install the dependecies using bun or npm

    bun install

Step 3: Load the environment variables

 - I have used NeonDB as my database and pgVector as my Vector DB. You will need a connection string to a DB of your choice
 - An example of all the required environment varibales can be found in the repository root directory
 
Step 4: Push the prisma schema to your database using

    bun prisma db push

    bun prisma generate

Step 6: Launch the local server instance

    bun dev

If you face any queries shoot me a dm on  [X](https://x.com/saswatrath02)

# Architecture
Congming has four main 5 main pillars in it's architecture.
1. QNA RAG Pipeline
2. Codebase Refactor Agent
3. Codebase Scanner Agent
4. Audio transcription pipeline
5. Commit-log summarizer


## QnA RAG Pipeline

<img width="1769" height="890" alt="QNA Rag Pipeline" src="https://github.com/user-attachments/assets/a3c8096f-4a6d-4029-b839-7caa05e39b18" />

It uses langchain to load github repository onto the server for data ingestion into pipeline. The ingested data is the form documents that langchain creates. It contains the source code of all the files from the repository, the file paths and other meta data. The data is passed through a filter which summarizes the each code file.

The summarized data is then fed to the Gemini Embedding 001 model to create vector embeddings of each and every file/doc summary.
The vectors so created are then stored in the vector database along with other details like the source code, file path and other metadata. In this case I have used  pgVector as my Vector DB.

When ever the user asks Congming any question about the codebase, it converts the query/question into a vector and performs semantic search in the vector space (using cosine similarity search in this case) and retrieves the relevant context (i.e. file path, source code, summary). 

The retrieved context along with a system prompt is then fed to the Cerebrus chat completion endpoint where Congmings leverages their ultra fast inferencing with Llama 3.3 70B to generate 100% relevant answers to user queries.
 

## Refactor Agent (Tool call pattern)

This is one of the two agent Congming uses to interact with your codebase. It's designed upon the tool calling agentic design pattern.

<img width="1809" height="883" alt="Refactor Agent" src="https://github.com/user-attachments/assets/790e374b-1dfc-43f3-a8e4-b6bd991f24e8" />

It needs two things. The projectId(auto-generated) and github URL of the remote repository which was already acquired by our system. These two things are passed down to the knowledge base which is nothing but the vector space consisting of codebase doc vectors. 

A system question exists which perpetuates to find out badly written code files. The question vector runs similarity search through the vector space and takes out potentially badly coded files from codebase.

Relevant files with their file path and source code are fed to the agent which has a system prompt and structured output that contains the entailed details for tool calling. The agent takes in the context with the system prompt and additional details for tool calling like tool_choice:[] and tool_name:[] etc. (reference: [Cerebras docs](https://inference-docs.cerebras.ai/capabilities/tool-use)) and feeds it at inferencing level to Llama 3.3 70B. In accordance to the structured output received from the LLM it takes the decision to call the need to refactor code and raise PR to the remote repository.

If the output schema is validated the agents gets the "sha" of the root branch, a secured hashed value needed to interact the PR endpoints of the github repo. This sha is used to create a new local branch by the agent onto which it commits the refactored code it received from the LLM.  After commiting, the agents calls the tool to create a PR request in a remote repo by providing all other additional required info it gathere through the process.

## Scanner (Issue raiser) Agent - Tool call

Congming uses this agent to interact with your codebase as well, as in raising issues.
<img width="1794" height="875" alt="Scan Agent Workflow" src="https://github.com/user-attachments/assets/700e9d38-4d9f-4134-8692-70e9e69c945f" />
Similar to the refactor agent, it needs two things. The projectId(auto-generated) and github URL of the remote repository which was already acquired by our system. These two things are passed down to the knowledge base which is nothing but the vector space consisting of codebase doc vectors. 
A system question exists which perpetuates to find out poorly configured code files. The question vector runs similarity search through the vector space and takes out potential issues that might cause vulnerability holes or bugs around the codebase.

Relevant files with their file path and source code are fed to the agent which has a system prompt and structured output that contains the entailed details for tool calling. The agent takes in the context with the system prompt and additional details for tool calling like tool_choice:[] and tool_name:[] etc. (reference: [Cerebras docs](https://inference-docs.cerebras.ai/capabilities/tool-use)) and feeds it at inferencing level to Llama 3.3 70B. In accordance to the structured output received from the LLM it takes the decision to call issue raising tool to the remote repository.

If the output schema is validated, it checks for the risk level of issues, if it's worth raising an issue. If so, it call the issue creation tool with all the additional required information required to do so.

## Commit-Log summarization

<img width="1429" height="749" alt="Commit-Log Workflow" src="https://github.com/user-attachments/assets/5100bf39-8bc1-44b1-be66-652e35296a5a" />

Congming always fetches the latest commits into a repository in your projects section and summarizes all the chages for you, so that you don't have to look through the details. It's work flow is quite simple compared to the above three. 

It fetches the latest commits, checks the by referring the database for latest unprocessed commits. Summarizes the the unprocessed commits by using Llama 4 Maverick through cerebras cloud inferencing. The reason for using thing particular model is that it specializes in following instruction-following based tasks [reference: Cerebras docs](https://inference-docs.cerebras.ai/models/llama-4-maverick), in this case congming provides it with a specific instruction base to summarize commits.

## Audio transcription pipeline

If you missed any of your meetings, upload the audio to Congming and it transcribe the important discussions to you with timestamps.
<img width="1547" height="832" alt="Audio Pipeline" src="https://github.com/user-attachments/assets/4e379d27-478d-494c-8fb2-c4dcd7bb96a2" />

The recorded meeting audio is uploaded to firebase. The firebase webhook sends back a URL to the uploaded file back to Congming's server. The audio URL is then fed to the the Assembly AI which sends back documents in it's format. The document is the fed as context to Llama 3.1 8B to produce detailed transcription with time stamps.

## Usage

Check out the usage here: [Demo Video](https://www.youtube.com/@sy667wh/videos)


