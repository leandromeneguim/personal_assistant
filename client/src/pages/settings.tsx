import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false);
  const { data: assistants } = useQuery<Assistant[]>({
    queryKey: ["/api/assistants"],
  });
  const [selectedPlatform, setSelectedPlatform] = useState(user?.allowedPlatforms?.[0] || 'web');
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [modelType, setModelType] = useState("deepseek"); // Default model type
  const [temperature, setTemperature] = useState(0.5); // Default creativity level
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const createAssistantMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/assistants", data);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Assistente criado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assistants"] });
      setIsCreatingAssistant(false);
      setName("");
      setDescription("");
      setPersonality("");
      setModelType("deepseek"); //Reset to default
      setTemperature(0.5); //Reset to default
      setSelectedFiles(null);
    },
  });

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Configurações</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <Input value={user?.username} disabled />
                </div>
                <div>
                  <label className="text-sm font-medium">Plano</label>
                  <Input value={user?.subscription} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seus Atendentes ({assistants?.length || 0}/{user?.maxAssistants || 1})</CardTitle>
            </CardHeader>
            <CardContent>
              {(assistants?.length || 0) < (user?.maxAssistants || 1) ? (
                <Button onClick={() => setIsCreatingAssistant(true)} className="mb-4">
                  Criar Novo Atendente
                </Button>
              ) : (
                <p className="text-yellow-600 mb-4">Limite de atendentes atingido</p>
              )}
              
              <div className="grid gap-4">
                {assistants?.map((assistant) => (
                  <Card key={assistant.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold">{assistant.name}</h3>
                          <p className="text-sm text-muted-foreground">{assistant.personality}</p>
                        </div>
                        <Button variant="outline" onClick={() => setLocation(`/chat?assistant=${assistant.id}`)}>
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integração com Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Plataforma Ativa</label>
                  <Select disabled value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">Web Chat</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Contate o suporte para ativar outras plataformas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isCreatingAssistant} onOpenChange={setIsCreatingAssistant}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Assistente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do assistente"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Personalidade</label>
                <Input
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="Ex: Profissional, Amigável, Técnico..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Modelo de IA</label>
                <Select value={modelType} onValueChange={setModelType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek">DeepSeek (Recomendado)</SelectItem>
                    <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Criatividade</label>
                <div className="flex items-center gap-4">
                  <Slider 
                    value={[temperature]} 
                    onValueChange={(value) => setTemperature(value[0])}
                    min={0} 
                    max={1} 
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">{temperature}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Documentos de Treinamento</label>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  accept=".pdf,.txt,.doc,.docx,.xls,.xlsx"
                />
              </div>
              <Button
                onClick={() => {
                  const formData = new FormData();
                  formData.append("name", name);
                  formData.append("description", description);
                  formData.append("personality", personality);
                  formData.append("model_type", modelType);
                  formData.append("temperature", temperature.toString());
                  if (selectedFiles) {
                    for (let i = 0; i < selectedFiles.length; i++) {
                      formData.append("files", selectedFiles[i]);
                    }
                  }
                  createAssistantMutation.mutate(formData);
                }}
              >
                Criar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}