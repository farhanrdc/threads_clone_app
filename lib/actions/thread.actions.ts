"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
  }
  
export async function createThread({ text, author, communityId, path }: Params) {
     try {
        connectToDB()
        const createdThread = await Thread.create({
            text,
            author,
            community: null, // Assign communityId if provided, or leave it null for personal account
            
        })

        //Update User Model
        await User.findByIdAndUpdate(author, {
            $push: {threads: createdThread._id} //push to spesifik user  who create the thread post
        })

        revalidatePath(path)

     } catch (error: any) {
        throw new Error(`Failed to create thread: ${error.message}`);
     }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
   connectToDB()
   
   // Menghitung the number of posts to skip
   const skipAmount = (pageNumber - 1 ) * pageSize

   //fetch the posts that have no parents(top-level threads)
   const postQuery = Thread.find({parentId: {$in: [null, undefined]}})
      .sort({createdAt: 'desc'})
      .skip(skipAmount)
      .limit(pageSize)
      .populate({path: 'author', model: User})
      .populate({
         path: 'children',
         populate: {
            path: 'author', 
            model: User,
            select: "_id name parentId image"
         }
      })
   
   const totalPostCount = await Thread.countDocuments({parentId: {$in: [null, undefined]}})

   const posts = await postQuery.exec()

   const isNext = totalPostCount > skipAmount + posts.length

   return {posts, isNext}
}

export async function fetchThreadById(id:string) {
   connectToDB()
   try {
      const thread = await Thread.findById(id)
        .populate({
          path: "author",
          model: User,
          select: "_id id name image",
        }) // Populate the author field with _id and username
        .populate({
          path: "children", // Populate the children field
          populate: [
            {
              path: "author", // Populate the author field within children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
            {
              path: "children", // Populate the children field within children
              model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
              populate: {
                path: "author", // Populate the author field within nested children
                model: User,
                select: "_id id name parentId image", // Select only _id and username fields of the author
              },
            },
          ],
        })
        .exec();
  
      return thread;
    } catch (error:any) {
      throw new Error(`Error Fetching thread: ${error.message}`)
    }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB()
  try {
    // Find the original thread by its ID
    const originalThread = await Thread.findById(threadId)

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create the new comment thread
    const commentThread = new Thread({
      text:commentText,
      author:userId,
      parentId:threadId
    })

      // Save the comment thread to the database
    const saveCommentThread = await commentThread.save()

     // Add the comment thread's ID to the original thread's children array
     originalThread.children.push(saveCommentThread._id)

    // Save the updated original thread to the database
    await originalThread.save()

    revalidatePath(path)

  } catch (error:any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}
