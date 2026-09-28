import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { requestService } from '../api/requestService';
import type { Request } from '../models/Request';

const STATUS_TYPE: Record<string, 'pending' | 'approved' | 'rejected'> = {
    EN_ATTENTE: 'pending',
    VALIDEE:    'approved',
    REFUSEE:    'rejected',
};



// Composant pour les en-têtes de tableau
const TH = ({ children }: { children: React.ReactNode }) => (
    <th className="bg-gray-100 p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 select-none">
        {children}
    </th>
);
// Composant pour les cellules de tableau
const TD = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <td className={`p-4 border-b border-gray-100 text-sm font-medium text-gray-700 ${className ?? ''}`}>
        {children}
    </td>
);

const Requests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        requestService.getMyRequests()
            .then(setRequests)
            .catch(err => setError(err.message || "Erreur inconnue"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Layout title="Mes Dispenses" subtitle="Gestion des demandes académiques">
            <div className="space-y-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Liste des demandes</h2>
                    <Button variant="primary" onClick={() => navigate('/requests/new')}>
                        Nouvelle Demande
                    </Button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                        <strong className="font-bold">Erreur : </strong>
                        <span>{error}</span>
                    </div>
                )}

                <div className="bg-white border border-gray-300 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <TH>ID Référence</TH>
                                <TH>UE / Section</TH>
                                <TH>Motif</TH>
                                <TH>Statut</TH>
                                <TH>Action</TH>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-gray-400">Chargement...</td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-gray-400 italic">
                                        Aucune demande enregistrée.
                                    </td>
                                </tr>
                            ) : requests.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <TD className="font-mono text-xs text-gray-400">#{req.id}</TD>
                                    <TD className="font-bold">
                                        {req.ueCode}<br />
                                        <span className="text-[10px] text-gray-400 font-mono">{req.sectionCode}</span>
                                    </TD>

                                    <TD className="max-w-xs truncate">{req.motif}</TD>
                                    <TD>
                                        <StatusBadge
                                            status={STATUS_TYPE[req.statut] ?? 'pending'}
                                            label={req.statut.replaceAll('_', ' ')}
                                        />
                                    </TD>
                                    <TD>
                                        <Link to={`/requests/${req.id}`} className="text-xs font-bold text-gray-400 hover:text-orange-600 uppercase tracking-wider">
                                            Détails
                                        </Link>
                                    </TD>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Requests;