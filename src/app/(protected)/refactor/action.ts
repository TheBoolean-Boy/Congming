"use server"


import { refactorCodebase } from "@/lib/refactor";
import { Octokit } from "octokit";


const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const createBranch = async (owner: string, repo: string, newBranch: string, baseBranch: string = "main") => {
  try {
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`,
    });

    const baseSha = refData.object.sha;

    const response = await octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranch}`,
      sha: baseSha,
    });

    // console.log(`Branch '${newBranch}' created from ${baseBranch}`);
    return response;
  } catch (error) {
    console.error("Error creating branch:", error);
  }
};


function isFile(
  data: any
): data is { type: "file"; sha: string; content: string; path: string } {
  return !Array.isArray(data) && data.type === "file" && typeof data.sha === "string";
}

export const refactorAgent = async (githubUrl: string, projectId: string) => {
  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) throw new Error("Invalid Github URL");

  const baseBranch = "main";
  const dataDog = await refactorCodebase(githubUrl, projectId);

  const filePath = dataDog![0]?.filepath;
  const refactorRequest = dataDog![0]?.refactor;

  if (!filePath || !refactorRequest) throw new Error("No file or refactor request found");

  // console.log(filePath);
  // console.log(refactorRequest);

  
  const branchName = `refactor/${Date.now()}`;
  await createBranch(owner, repo, branchName);

  const { data: fileData } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: filePath,
    ref: baseBranch,
  });

  if (!isFile(fileData)) {
    throw new Error(`File not found or path points to a directory: ${filePath}`);
  }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: "refactor: modified old code with better modern practices",
    // content: refactorRequest, 
    content: Buffer.from(refactorRequest, "utf-8").toString("base64"),

    branch: branchName,
    sha: fileData.sha, 
  });

  // console.log(`Refactor PR raised on branch ${branchName}`);
};



