import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiRobot2Line } from "react-icons/ri";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Barra de navegação */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <RiRobot2Line className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Assistant.ai</span>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Acessar</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Escolha uma opção</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = "/trial"}
                >
                  Solicitar versão de teste
                </Button>
                <Button
                  className="w-full"
                  onClick={() => window.location.href = "/auth"}
                >
                  Gerenciar meus atendentes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container pt-24 pb-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="space-y-8">
            <h1 className="text-4xl font-bold lg:text-6xl">
              Revolucione seu Atendimento com IA
            </h1>
            <p className="text-lg text-muted-foreground">
              Crie atendentes virtuais personalizados que interagem naturalmente com seus clientes no WhatsApp e Instagram. Treine-os com seus documentos e automatize seu suporte com inteligência artificial.
            </p>
            <div className="flex gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="font-semibold">
                    Começar agora
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Escolha uma opção</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = "/trial"}
                    >
                      Solicitar versão de teste
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => window.location.href = "/auth"}
                    >
                      Gerenciar meus atendentes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="lg">
                Saiba mais
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-[500px] h-[400px] rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <RiRobot2Line className="h-32 w-32 text-primary/40" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-12">
        <h2 className="text-3xl font-bold text-center mb-12">
          Por que escolher Assistant.ai?
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Personalização Completa",
              description: "Crie atendentes com personalidades únicas que se adequam perfeitamente ao seu negócio."
            },
            {
              title: "Integração com Documentos",
              description: "Treine seus atendentes com seus próprios documentos, PDFs e planilhas."
            },
            {
              title: "Gestão de Agenda",
              description: "Integração com calendário para gerenciamento automático de compromissos."
            },
          ].map((feature, index) => (
            <div key={index} className="relative p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
