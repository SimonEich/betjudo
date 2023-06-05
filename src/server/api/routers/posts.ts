import { clerkClient } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/dist/server";
import { TRPCError } from "@trpc/server";
import Input from "postcss/lib/input";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) =>{

  return {
    id: user.id, 
    username: user.username, 
    profilePicture: user.profileImageUrl,
}}

export const postsRouter = createTRPCRouter({
    getAll: publicProcedure.query( async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
    });

    const users = (await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
    ).map(filterUserForClient);

  return posts.map((post) => {
    const author =  users.find((user) => user.id === post.authorId);

    if (!author || !author.username) 
      throw new TRPCError({
      code:"INTERNAL_SERVER_ERROR", 
      message: "Author for post not found",
  });



    return {
    post,
    author: {
      ...author,
      username: author.username,
     },
    };
  });
  }),

  create: privateProcedure
  .input(
    z.object({
      content: z.string().min(1).max(280),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const authorId = ctx.userId;

    const post = await ctx.prisma.post.create({
      data: {
        authorId,
        content : input.content,
      },
    });

    return post;
  }),
});