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
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Event = {
  id: number;
  title: string;
  date: Date;
};

export default function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    
    if (date && title) {
      setEvents([...events, { id: Date.now(), title, date }]);
      setIsDialogOpen(false);
    }
  };

  const eventsForDate = events.filter(
    (event) => event.date.toDateString() === date?.toDateString()
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Agenda</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Novo Evento</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Evento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <Label htmlFor="title">Título do Evento</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label>Data Selecionada</Label>
                  <Input
                    value={date?.toLocaleDateString()}
                    disabled
                  />
                </div>
                <Button type="submit">Adicionar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-8">
          <Card>
            <CardContent className="p-4">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Eventos para {date?.toLocaleDateString()}
              </CardTitle>
              <CardDescription>
                Gerencie os eventos do seu atendente virtual
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eventsForDate.length === 0 ? (
                <p className="text-muted-foreground">
                  Nenhum evento para esta data
                </p>
              ) : (
                <div className="space-y-4">
                  {eventsForDate.map((event) => (
                    <Card key={event.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {event.title}
                        </CardTitle>
                        <CardDescription>
                          {event.date.toLocaleTimeString()}
                        </CardDescription>
                      </CardHeader>
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
