"use client";

import { useState } from "react";
import { 
  fetchSingleDoctorAction, fetchSinglePatientAction, checkPatientExistsAction, 
  createPatientAction, fetchFreeSlotsAction, bookSlotAction 
} from "@/actions/clinic.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function DebugPanel() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  // --- Handlers Anteriores ---
  const handleFetchDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("doctor");
    const formData = new FormData(e.currentTarget);
    const res = await fetchSingleDoctorAction(formData.get("doctorId") as string);
    setResults(prev => ({ ...prev, doctor: res }));
    setLoading(null);
  };

  const handleFetchPatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("patient");
    const formData = new FormData(e.currentTarget);
    const res = await fetchSinglePatientAction(formData.get("patientId") as string);
    setResults(prev => ({ ...prev, patient: res }));
    setLoading(null);
  };

  const handleCheckExists = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("exists");
    const formData = new FormData(e.currentTarget);
    const res = await checkPatientExistsAction(formData.get("nin") as string, formData.get("birthday") as string);
    setResults(prev => ({ ...prev, exists: res }));
    setLoading(null);
  };

  // --- Novos Handlers ---
  const handleCreatePatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("createPatient");
    const formData = new FormData(e.currentTarget);
    
    // Payload simplificado para debug
    const payload = {
      name: formData.get("name"),
      nin: formData.get("nin"), // CPF
      birthday: formData.get("birthday"), // YYYY-MM-DD
      mobile: formData.get("mobile"),
      email: formData.get("email"),
      sex: "M", // mock
      maritalStatus: 3 // mock solteiro
    };

    const res = await createPatientAction(payload);
    setResults(prev => ({ ...prev, createPatient: res }));
    setLoading(null);
  };

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
      obs: "Teste via Dashboard Silvia",
      appointmentType: 1 // 1 = Consulta
    };

    const res = await bookSlotAction(
      formData.get("doctorId") as string,
      formData.get("addressId") as string,
      formData.get("slotStart") as string, // Ex: 2022-01-05T09:00:00-03:00
      payload
    );
    setResults(prev => ({ ...prev, book: res }));
    setLoading(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Buscar Médico */}
      <Card><CardHeader><CardTitle className="text-lg">1. Buscar Médico</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleFetchDoctor} className="flex gap-2 items-end">
            <div className="flex-1"><Label>ID Médico</Label><Input name="doctorId" placeholder="Ex: 8" required /></div>
            <Button type="submit" disabled={loading === "doctor"}>{loading === "doctor" ? <Loader2 className="animate-spin" /> : "Ir"}</Button>
          </form>
          {results.doctor && <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">{JSON.stringify(results.doctor, null, 2)}</pre>}
        </CardContent>
      </Card>

      {/* 2. Ver. Existência / Buscar Paciente */}
      <Card><CardHeader><CardTitle className="text-lg">2. Verificar CPF</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCheckExists} className="space-y-2">
            <div><Label>NIN / CPF</Label><Input name="nin" placeholder="Ex: 07846954660" required /></div>
            <div><Label>Data Nasc.</Label><Input name="birthday" type="date" required /></div>
            <Button type="submit" className="w-full" disabled={loading === "exists"}>{loading === "exists" ? <Loader2 className="animate-spin" /> : "Verificar"}</Button>
          </form>
          {results.exists && <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">{JSON.stringify(results.exists, null, 2)}</pre>}
        </CardContent>
      </Card>

      {/* 3. Criar Paciente */}
      <Card><CardHeader><CardTitle className="text-lg">3. Criar Paciente (Mock)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCreatePatient} className="space-y-2 text-sm">
            <div><Label>Nome Completo</Label><Input name="name" required /></div>
            <div className="flex gap-2">
              <div className="flex-1"><Label>CPF</Label><Input name="nin" required /></div>
              <div className="flex-1"><Label>Data Nasc.</Label><Input name="birthday" type="date" required /></div>
            </div>
            <Button type="submit" className="w-full" disabled={loading === "createPatient"}>{loading === "createPatient" ? <Loader2 className="animate-spin" /> : "Criar / Atualizar"}</Button>
          </form>
          {results.createPatient && <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">{JSON.stringify(results.createPatient, null, 2)}</pre>}
        </CardContent>
      </Card>

      {/* 4. Buscar Slots */}
      <Card><CardHeader><CardTitle className="text-lg">4. Buscar Slots Livres</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleGetSlots} className="space-y-2 text-sm">
            <div className="flex gap-2">
              <div className="flex-1"><Label>ID Med.</Label><Input name="doctorId" placeholder="Ex: 8" required /></div>
              <div className="flex-1"><Label>ID Endereço</Label><Input name="addressId" placeholder="Ex: 103" required /></div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1"><Label>Início</Label><Input name="startDate" type="date" required /></div>
              <div className="flex-1"><Label>Fim</Label><Input name="endDate" type="date" required /></div>
            </div>
            <Button type="submit" className="w-full" disabled={loading === "slots"}>{loading === "slots" ? <Loader2 className="animate-spin" /> : "Buscar Slots"}</Button>
          </form>
          {results.slots && <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">{JSON.stringify(results.slots, null, 2)}</pre>}
        </CardContent>
      </Card>

      {/* 5. Book Slot */}
      <Card className="lg:col-span-2"><CardHeader><CardTitle className="text-lg">5. Agendar Consulta (Book)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleBookSlot} className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <div><Label>ID Médico</Label><Input name="doctorId" placeholder="Ex: 8" required /></div>
              <div><Label>ID Endereço</Label><Input name="addressId" placeholder="Ex: 103" required /></div>
              <div><Label>ID Paciente</Label><Input name="patientId" placeholder="Ex: 1139" required /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Data/Hora Slot (ISO)</Label><Input name="slotStart" placeholder="2022-01-05T09:00:00-03:00" required /></div>
              <div><Label>ID Convênio</Label><Input name="healthInsuranceCode" placeholder="Ex: 12" required /></div>
            </div>
            <Button type="submit" className="w-full" variant="default" disabled={loading === "book"}>{loading === "book" ? <Loader2 className="animate-spin" /> : "Confirmar Agendamento"}</Button>
          </form>
          {results.book && <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">{JSON.stringify(results.book, null, 2)}</pre>}
        </CardContent>
      </Card>

    </div>
  );
}