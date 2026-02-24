"use client";

import { useState } from "react";
import { fetchSingleDoctorAction, fetchInsuranceProvidersAction } from "@/actions/clinic.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Stethoscope, ShieldPlus } from "lucide-react";

export default function DoctorsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  const handleFetchDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading("doctor");
    const res = await fetchSingleDoctorAction(new FormData(e.currentTarget).get("doctorId") as string);
    setResults(prev => ({ ...prev, doctor: res }));
    setLoading(null);
  };

  const handleFetchInsurances = async () => {
    setLoading("insurances");
    const res = await fetchInsuranceProvidersAction();
    setResults(prev => ({ ...prev, insurances: res }));
    setLoading(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Corpo Clínico & Convênios</h1>
        <p className="text-muted-foreground mt-2">Consulte informações de especialistas e planos de saúde credenciados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-background/50 backdrop-blur-md border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Stethoscope className="w-5 h-5 text-primary" /> Ficha do Médico</CardTitle>
            <CardDescription>Busque detalhes de um profissional pelo ID.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFetchDoctor} className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <Label>ID do Médico</Label>
                <Input name="doctorId" placeholder="Ex: 10073" required className="bg-background/50" />
              </div>
              <Button type="submit" disabled={loading === "doctor"}>
                {loading === "doctor" ? <Loader2 className="animate-spin w-4 h-4" /> : "Pesquisar"}
              </Button>
            </form>
            {results.doctor && <pre className="mt-4 bg-muted/50 p-3 rounded-lg text-xs overflow-auto max-h-60 border border-border/50">{JSON.stringify(results.doctor, null, 2)}</pre>}
          </CardContent>
        </Card>

        <Card className="bg-background/50 backdrop-blur-md border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldPlus className="w-5 h-5 text-chart-4" /> Planos de Saúde</CardTitle>
            <CardDescription>Listagem de todos os convênios mapeados na API.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleFetchInsurances} variant="outline" className="w-full bg-background/50" disabled={loading === "insurances"}>
              {loading === "insurances" ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
              Carregar Tabela de Convênios
            </Button>
            {results.insurances && <pre className="mt-4 bg-muted/50 p-3 rounded-lg text-xs overflow-auto max-h-60 border border-border/50">{JSON.stringify(results.insurances, null, 2)}</pre>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}