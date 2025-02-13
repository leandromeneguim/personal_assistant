import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RiRobot2Line } from "react-icons/ri";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Usar useEffect para redirecionar após login bem-sucedido
  useEffect(() => {
    if (user) {
      console.log("User authenticated, redirecting to dashboard", user);
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const handleForgotPassword = () => {
    // TODO: Implementar recuperação de senha
    alert("Em breve! Por favor, entre em contato com o suporte.");
  };

  const onSubmit = (data: any) => {
    console.log("Attempting login with:", data.username);
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen w-full flex">
      <div className="flex-1 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <RiRobot2Line className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl">Assistant.ai</CardTitle>
            <CardDescription>
              Acesse sua conta para gerenciar seus atendentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuário</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  variant="link"
                  type="button"
                  className="px-0"
                  onClick={handleForgotPassword}
                >
                  Esqueci minha senha
                </Button>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 to-primary/10 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h2 className="text-4xl font-bold mb-4">
            Revolucione seu Atendimento
          </h2>
          <p className="text-lg text-muted-foreground">
            Gerencie seus atendentes virtuais e automatize seu suporte com
            inteligência artificial.
          </p>
        </div>
      </div>
    </div>
  );
}