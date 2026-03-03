"use client";

import { useState, useEffect } from "react";
import { checkPatientExistsAction, createPatientAction, fetchInsuranceProvidersAction } from "@/actions/clinic.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, UserCheck, UserPlus, ShieldPlus } from "lucide-react";

interface InsuranceOption {
  id: number;
  name?: string | null;
}

export default function PatientsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [insurances, setInsurances] = useState<InsuranceOption[]>([]);
  const [loadingInsurances, setLoadingInsurances] = useState(true);

  useEffect(() => {
    loadInsurances();
  }, []);

  const loadInsurances = async () => {
    setLoadingInsurances(true);
    const res = await fetchInsuranceProvidersAction();
    if (res.success && res.data) {
      setInsurances(res.data as InsuranceOption[]);
    }
    setLoadingInsurances(false);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Pacientes</h1>
        <p className="text-muted-foreground mt-2">Verifique cadastros existentes ou registre novos pacientes no sistema.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card: Verificar CPF */}
        <Card className="bg-background/50 backdrop-blur-md border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCheck className="w-5 h-5 text-primary" /> Verificar Cadastro</CardTitle>
            <CardDescription>Consulte se o paciente já possui prontuário ativo.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheckExists} className="space-y-4">
              <div className="space-y-2"><Label>NIN / CPF</Label><Input name="nin" placeholder="Apenas números" required className="bg-background/50" /></div>
              <div className="space-y-2"><Label>Data de Nascimento</Label><Input name="birthday" type="date" required className="bg-background/50" /></div>
              <Button type="submit" className="w-full" disabled={loading === "exists"}>
                {loading === "exists" ? <Loader2 className="animate-spin w-4 h-4" /> : "Consultar Base"}
              </Button>
            </form>
            {results.exists && <pre className="mt-4 bg-muted/50 p-3 rounded-lg text-xs overflow-auto max-h-40 border border-border/50">{JSON.stringify(results.exists, null, 2)}</pre>}
          </CardContent>
        </Card>

        {/* Card: Criar/Atualizar */}
        <Card className="bg-background/50 backdrop-blur-md border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-chart-2" /> Novo Prontuário</CardTitle>
            <CardDescription>Cadastre ou atualize os dados (ex: Plano de Saúde).</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div className="space-y-2"><Label>Nome Completo</Label><Input name="name" required className="bg-background/50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>CPF</Label><Input name="nin" required className="bg-background/50" /></div>
                <div className="space-y-2"><Label>Data Nasc.</Label><Input name="birthday" type="date" required className="bg-background/50" /></div>
              </div>

              {/* Convênio via Dropdown */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <ShieldPlus className="w-3.5 h-3.5 text-chart-4" /> Convênio
                </Label>
                {loadingInsurances ? (
                  <div className="flex items-center gap-2 h-10 px-3 text-sm text-muted-foreground">
                    <Loader2 className="animate-spin w-4 h-4" /> Carregando convênios...
                  </div>
                ) : (
                  <select
                    name="healthInsuranceCode"
                    required
                    className="w-full h-10 rounded-xl border border-border/50 bg-background/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  >
                    <option value="">Selecione um convênio...</option>
                    {insurances.map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.name || `Convênio #${ins.id}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <Button type="submit" variant="secondary" className="w-full" disabled={loading === "createPatient"}>
                {loading === "createPatient" ? <Loader2 className="animate-spin w-4 h-4" /> : "Salvar Paciente"}
              </Button>
            </form>
            {results.createPatient && <pre className="mt-4 bg-muted/50 p-3 rounded-lg text-xs overflow-auto max-h-40 border border-border/50">{JSON.stringify(results.createPatient, null, 2)}</pre>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}