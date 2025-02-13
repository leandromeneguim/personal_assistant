import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Assistant } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Send, Loader2 } from "lucide-react";

type Message = {
  id: number;
  content: string;
  isUser: boolean;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const { data: assistants } = useQuery<Assistant[]>({
    queryKey: ["/api/assistants"],
  });

  const chatMutation = useMutation({
    mutationFn: async ({ message, assistantId }: { message: string; assistantId: number }) => {
      const res = await apiRequest("POST", "/api/chat", { message, assistantId });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: data.response,
          isUser: false,
        },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || !assistants?.[0]) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        content: input,
        isUser: true,
      },
    ]);

    chatMutation.mutate({
      message: input,
      assistantId: assistants[0].id,
    });

    setInput("");
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">
            Chat com {assistants?.[0]?.name ?? "Atendente"}
          </h1>
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-[80%] p-3 ${
                  message.isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.content}
              </Card>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-3 bg-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
              </Card>
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button
              onClick={handleSend}
              disabled={chatMutation.isPending || !input.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
