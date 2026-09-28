import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ueService } from '../api/ueService';
import { dossierService } from '../api/dossierService';
import { requestService } from '../api/requestService';
import type { DossierDto } from '../models/Dossier';
import type { Request } from '../models/Request';
import type { Section } from '../models/Section';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';

// Constantes pour les statuts du dossier
const STATUS_LABEL: Record<string, string> = {
    DEMANDE_EN_COURS:       'En cours',
    TRAITEMENT_DIRECTION:   'Direction',
    TRAITEMENT_PROFESSEUR:  'Professeur',
    TRAITE:                 'Traité',
    CLOTURE:                'Clôturé',
};

const STATUS_TYPE: Record<string, 'approved' | 'closed' | 'processing'> = {
    TRAITE:  'approved',
    CLOTURE: 'closed',
};

const getStatusLabel = (etat: string) => STATUS_LABEL[etat] ?? etat;
const getStatusType  = (etat: string): 'approved' | 'closed' | 'processing' => STATUS_TYPE[etat] ?? 'processing';

const StatCard = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="bg-white p-6 border border-gray-300 transition-all duration-200 hover:border-orange-500">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 inline-block bg-gray-100 px-2 py-1 border border-gray-200">
            {label}
        </span>
        {children}
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [sections, setSections] = useState<Section[]>([]);
    const [dossier, setDossier] = useState<DossierDto | null>(null);
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        Promise.all([
            ueService.getSections(),
            dossierService.getCurrentDossier(),
            requestService.getMyRequests()
        ])
        .then(([sectionsData, dossierData, requestsData]) => {
            setSections(sectionsData);
            setDossier(dossierData);
            setRequests(requestsData);
        })
        .catch(err => setError(err instanceof Error ? err.message : 'Erreur lors du chargement.'))
        .finally(() => setLoading(false));
    }, [user]);

    // Compte des demandes en attente
    const pendingCount = requests.filter(r => r.statut === 'EN_ATTENTE').length;
    const val = (v: React.ReactNode) => loading ? '...' : v;

    return (
        <Layout title="Tableau de bord" subtitle="Aperçu de votre situation académique">
            {error && <div className="mb-6 p-3 bg-red-50 text-red-600 border border-red-200 text-sm">{error}</div>}

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Sections Disponibles">
                    <div className="text-4xl font-bold text-gray-900 font-mono tracking-tighter">
                        {val(sections.length)}
                    </div>
                </StatCard>

                <StatCard label="Demandes en attente">
                    <div className="text-4xl font-bold text-gray-900 font-mono tracking-tighter">
                        {val(pendingCount)}
                    </div>
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-400">Action requise</span>
                        {pendingCount > 0 ? (
                            <Link to="/requests" className="text-orange-600 hover:text-orange-800 font-bold hover:underline font-mono">
                                VOIR DEMANDES
                            </Link>
                        ) : (
                            <span className="text-gray-500 font-mono">NEANT</span>
                        )}
                    </div>
                </StatCard>

                <StatCard label="Statut Dossier">
                    <div className="text-2xl font-bold text-gray-900 font-mono tracking-tighter">
                        {val(dossier ? getStatusLabel(dossier.etat) : 'AUCUN DOSSIER')}
                    </div>
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-400">État</span>
                        {dossier ? (
                            <StatusBadge status={getStatusType(dossier.etat)} label={getStatusLabel(dossier.etat)} />
                        ) : (
                            <span className="text-gray-500 font-mono">--</span>
                        )}
                    </div>
                </StatCard>
            </section>
        </Layout>
    );
};

export default Dashboard;