
import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type Stats = {
  totalUsers: number;
  activeUsers: number;
  totalAssistants: number;
  totalChats: number;
  usersBySubscription: Record<string, number>;
  totalInteractions: number;
  uniqueUsers: number;
};

type UserDetails = User & {
  interactions: number;
  lastActive: string;
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const { user: authUser } = useAuth();

  const { data: stats, isLoading: isLoadingStats } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<UserDetails[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: {
      id: number;
      maxAssistants: number;
      allowedPlatforms: string[];
      subscription: string;
    }) => {
      return apiRequest("POST", `/api/admin/users/${data.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedUser(null);
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
      title: "Total de Interações",
      value: stats?.totalInteractions ?? 0,
      icon: MessageSquare,
      color: "text-yellow-500",
    },
    {
      title: "Usuários Únicos",
      value: stats?.uniqueUsers ?? 0,
      icon: Users,
      color: "text-purple-500",
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

        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
            <CardDescription>Gerenciar usuários e permissões</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {users?.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-muted-foreground">
                        Plano: {user.subscription} • Atendentes: {user.maxAssistants}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedUser(user)}
                    >
                      Gerenciar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerenciar Usuário: {selectedUser?.username}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Plano</label>
                <Select
                  value={selectedUser?.subscription}
                  onValueChange={(value) =>
                    selectedUser &&
                    updateUserMutation.mutate({
                      ...selectedUser,
                      subscription: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Período de Teste</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Limite de Atendentes</label>
                <Input
                  type="number"
                  min="1"
                  value={selectedUser?.maxAssistants}
                  onChange={(e) =>
                    selectedUser &&
                    updateUserMutation.mutate({
                      ...selectedUser,
                      maxAssistants: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Plataformas Permitidas</label>
                <div className="space-y-2">
                  {['web', 'whatsapp', 'telegram', 'messenger'].map((platform) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedUser?.allowedPlatforms?.includes(platform)}
                        onCheckedChange={(checked) => {
                          if (!selectedUser) return;
                          const platforms = [...(selectedUser.allowedPlatforms || [])];
                          if (checked) {
                            platforms.push(platform);
                          } else {
                            const index = platforms.indexOf(platform);
                            if (index > -1) platforms.splice(index, 1);
                          }
                          updateUserMutation.mutate({
                            ...selectedUser,
                            allowedPlatforms: platforms,
                          });
                        }}
                      />
                      <label className="text-sm">
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
