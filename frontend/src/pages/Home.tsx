import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ueService } from '../api/ueService';
import { requestService } from '../api/requestService';
import type { Section } from '../models/Section';
import type { UE } from '../models/UE';
import Navbar from '../components/Navbar';
import UECard from '../components/UECard';
import ProcessStep from '../components/ProcessStep';
import UeDetailModal from '../components/UeDetailModal';
import Button from '../components/Button';

const SKELETON_COUNT = 6;

// Processus de demande de dispense
const PROCESS_STEPS = [
    { number: 1, title: "Sélectionner les UE",    description: "Consultez le programme et choisissez les cours concernés" },
    { number: 2, title: "Simuler la dispense",     description: "Vérifiez immédiatement vos correspondances avec vos cours antérieurs" },
    { number: 3, title: "Soumettre la demande",    description: "Constituez votre dossier en joignant vos pièces justificatives" },
];

const sectionTabClass = (active: boolean) =>
    ['px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-200 border-b-4',
     active ? 'bg-transparent text-orange-600 border-orange-600'
            : 'bg-transparent text-gray-400 border-transparent hover:text-gray-900 hover:border-gray-300'
    ].join(' ');

const Home = () => {
    const { isAuthenticated, login } = useAuth();
    const [sections, setSections] = useState<Section[]>([]);
    const [ues, setUEs] = useState<UE[]>([]);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [selectedUe, setSelectedUe] = useState<UE | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingUEs, setLoadingUEs] = useState(false);
    const [activeRequestUeCodes, setActiveRequestUeCodes] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!isAuthenticated) return;
        requestService.getMyRequests()
            .then(requests => {
                const codes = new Set(
                    requests
                        .filter(r => r.statut !== 'REFUSEE')
                        .map(r => r.ueCode)
                );
                setActiveRequestUeCodes(codes);
            })
            .catch(() => { /* silencieux : pas bloquant */ });
    }, [isAuthenticated]);

    useEffect(() => {
        ueService.getSections()
            .then(data => {
                setSections(data);
                if (data.length > 0) setSelectedSection(data[0].code);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedSection) return;
        
        const fetchUEs = async () => {
            setLoadingUEs(true);
            try {
                const data = await ueService.getUEs(selectedSection);
                setUEs(data);
            } catch {
                setUEs([]);
            } finally {
                setLoadingUEs(false);
            }
        };

        fetchUEs();
    }, [selectedSection]);

    const scrollToProgram = () => {
        document.getElementById('cours-programme')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />

            {/* Hero */}
            <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden bg-white">
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-gray-900 mb-8 uppercase">
                        Gestion des <br className="hidden sm:block" />
                        <span className="text-orange-600">dispenses</span>
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-500 leading-relaxed font-light">
                        Consultez le programme officiel, vérifiez votre éligibilité et soumettez votre dossier en toute simplicité.
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <Button variant="secondary" onClick={scrollToProgram}>Voir le programme</Button>
                        {!isAuthenticated && <Button onClick={login}>Commencer</Button>}
                    </div>
                </div>
            </div>

            {/* Processus */}
            <div className="border-y border-gray-200 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-center text-xl font-bold text-gray-900 mb-8 uppercase">
                            Comment faire une demande de dispense ?
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {PROCESS_STEPS.map(step => <ProcessStep key={step.number} {...step} />)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Programme */}
            <div id="cours-programme" className="py-24 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">Programme Académique</h2>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Unités d'enseignement par section</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center gap-4 animate-pulse mb-12">
                            <div className="h-10 w-32 bg-gray-200" />
                            <div className="h-10 w-32 bg-gray-200" />
                        </div>
                    ) : (
                        <div className="flex flex-wrap justify-center gap-0 mb-16 border-b border-gray-200">
                            {sections.map(section => (
                                <button
                                    key={section.code}
                                    onClick={() => setSelectedSection(section.code)}
                                    className={sectionTabClass(selectedSection === section.code)}
                                >
                                    {section.nom}
                                </button>
                            ))}
                        </div>
                    )}

                    {loadingUEs ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                                <div key={i} className="h-64 bg-white border border-gray-200 animate-pulse" />
                            ))}
                        </div>
                    ) : ues.length === 0 ? (
                        <div className="text-center py-20 bg-white border border-dashed border-gray-300">
                            <p className="text-gray-400 font-medium uppercase text-sm">Sélectionnez une section ci-dessus.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ues.map(ue => (
                                <UECard
                                    key={ue.code}
                                    ue={ue}
                                    onClick={() => setSelectedUe(ue)}
                                    hasActiveRequest={activeRequestUeCodes.has(ue.code)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-gray-800 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-6 bg-orange-600 rounded-sm" />
                        <span className="font-bold text-white tracking-widest uppercase">DispMatch</span>
                    </div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest">
                        &copy; 2026 P.Peeters - PID. Tous droits réservés.
                    </p>
                </div>
            </footer>

            <UeDetailModal
                ue={selectedUe}
                sectionCode={selectedSection}
                onClose={() => setSelectedUe(null)}
                hasActiveRequest={selectedUe ? activeRequestUeCodes.has(selectedUe.code) : false}
            />
        </div>
    );
};

export default Home;