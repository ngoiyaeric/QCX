'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '@/lib/types'
import { Redis } from '@upstash/redis'
import { Index } from '@upstash/vector'
import { RAGChat } from "@upstash/rag-chat";



// Initialize a new Redis instance with environment variables for URL and token
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
})

const ragChat = new RAGChat();

async function chatAboutMachineLearning() {
  const response = await ragChat.chat("Tell me about machine learning");
  return response;
}


// Function to get chats for a specific user
export async function getChats(userId?: string | null) {
  if (!userId) {
    return [] // Return an empty array if there is an error
  }

  try {
    // Start a Redis pipeline to batch commands
    const pipeline = redis.pipeline()
    // Get the list of chat IDs for the user, sorted in reverse order
    const chats: string[] = await redis.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
    })


    // For each chat ID, add a command to the pipeline to get all its fields
    for (const chat of chats) {
      pipeline.hgetall(chat)
    }
    
    // Execute the pipeline and get the results
    const results = await pipeline.exec()

    return results as Chat[]  // Return the results cast as an array of Chat objects
  } catch (error) {
    return [] // Return an empty array if there is an error
  }
}

// Function to get a specific chat by its ID
export async function getChat(id: string, userId: string = 'anonymous') {
  
// Get all fields of the chat with the given ID
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat) {
    return null // Return null if the chat is not found
  }

  return chat // Return the chat object
}


// Function to clear all chats for a specific user
export async function clearChats(
  //replace with supabase userID 
  userId: string = 'anonymous'
): Promise<{ error?: string }> {
    // Get the list of chat IDs for the user, sorted in reverse order
  const chats: string[] = await redis.zrange(`user:chat:${userId}`, 0, -1)
  // Return an error message if no chats are found
  if (!chats.length) {
    return { error: 'No chats to clear' }
  }

   // Start a Redis pipeline to batch commands
  const pipeline = redis.pipeline()

    // For each chat ID, add commands to the pipeline to delete the chat and remove its reference from the sorted set
  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${userId}`, chat)
  }
  
  // Execute the pipeline
  await pipeline.exec()

// Revalidate the path to refresh the page
  revalidatePath('/')
// Redirect to the homepage
  redirect('/')
}

// Function to save a chat for a specific user
export async function saveChat(chat: Chat, userId: string = 'anonymous') {

// Start a Redis pipeline to batch commands
  const pipeline = redis.pipeline()
  // Set all fields of the chat with the given ID
  pipeline.hmset(`chat:${chat.id}`, chat)
  // Add the chat ID to the sorted set with the current timestamp as the key and the chat ID as the value
  pipeline.zadd(`user:chat:${chat.userId}`, {
    score: Date.now(),
    member: `chat:${chat.id}`
  })


  // Execute the pipeline
  await pipeline.exec()
}


// Function to get a shared chat by its ID
export async function getSharedChat(id: string) {
  
// Get all fields of the chat with the given ID
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null // Return null if the chat is not found or not shared
  }

  return chat // Return the shared chat object
}


// Function to share a chat for a specific user
export async function shareChat(id: string, userId: string = 'anonymous') {
  // Get all fields of the chat with the given ID
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

// Return null if the chat is not found or does not belong to the user
  if (!chat || chat.userId !== userId) {
    return null
  }

// Create a payload with the chat data and a share path
  const payload = {
    ...chat,
    sharePath: `/share/${id}`
  }

  // Set all fields of the chat with the updated payload
  await redis.hmset(`chat:${id}`, payload)

  return payload
}
