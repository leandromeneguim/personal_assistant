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
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Assistant } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Users, MessageSquare, Bot, Settings as SettingsIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type Stats = {
  totalUsers: number;
  activeUsers: number;
  totalAssistants: number;
  totalChats: number;
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [defaultModel, setDefaultModel] = useState("deepseek");

  const { data: stats, isLoading: isLoadingStats } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (data: { defaultModel: string }) => {
      const res = await apiRequest("POST", "/api/admin/config", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso",
      });
    },
  });

  const statsCards = [
    {
      title: "Total de Usuários",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Usuários Ativos",
      value: stats?.activeUsers ?? 0,
      icon: Users,
      color: "text-green-500",
    },
    {
      title: "Total de Atendentes",
      value: stats?.totalAssistants ?? 0,
      icon: Bot,
      color: "text-purple-500",
    },
    {
      title: "Total de Conversas",
      value: stats?.totalChats ?? 0,
      icon: MessageSquare,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      stat.value
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Configurações Globais
              </CardTitle>
              <CardDescription>
                Configure as opções globais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Modelo de IA Padrão</label>
                  <Select
                    value={defaultModel}
                    onValueChange={(value) => {
                      setDefaultModel(value);
                      updateConfigMutation.mutate({ defaultModel: value });
                    }}
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Limite de Atendentes</label>
                  <Input
                    type="number"
                    min="1"
                    defaultValue={user?.maxAssistants}
                    onChange={(e) => updateUser({
                      maxAssistants: parseInt(e.target.value)
                    })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Plataformas Permitidas</label>
                  <div className="space-y-2">
                    {['web', 'whatsapp', 'telegram', 'messenger'].map((platform) => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Checkbox
                          checked={user?.allowedPlatforms?.includes(platform)}
                          onCheckedChange={(checked) => {
                            const platforms = [...(user?.allowedPlatforms || [])];
                            if (checked) {
                              platforms.push(platform);
                            } else {
                              const index = platforms.indexOf(platform);
                              if (index > -1) platforms.splice(index, 1);
                            }
                            updateUser({ allowedPlatforms: platforms });
                          }}
                        />
                        <label className="text-sm">{platform.charAt(0).toUpperCase() + platform.slice(1)}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                    <SelectItem value="perplexity">Perplexity</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários Recentes
              </CardTitle>
              <CardDescription>
                Lista dos últimos usuários registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {users?.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.subscription}
                        </div>
                      </div>
                      {user.isAdmin && (
                        <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Admin
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
