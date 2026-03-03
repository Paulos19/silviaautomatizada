"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

    // Hidratar do localStorage ao montar
    useEffect(() => {
        try {
            const storedDoctor = localStorage.getItem(STORAGE_KEY_DOCTOR);
            if (storedDoctor) setSelectedDoctorState(JSON.parse(storedDoctor));

            const storedRag = localStorage.getItem(STORAGE_KEY_RAG);
            if (storedRag) setRagPromptState(storedRag);
        } catch { }
        setHydrated(true);
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
