import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Assistant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAssistantSchema } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";


export default function Settings() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: assistants } = useQuery<Assistant[]>({
    queryKey: ["/api/assistants"],
  });

  const form = useForm({
    resolver: zodResolver(insertAssistantSchema),
    defaultValues: {
      name: "",
      personality: "",
      modelType: "deepseek", // Added default value
      config: { temperature: 0.5 }, // Added default value
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/assistants", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assistants"] });
      form.reset();
      toast({
        title: "Sucesso",
        description: "Atendente criado com sucesso",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/assistants/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assistants"] });
      setEditingId(null);
      toast({
        title: "Sucesso",
        description: "Atendente atualizado com sucesso",
      });
    },
  });

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Atendente</CardTitle>
              <CardDescription>
                Configure a personalidade e comportamento do seu atendente virtual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) =>
                    createMutation.mutate(data)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Atendente</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personalidade</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Descreva a personalidade do atendente..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="modelType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo de IA</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o modelo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deepseek">DeepSeek (Gratuito)</SelectItem>
                            <SelectItem value="perplexity">Perplexity (Em breve)</SelectItem>
                            <SelectItem value="openai">OpenAI (Em breve)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="config.temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Criatividade das respostas</FormLabel>
                        <FormControl>
                          <Slider
                            defaultValue={[field.value]}
                            max={1}
                            min={0}
                            step={0.1}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          0 = mais objetivo, 1 = mais criativo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Criar Atendente"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assistants?.map((assistant) => (
            <Card key={assistant.id}>
              <CardHeader>
                <CardTitle>{assistant.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {editingId === assistant.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      updateMutation.mutate({
                        id: assistant.id,
                        data: {
                          name: formData.get("name"),
                          personality: formData.get("personality"),
                        },
                      });
                    }}
                    className="space-y-4"
                  >
                    <Input
                      name="name"
                      defaultValue={assistant.name}
                      placeholder="Nome do Atendente"
                    />
                    <Textarea
                      name="personality"
                      defaultValue={assistant.personality}
                      placeholder="Personalidade"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                      >
                        Salvar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      {assistant.personality}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setEditingId(assistant.id)}
                    >
                      Editar
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}