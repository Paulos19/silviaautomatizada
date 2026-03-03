"use client";

import { useState, useEffect, useMemo } from "react";
import { useClinicSettings, SelectedDoctor } from "@/components/dashboard/clinic-settings-context";
import { fetchDoctorsAction } from "@/actions/clinic.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Stethoscope, Check, Brain, Sparkles, Save, Globe, AlertCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DOCTORS_PER_PAGE = 6;

interface DoctorItem {
    id: number;
    name: string;
    crm?: number | null;
    specialty?: string | null;
    medicalAppointmentWEB?: string | null;
    council?: string | null;
    email?: string | null;
    phone?: string | null;
    mobile?: string | null;
}

export default function SettingsPage() {
    const { selectedDoctor, setSelectedDoctor, ragPrompt, setRagPrompt } = useClinicSettings();
    const [doctors, setDoctors] = useState<DoctorItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [localRag, setLocalRag] = useState(ragPrompt);
    const [ragSaved, setRagSaved] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadDoctors();
    }, []);

    // Reset pra página 1 ao filtrar
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const loadDoctors = async () => {
        setLoading(true);
        setError(null);
        const res = await fetchDoctorsAction();
        if (res.success && res.data) {
            setDoctors(res.data as DoctorItem[]);
        } else {
            setError(res.error || "Falha ao carregar médicos.");
        }
        setLoading(false);
    };

    // Filtrar médicos por nome, CRM ou especialidade
    const filteredDoctors = useMemo(() => {
        if (!searchQuery.trim()) return doctors;
        const q = searchQuery.toLowerCase();
        return doctors.filter(
            (doc) =>
                doc.name.toLowerCase().includes(q) ||
                (doc.crm && doc.crm.toString().includes(q)) ||
                (doc.specialty && doc.specialty.toLowerCase().includes(q))
        );
    }, [doctors, searchQuery]);

    // Paginação
    const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / DOCTORS_PER_PAGE));
    const paginatedDoctors = filteredDoctors.slice(
        (currentPage - 1) * DOCTORS_PER_PAGE,
        currentPage * DOCTORS_PER_PAGE
    );

    const handleSelectDoctor = (doc: DoctorItem) => {
        const selected: SelectedDoctor = {
            id: doc.id,
            name: doc.name,
            crm: doc.crm,
            specialty: doc.specialty,
        };
        setSelectedDoctor(selected);
    };

    const handleSaveRag = () => {
        setRagPrompt(localRag);
        setRagSaved(true);
        setTimeout(() => setRagSaved(false), 2500);
    };

    return (
        <div className="space-y-8">
            {/* Cabeçalho */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground mt-2">
                    Defina o médico responsável e personalize a inteligência artificial.
                </p>
            </div>

            {/* ─── Seção: Médico Responsável ─── */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-1 flex items-center justify-center shadow-lg">
                        <Stethoscope className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Médico Responsável</h2>
                        <p className="text-sm text-muted-foreground">
                            Selecione o profissional que será usado em agendamentos e consultas.
                        </p>
                    </div>
                </div>

                {/* Médico Atualmente Selecionado */}
                {selectedDoctor && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 animate-in fade-in duration-300">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-primary">Médico ativo</p>
                            <p className="text-foreground font-semibold">
                                {selectedDoctor.name}
                                {selectedDoctor.crm && (
                                    <span className="text-muted-foreground font-normal ml-2">
                                        CRM {selectedDoctor.crm}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-3 text-muted-foreground">Carregando corpo clínico...</span>
                    </div>
                )}

                {/* Erro */}
                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                        <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-destructive">Erro ao carregar médicos</p>
                            <p className="text-xs text-muted-foreground">{error}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={loadDoctors} className="ml-auto">
                            Tentar novamente
                        </Button>
                    </div>
                )}

                {/* Filtro de busca */}
                {!loading && !error && doctors.length > 0 && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nome, CRM ou especialidade..."
                            className="pl-10 bg-background/50 border-border/50"
                        />
                    </div>
                )}

                {/* Grid de Médicos (paginado) */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedDoctors.map((doc) => {
                            const isSelected = selectedDoctor?.id === doc.id;
                            const isWeb = doc.medicalAppointmentWEB && doc.medicalAppointmentWEB !== "0";
                            return (
                                <button
                                    key={doc.id}
                                    onClick={() => handleSelectDoctor(doc)}
                                    className={cn(
                                        "relative group text-left p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer",
                                        "hover:shadow-lg hover:scale-[1.02] hover:border-primary/50",
                                        "active:scale-[0.98]",
                                        isSelected
                                            ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                                            : "border-border/50 bg-background/50 backdrop-blur-md"
                                    )}
                                >
                                    {/* Badge selecionado */}
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-in zoom-in duration-200">
                                            <Check className="w-3.5 h-3.5 text-primary-foreground" />
                                        </div>
                                    )}

                                    {/* Avatar */}
                                    <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors duration-300",
                                        isSelected
                                            ? "bg-gradient-to-br from-primary to-chart-1"
                                            : "bg-muted/80 group-hover:bg-primary/10"
                                    )}>
                                        <Stethoscope className={cn(
                                            "w-6 h-6 transition-colors duration-300",
                                            isSelected ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                                        )} />
                                    </div>

                                    {/* Info */}
                                    <h3 className="font-semibold text-sm leading-tight">{doc.name}</h3>

                                    <div className="mt-2 space-y-1">
                                        {doc.crm && (
                                            <p className="text-xs text-muted-foreground">
                                                CRM: <span className="text-foreground/80">{doc.crm}</span>
                                            </p>
                                        )}
                                        {doc.specialty && (
                                            <p className="text-xs text-muted-foreground">
                                                {doc.specialty}
                                            </p>
                                        )}
                                    </div>

                                    {/* Badge Web */}
                                    <div className="mt-3 flex gap-2">
                                        {isWeb && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-chart-2/10 text-chart-2 border border-chart-2/20">
                                                <Globe className="w-2.5 h-2.5" /> Web
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Paginação */}
                {!loading && !error && totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-muted-foreground">
                            {filteredDoctors.length} médico{filteredDoctors.length !== 1 ? "s" : ""} encontrado{filteredDoctors.length !== 1 ? "s" : ""}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="w-8 h-8"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-medium tabular-nums min-w-[60px] text-center">
                                {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="w-8 h-8"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {!loading && !error && filteredDoctors.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                        {searchQuery ? `Nenhum médico encontrado para "${searchQuery}".` : "Nenhum médico encontrado na facility."}
                    </p>
                )}
            </section>

            {/* ─── Seção: RAG — Personalidade da IA ─── */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chart-4 to-chart-5 flex items-center justify-center shadow-lg">
                        <Brain className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Personalidade da IA</h2>
                        <p className="text-sm text-muted-foreground">
                            Defina o comportamento e o tom do agente de IA no fluxo n8n.
                        </p>
                    </div>
                </div>

                <Card className="bg-background/50 backdrop-blur-md border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Sparkles className="w-4 h-4 text-chart-4" /> Prompt de Personalidade (RAG)
                        </CardTitle>
                        <CardDescription>
                            Escreva instruções em linguagem natural sobre como a IA deve se comportar, que tom usar, o que priorizar, etc.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="rag-prompt">Prompt</Label>
                            <textarea
                                id="rag-prompt"
                                value={localRag}
                                onChange={(e) => setLocalRag(e.target.value)}
                                placeholder={"Exemplo: Você é a Silvia, uma assistente virtual médica simpática e profissional. Responda sempre em português brasileiro, de forma clara e acolhedora. Priorize a empatia com o paciente, seja objetiva nas respostas e nunca forneça diagnósticos médicos."}
                                rows={6}
                                className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 resize-y min-h-[120px]"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button onClick={handleSaveRag} className="gap-2">
                                <Save className="w-4 h-4" /> Salvar Prompt
                            </Button>
                            {ragSaved && (
                                <span className="text-sm text-chart-2 font-medium animate-in fade-in slide-in-from-left-2 duration-300">
                                    ✓ Salvo com sucesso!
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
