"use client";

import { useState } from "react";
import { 
  fetchSingleDoctorAction, fetchSinglePatientAction, checkPatientExistsAction, 
  createPatientAction, fetchFreeSlotsAction, bookSlotAction, fetchInsuranceProvidersAction,
  cancelBookingAction
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
    const payload = {
      name: formData.get("name"),
      nin: formData.get("nin"), 
      birthday: formData.get("birthday"), 
      mobile: formData.get("mobile") || "",
      email: formData.get("email") || "",
      sex: "M", maritalStatus: 3, 
      healthInsuranceCode: Number(formData.get("healthInsuranceCode")),
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card><CardHeader><CardTitle>1. Convênios</CardTitle></CardHeader>
        <CardContent>
          <Button onClick={handleFetchInsurances} className="w-full" disabled={loading === "insurances"}>Listar Convênios</Button>
          {results.insurances && <pre className="mt-2 bg-muted p-2 text-xs overflow-auto max-h-40">{JSON.stringify(results.insurances, null, 2)}</pre>}
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>2. Médico</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleFetchDoctor} className="flex gap-2">
            <Input name="doctorId" placeholder="ID Médico" required />
            <Button type="submit">Ir</Button>
          </form>
          {results.doctor && <pre className="mt-2 bg-muted p-2 text-xs max-h-40">{JSON.stringify(results.doctor, null, 2)}</pre>}
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>3. Verificar CPF</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCheckExists} className="space-y-2">
            <Input name="nin" placeholder="CPF" required />
            <Input name="birthday" type="date" required />
            <Button type="submit" className="w-full">Verificar</Button>
          </form>
          {results.exists && <pre className="mt-2 bg-muted p-2 text-xs">{JSON.stringify(results.exists, null, 2)}</pre>}
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>4. Criar/Atualizar Paciente</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePatient} className="space-y-2">
            <Input name="name" placeholder="Nome" required />
            <Input name="nin" placeholder="CPF" required />
            <Input name="birthday" type="date" required />
            <Input name="healthInsuranceCode" type="number" placeholder="ID Convênio" required />
            <Button type="submit" className="w-full">Salvar</Button>
          </form>
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>5. Slots Livres</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleGetSlots} className="space-y-2">
            <Input name="doctorId" placeholder="ID Médico" required />
            <Input name="addressId" placeholder="ID Endereço" required />
            <Input name="startDate" type="date" required />
            <Input name="endDate" type="date" required />
            <Button type="submit" className="w-full">Buscar</Button>
          </form>
          {results.slots && <pre className="mt-2 bg-muted p-2 text-xs">{JSON.stringify(results.slots, null, 2)}</pre>}
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle>6. Agendar (Book)</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleBookSlot} className="space-y-2">
            <Input name="doctorId" placeholder="ID Médico" required />
            <Input name="addressId" placeholder="ID Endereço" required />
            <Input name="patientId" placeholder="ID Paciente" required />
            <Input name="slotStart" placeholder="ISO Date" required />
            <Input name="healthInsuranceCode" placeholder="ID Convênio" required />
            <Button type="submit" className="w-full">Agendar</Button>
          </form>
          {results.book && <pre className="mt-2 bg-muted p-2 text-xs">{JSON.stringify(results.book, null, 2)}</pre>}
        </CardContent>
      </Card>

      <Card><CardHeader><CardTitle className="text-destructive">7. Cancelar</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCancelBooking} className="space-y-2">
            <Input name="doctorId" placeholder="ID Médico" required />
            <Input name="addressId" placeholder="ID Endereço" required />
            <Input name="bookingId" placeholder="ID Agendamento" required />
            <Button type="submit" className="w-full" variant="destructive">Cancelar</Button>
          </form>
          {results.cancel && <pre className="mt-2 bg-muted p-2 text-xs">{JSON.stringify(results.cancel, null, 2)}</pre>}
        </CardContent>
      </Card>
    </div>
  );
}