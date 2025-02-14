
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

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
              <CardTitle>Criar Novo Assistente</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsCreatingAssistant(true)}>
                Criar Assistente
              </Button>
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
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição do assistente"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Documentos</label>
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
