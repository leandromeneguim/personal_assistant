import OpenAI from "openai";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function handleChat(message: string, assistantId: number) {
  const assistant = await storage.getAssistants(assistantId);
  if (!assistant) throw new Error("Assistant not found");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a virtual assistant with the following personality: ${assistant.personality}. Respond accordingly.`,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  return response.choices[0].message.content;
}
