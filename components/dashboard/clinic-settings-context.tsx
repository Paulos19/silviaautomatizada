"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loadRagAction } from "@/actions/rag.actions";

export interface SelectedDoctor {
    id: number;
    name: string;
    crm?: number | null;
    specialty?: string | null;
}

interface ClinicSettingsContextType {
    selectedDoctor: SelectedDoctor | null;
    setSelectedDoctor: (doctor: SelectedDoctor | null) => void;
    addressId: string;
    ragPrompt: string;
    setRagPrompt: (prompt: string) => void;
}

const ClinicSettingsContext = createContext<ClinicSettingsContextType | null>(null);

const STORAGE_KEY_DOCTOR = "silvia_selected_doctor";
const STORAGE_KEY_RAG = "silvia_rag_prompt";

export function ClinicSettingsProvider({ children }: { children: ReactNode }) {
    const [selectedDoctor, setSelectedDoctorState] = useState<SelectedDoctor | null>(null);
    const [ragPrompt, setRagPromptState] = useState("");
    const [hydrated, setHydrated] = useState(false);

    // 1. Hidratação rápida do localStorage (evita flicker)
    // 2. Depois, carrega do banco (source of truth) e atualiza
    useEffect(() => {
        // Cache local imediato
        try {
            const storedDoctor = localStorage.getItem(STORAGE_KEY_DOCTOR);
            if (storedDoctor) setSelectedDoctorState(JSON.parse(storedDoctor));

            const storedRag = localStorage.getItem(STORAGE_KEY_RAG);
            if (storedRag) setRagPromptState(storedRag);
        } catch { }
        setHydrated(true);

        // Fonte de verdade: banco de dados
        loadRagAction().then((res) => {
            if (res.success && res.data) {
                // Atualiza médico do DB
                if (res.data.doctorId && res.data.doctorName) {
                    const dbDoctor: SelectedDoctor = {
                        id: res.data.doctorId,
                        name: res.data.doctorName,
                        crm: res.data.doctorCrm,
                        specialty: res.data.doctorSpecialty,
                    };
                    setSelectedDoctorState(dbDoctor);
                    localStorage.setItem(STORAGE_KEY_DOCTOR, JSON.stringify(dbDoctor));
                }
                // Atualiza RAG do DB
                if (res.data.ragPrompt) {
                    setRagPromptState(res.data.ragPrompt);
                    localStorage.setItem(STORAGE_KEY_RAG, res.data.ragPrompt);
                }
            }
        }).catch(() => {
            // Silencia erros de rede — localStorage já populou o estado
        });
    }, []);

    const setSelectedDoctor = (doctor: SelectedDoctor | null) => {
        setSelectedDoctorState(doctor);
        if (doctor) {
            localStorage.setItem(STORAGE_KEY_DOCTOR, JSON.stringify(doctor));
        } else {
            localStorage.removeItem(STORAGE_KEY_DOCTOR);
        }
    };

    const setRagPrompt = (prompt: string) => {
        setRagPromptState(prompt);
        localStorage.setItem(STORAGE_KEY_RAG, prompt);
    };

    // Evita flash de conteúdo antes da hidratação
    if (!hydrated) return null;

    return (
        <ClinicSettingsContext.Provider
            value={{
                selectedDoctor,
                setSelectedDoctor,
                addressId: "1",
                ragPrompt,
                setRagPrompt,
            }}
        >
            {children}
        </ClinicSettingsContext.Provider>
    );
}

export function useClinicSettings() {
    const context = useContext(ClinicSettingsContext);
    if (!context) {
        throw new Error("useClinicSettings deve ser usado dentro de <ClinicSettingsProvider>");
    }
    return context;
}
