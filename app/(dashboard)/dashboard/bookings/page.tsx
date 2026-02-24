"use client";

import { useState } from "react";
import { fetchFreeSlotsAction, bookSlotAction, cancelBookingAction } from "@/actions/clinic.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CalendarSearch, CalendarCheck, CalendarX } from "lucide-react";

export default function BookingsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  const handleGetSlots = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("slots");
    const formData = new FormData(e.currentTarget);
    const res = await fetchFreeSlotsAction(
      formData.get("doctorId") as string,
      formData.get("addressId") as string,
      formData.get("startDate") as string,
      formData.get("endDate") as string
    );
    setResults(prev => ({ ...prev, slots: res }));
    setLoading(null);
  };

  const handleBookSlot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("book");
    const formData = new FormData(e.currentTarget);
    const payload = {
      patient_id: Number(formData.get("patientId")),
      healthInsuranceCode: Number(formData.get("healthInsuranceCode")),
      obs: "Agendado via Dashboard",
      appointmentType: 1, external_id: "", address_service_id: 1, consultationType: 1    
    };
    const res = await bookSlotAction(
      formData.get("doctorId") as string,
      formData.get("addressId") as string,
      formData.get("slotStart") as string, 
      payload
    );
    setResults(prev => ({ ...prev, book: res }));
    setLoading(null);
  };

  const handleCancelBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("cancel");
    const formData = new FormData(e.currentTarget);
    const res = await cancelBookingAction(
      formData.get("doctorId") as string,
      formData.get("addressId") as string,
      formData.get("bookingId") as string
    );
    setResults(prev => ({ ...prev, cancel: res }));
    setLoading(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
        <p className="text-muted-foreground mt-2">Gerencie horários, marque consultas e processe cancelamentos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card: Buscar Slots */}
        <Card className="bg-background/50 backdrop-blur-md border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarSearch className="w-5 h-5 text-chart-1" /> Slots Livres</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGetSlots} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2"><Label>ID Médico</Label><Input name="doctorId" required className="bg-background/50"/></div>
                <div className="space-y-2"><Label>ID Endereço</Label><Input name="addressId" defaultValue="1" required className="bg-background/50"/></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2"><Label>Início</Label><Input name="startDate" type="date" required className="bg-background/50"/></div>
                <div className="space-y-2"><Label>Fim</Label><Input name="endDate" type="date" required className="bg-background/50"/></div>
              </div>
              <Button type="submit" className="w-full" disabled={loading === "slots"}>
                {loading === "slots" ? <Loader2 className="animate-spin w-4 h-4" /> : "Buscar Agenda"}
              </Button>
            </form>
            {results.slots && <pre className="mt-4 bg-muted/50 p-2 rounded text-xs overflow-auto max-h-40">{JSON.stringify(results.slots, null, 2)}</pre>}
          </CardContent>
        </Card>

        {/* Card: Agendar */}
        <Card className="bg-background/50 backdrop-blur-md border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarCheck className="w-5 h-5 text-primary" /> Nova Consulta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBookSlot} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2"><Label>ID Médico</Label><Input name="doctorId" required className="bg-background/50"/></div>
                <div className="space-y-2"><Label>ID Endereço</Label><Input name="addressId" defaultValue="1" required className="bg-background/50"/></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2"><Label>ID Paciente</Label><Input name="patientId" required className="bg-background/50"/></div>
                <div className="space-y-2"><Label>ID Convênio</Label><Input name="healthInsuranceCode" required className="bg-background/50"/></div>
              </div>
              <div className="space-y-2"><Label>Horário ISO</Label><Input name="slotStart" placeholder="2026-03-01T09:00:00-03:00" required className="bg-background/50"/></div>
              <Button type="submit" variant="default" className="w-full" disabled={loading === "book"}>
                {loading === "book" ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirmar Marcação"}
              </Button>
            </form>
            {results.book && <pre className="mt-4 bg-muted/50 p-2 rounded text-xs overflow-auto max-h-40">{JSON.stringify(results.book, null, 2)}</pre>}
          </CardContent>
        </Card>

        {/* Card: Cancelar */}
        <Card className="bg-background/50 backdrop-blur-md border-destructive/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><CalendarX className="w-5 h-5" /> Cancelar/Desmarcar</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCancelBooking} className="space-y-4">
              <div className="space-y-2"><Label>ID Médico</Label><Input name="doctorId" required className="bg-background/50"/></div>
              <div className="space-y-2"><Label>ID Endereço</Label><Input name="addressId" defaultValue="1" required className="bg-background/50"/></div>
              <div className="space-y-2"><Label>ID do Agendamento</Label><Input name="bookingId" required className="bg-background/50"/></div>
              <Button type="submit" variant="destructive" className="w-full" disabled={loading === "cancel"}>
                {loading === "cancel" ? <Loader2 className="animate-spin w-4 h-4" /> : "Excluir Agendamento"}
              </Button>
            </form>
            {results.cancel && <pre className="mt-4 bg-destructive/10 p-2 rounded text-xs text-destructive overflow-auto max-h-40 border border-destructive/20">{JSON.stringify(results.cancel, null, 2)}</pre>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}