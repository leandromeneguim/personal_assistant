import { useQuery } from "@tanstack/react-query";
import { Assistant } from "@shared/schema";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  MessageSquare,
  FileText,
  Calendar,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: assistants } = useQuery<Assistant[]>({
    queryKey: ["/api/assistants"],
  });

  const stats = [
    {
      title: "Atendentes Ativos",
      value: assistants?.length ?? 0,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Conversas",
      value: "89",
      icon: MessageSquare,
      color: "text-green-500",
    },
    {
      title: "Documentos",
      value: "12",
      icon: FileText,
      color: "text-purple-500",
    },
    {
      title: "Eventos",
      value: "4",
      icon: Calendar,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button
              onClick={() => setLocation("/settings")}
              className="gap-2"
            >
              <PlusCircle className="h-5 w-5" />
              Novo Atendente
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
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
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Seus Atendentes</CardTitle>
            </CardHeader>
            <CardContent>
              {assistants?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Você ainda não tem atendentes configurados.
                  <br />
                  <Button
                    variant="link"
                    onClick={() => setLocation("/settings")}
                    className="mt-2"
                  >
                    Crie seu primeiro atendente
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assistants?.map((assistant) => (
                    <Card key={assistant.id}>
                      <CardHeader>
                        <CardTitle>{assistant.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {assistant.personality}
                        </p>
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() => setLocation(`/chat?assistant=${assistant.id}`)}
                        >
                          Iniciar Chat
                        </Button>
                      </CardContent>
                    </Card>
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
