"use client";

import { useState } from "react";
import { 
  fetchSingleDoctorAction, fetchSinglePatientAction, checkPatientExistsAction, 
  createPatientAction, fetchFreeSlotsAction, bookSlotAction, fetchInsuranceProvidersAction 
} from "@/actions/clinic.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function DebugPanel() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  const handleFetchDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("doctor");
    const res = await fetchSingleDoctorAction(new FormData(e.currentTarget).get("doctorId") as string);
    setResults(prev => ({ ...prev, doctor: res }));
    setLoading(null);
  };

  const handleFetchInsurances = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("insurances");
    const res = await fetchInsuranceProvidersAction();
    setResults(prev => ({ ...prev, insurances: res }));
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

  const handleCreatePatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("createPatient");
    const formData = new FormData(e.currentTarget);
    
    // Agora o Convênio é dinâmico, vindo do formulário
    const payload = {
      name: formData.get("name"),
      nin: formData.get("nin"), 
      birthday: formData.get("birthday"), 
      mobile: formData.get("mobile") || "",
      email: formData.get("email") || "",
      sex: "M", 
      maritalStatus: 3, 
      healthInsuranceCode: Number(formData.get("healthInsuranceCode")), // Puxa do input
      external_id: "" 
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
      appointmentType: 1, 
      external_id: "", 
      address_service_id: 1, 
      consultationType: 1    
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Buscar Convênios */}
      <Card><CardHeader><CardTitle className="text-lg">1. Buscar Convênios</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleFetchInsurances} className="flex gap-2 items-end">
            <Button type="submit" className="w-full" disabled={loading === "insurances"}>{loading === "insurances" ? <Loader2 className="animate-spin" /> : "Listar Todos os Convênios"}</Button>
          </form>
          {results.insurances && <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">{JSON.stringify(results.insurances, null, 2)}</pre>}
        </CardContent>
      </Card>

      {/* 2. Buscar Médico */}
      <Card><CardHeader><CardTitle className="text-lg">2. Buscar Médico</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleFetchDoctor} className="flex gap-2 items-end">
            <div className="flex-1"><Label>ID Médico</Label><Input name="doctorId" placeholder="Ex: 10073" required /></div>
            <Button type="submit" disabled={loading === "doctor"}>{loading === "doctor" ? <Loader2 className="animate-spin" /> : "Ir"}</Button>
          </form>
          {results.doctor && <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">{JSON.stringify(results.doctor, null, 2)}</pre>}
        </CardContent>
      </Card>

      {/* 3. Verificar CPF */}
      <Card><CardHeader><CardTitle className="text-lg">3. Verificar CPF</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCheckExists} className="space-y-2">
            <div><Label>NIN / CPF</Label><Input name="nin" placeholder="Ex: 05814436166" required /></div>
            <div><Label>Data Nasc.</Label><Input name="birthday" type="date" required /></div>
            <Button type="submit" className="w-full" disabled={loading === "exists"}>{loading === "exists" ? <Loader2 className="animate-spin" /> : "Verificar"}</Button>
          </form>
          {results.exists && <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">{JSON.stringify(results.exists, null, 2)}</pre>}
        </CardContent>
      </Card>

      {/* 4. Criar / Atualizar Paciente */}
      <Card><CardHeader><CardTitle className="text-lg">4. Atualizar Paciente (Setar Convênio)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCreatePatient} className="space-y-2 text-sm">
            <div><Label>Nome Completo</Label><Input name="name" required /></div>
            <div className="flex gap-2">
              <div className="flex-1"><Label>CPF</Label><Input name="nin" required /></div>
              <div className="flex-1"><Label>Data Nasc.</Label><Input name="birthday" type="date" required /></div>
            </div>
            <div><Label>ID Convênio (Ex: Unimed = 12)</Label><Input name="healthInsuranceCode" type="number" required /></div>
            <Button type="submit" className="w-full" disabled={loading === "createPatient"}>{loading === "createPatient" ? <Loader2 className="animate-spin" /> : "Criar / Atualizar"}</Button>
          </form>
          {results.createPatient && <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">{JSON.stringify(results.createPatient, null, 2)}</pre>}
        </CardContent>
      </Card>

      {/* 5. Buscar Slots */}
      <Card><CardHeader><CardTitle className="text-lg">5. Buscar Slots Livres</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleGetSlots} className="space-y-2 text-sm">
            <div className="flex gap-2">
              <div className="flex-1"><Label>ID Med.</Label><Input name="doctorId" placeholder="Ex: 10073" required /></div>
              <div className="flex-1"><Label>ID Endereço</Label><Input name="addressId" placeholder="Ex: 1" required /></div>
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

      {/* 6. Book Slot */}
      <Card className="lg:col-span-2"><CardHeader><CardTitle className="text-lg">6. Agendar Consulta (Book)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleBookSlot} className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <div><Label>ID Médico</Label><Input name="doctorId" placeholder="Ex: 10073" required /></div>
              <div><Label>ID Endereço</Label><Input name="addressId" placeholder="Ex: 1" required /></div>
              <div><Label>ID Paciente</Label><Input name="patientId" placeholder="Ex: 215591" required /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Data/Hora Slot (ISO)</Label><Input name="slotStart" placeholder="2022-01-05T09:00:00-03:00" required /></div>
              <div><Label>ID Convênio (Ex: 12)</Label><Input name="healthInsuranceCode" placeholder="Ex: 12" required /></div>
            </div>
            <Button type="submit" className="w-full" variant="default" disabled={loading === "book"}>{loading === "book" ? <Loader2 className="animate-spin" /> : "Confirmar Agendamento"}</Button>
          </form>
          {results.book && <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">{JSON.stringify(results.book, null, 2)}</pre>}
        </CardContent>
      </Card>

    </div>
  );
}