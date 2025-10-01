import z from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { pollCommits } from "@/lib/github"
import { indexGithubRepo } from "@/lib/github-loader"

export const projectRouter = createTRPCRouter({
  
  createProject: protectedProcedure.input(
    z.object({
      name: z.string(),
      githubUrl: z.string(),
      githubToken: z.string().optional()
    })
  ).mutation( async({ctx, input}) => {
    const project = await ctx.db.project.create({
      data:{
        name: input.name,
        githubUrl: input.githubUrl,
        userToProjects: {
          create:{
            userId: ctx.user.userId!
          }
        }
      }
    })

    await pollCommits(project.id)
    await indexGithubRepo(project.id, input.githubUrl, input.githubToken)
    return project
  }),

  getProject: protectedProcedure.query( async ({ctx}) => {
    return await ctx.db.project.findMany({
      where:{
        userToProjects:{
          some:{
            userId: ctx.user.userId!
          }
        },
        deletedAt: null
      }
    })
  }),

  getCommits: protectedProcedure.input(
    z.object({
      projectId: z.string()
    })
  ).query( async({ctx, input}) => {
    pollCommits(input.projectId).then().catch(console.error)
    return await ctx.db.commit.findMany({
      where:{
        projectId: input.projectId
      }
    })
  }),


  saveAnswer: protectedProcedure.input(
    z.object({
      projectId: z.string(),
      question: z.string(),
      answer: z.string(),
      fileReferences: z.any()
    })
  ).mutation( async( {ctx, input}) => {
    return await ctx.db.question.create({
      data:{
        answer: input.answer,
        question: input.question,
        fileReferences: input.fileReferences,
        projectId: input.projectId,
        userId: ctx.user.userId!
      }
    })
  }),

  getQuestions: protectedProcedure.input(z.object({
    projectId: z.string()
  })).query( async ({ctx, input}) => {
    const questions = await ctx.db.question.findMany({
      where:{
        projectId: input.projectId,
      },
      include:{
        user: true
      },
      orderBy:{
        createdAt: 'desc'
      }
    })
    return questions
  })


})