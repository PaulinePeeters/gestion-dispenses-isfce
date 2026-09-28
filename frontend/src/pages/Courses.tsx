import { useEffect, useState } from 'react';
import type { Section } from '../models/Section';
import type { UE } from '../models/UE';
import { ueService } from '../api/ueService';
import { requestService } from '../api/requestService';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import UECard from '../components/UECard';
import UeDetailModal from '../components/UeDetailModal';

const SKELETON_COUNT = 6; // Astuce UX - affiche 6 squelettes pendant le chargement
const GRID_CLASS = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8';

const sectionTabClass = (active: boolean) =>
    ['flex-shrink-0 px-4 sm:px-6 py-3 font-bold text-xs whitespace-nowrap border-t border-l border-r border-gray-200 uppercase tracking-wider transition-none',
     active ? 'bg-white text-orange-600 border-t-2 border-t-orange-600 border-gray-300 border-b-transparent relative top-[1px] z-10'
            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    ].join(' ');

const Courses = () => {
    const { isAuthenticated } = useAuth();
    const [sections, setSections] = useState<Section[]>([]);
    const [ues, setUEs] = useState<UE[]>([]);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [selectedUe, setSelectedUe] = useState<UE | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingUEs, setLoadingUEs] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeRequestUeCodes, setActiveRequestUeCodes] = useState<Set<string>>(new Set());

    // Charge les demandes existantes pour savoir quelles UEs sont déjà en cours
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
            .catch(err => setError(err instanceof Error ? err.message : 'Erreur lors du chargement des sections.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedSection) return;
        const fetchUEs = async () => {
            setLoadingUEs(true);
            try {
                const data = await ueService.getUEs(selectedSection);
                setUEs(data);
            } catch (err) {
                setUEs([]);
                setError(err instanceof Error ? err.message : 'Erreur lors du chargement des cours.');
            } finally {
                setLoadingUEs(false);
            }
        };
        fetchUEs();
    }, [selectedSection]);

    return (
        <Layout title="Cours & Sections" subtitle="Explorez le programme académique par section">
            <div className="space-y-6">
                {loading ? (
                    <div className="animate-pulse flex space-x-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-10 w-32 bg-gray-200 rounded-full" />)}
                    </div>
                ) : error ? (
                    <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-sm">{error}</div>
                ) : (
                    <div className="flex space-x-1 overflow-x-auto border-b border-gray-300 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
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
                    <div className={GRID_CLASS}>
                        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                            <div key={i} className="h-64 bg-white border border-gray-200 animate-pulse rounded-lg" />
                        ))}
                    </div>
                ) : ues.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <p className="text-gray-400 font-medium">Aucun cours trouvé pour cette section.</p>
                    </div>
                ) : (
                    <div className={GRID_CLASS}>
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

            <UeDetailModal
                ue={selectedUe}
                sectionCode={selectedSection}
                onClose={() => setSelectedUe(null)}
                hasActiveRequest={selectedUe ? activeRequestUeCodes.has(selectedUe.code) : false}
            />
        </Layout>
    );
};

export default Courses;