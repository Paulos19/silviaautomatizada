import { Timeline } from "@/components/ui/timeline";
import { fetchDoctorsAction } from "@/actions/clinic.actions";
import { User, Activity, Stethoscope } from "lucide-react";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";

export async function DoctorsTimelineSection() {
    // Busca dados reais da integração da clínica
    const response = await fetchDoctorsAction();
    const doctors = response.success && response.data ? response.data : [];

    // Filtra para exibir no máximo 2 médicos por especialidade
    const doctorsBySpecialty = new Map<string, any[]>();
    doctors.forEach((doc: any) => {
        const docSpecialty = doc.specialty || doc.council?.council_name || doc.professional_type || "Especialista";
        if (!doctorsBySpecialty.has(docSpecialty)) {
            doctorsBySpecialty.set(docSpecialty, []);
        }
        doctorsBySpecialty.get(docSpecialty)!.push(doc);
    });

    const filteredDoctors: any[] = [];
    doctorsBySpecialty.forEach((docs) => {
        filteredDoctors.push(...docs.slice(0, 2));
    });

    // Formata os dados pro componente de Timeline
    const timelineData = filteredDoctors.map((doc: any, i: number) => {
        const docSpecialty = doc.specialty || doc.council?.council_name || doc.professional_type || "Especialista";
        const docName = doc.name || "Médico Associado";

        return {
            title: `Equipe 0${(i + 1).toString().slice(-1)}`, // Um título criativo genérico cronológico ou de equipe
            content: (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-teal-500/10 rounded-full text-teal-500">
                            <Stethoscope className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="text-xl md:text-3xl font-outfit font-medium text-black dark:text-[#F5F5F0]">
                                {docName}
                            </h4>
                            <p className="text-sm font-inter text-teal-600 dark:text-teal-400 mt-1 uppercase tracking-wider font-semibold">
                                {docSpecialty}
                            </p>
                        </div>
                    </div>

                    <p className="text-neutral-700 dark:text-neutral-400 text-sm md:text-base font-inter max-w-xl leading-relaxed mb-8">
                        Profissional registrado sob {doc.council?.council_name || "CRM"} número {doc.council?.council_number || "Registrado"}, atuando no estado de {doc.council?.council_state || "SP"}. Parte fundamental da estrutura médica integrada da Silvia, prestando um serviço ágil e orientado a resultados clínicos de excelência.
                    </p>

                    {/* Simulação de alguns chips estéticos de habilidades/perfil */}
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300">
                            Atendimento Premium
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300">
                            Disponibilidade Mapeada
                        </span>
                    </div>
                </div>
            )
        };
    });

    // Se estiver vazio (ex: erro de API ou sem dados), mostrar algo genérico para não quebrar a UI
    const finalData = timelineData.length > 0 ? timelineData : [
        {
            title: "Carregando...",
            content: <p className="text-slate-400 font-inter">Conectando aos servidores clínicos para carregar os especialistas...</p>
        }
    ];

    return (
        <section className="w-full relative z-20">
            {/* O Timeline componente original lida com sua própria cor de fundo */}
            <Timeline data={finalData} />
        </section>
    );
}
