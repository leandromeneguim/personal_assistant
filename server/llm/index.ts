import { chatWithDeepseek } from "./deepseek";
import { Assistant } from "@shared/schema";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function handleChat(message: string, assistant: Assistant): Promise<string> {
  const messages: Message[] = [
    {
      role: "system",
      content: `Você é um atendente virtual com a seguinte personalidade: ${assistant.personality}. Responda de acordo com essa personalidade.`,
    },
    {
      role: "user",
      content: message,
    },
  ];

  switch (assistant.modelType) {
    case "deepseek":
      return await chatWithDeepseek(messages, assistant.config);
    case "perplexity":
      // TODO: Implementar quando tivermos a chave da API
      throw new Error("Perplexity ainda não está configurado");
    case "openai":
      // TODO: Implementar quando tivermos a chave da API
      throw new Error("OpenAI ainda não está configurado");
    default:
      throw new Error(`Modelo ${assistant.modelType} não suportado`);
  }
}
