import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { requestService } from '../api/requestService';
import type { Request } from '../models/Request';
import { FilePond, registerPlugin } from 'react-filepond';
import type { FilePondFile } from 'filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

const STATUS_TYPE: Record<string, 'pending' | 'approved' | 'rejected'> = {
    EN_ATTENTE: 'pending',
    VALIDEE:    'approved',
    REFUSEE:    'rejected',
};



const RequestDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [request, setRequest] = useState<Request | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [files, setFiles] = useState<FilePondFile[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const loadRequest = useCallback(() => {
        if (!id) return;
        setLoading(true);
        requestService.getRequestById(Number(id))
            .then(data => { setRequest(data); setError(null); })
            .catch(err => setError(err.message || "Impossible de charger les détails de cette demande."))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => { loadRequest(); }, [loadRequest]);

    const handleUploadDocuments = async () => {
        if (!id || files.length === 0) return;
        setIsSubmitting(true);
        setUploadError(null);
        try {
            const fileObjects = files.map(f => f.file as File);
            await requestService.uploadAdditionalDocuments(Number(id), fileObjects);
            setFiles([]);
            loadRequest();
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "Erreur lors de l'ajout des documents.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Détails de la demande" subtitle="...">
                <div className="flex justify-center p-12">
                    <span className="text-gray-500 animate-pulse font-mono">Chargement des détails...</span>
                </div>
            </Layout>
        );
    }

    if (error || !request) {
        return (
            <Layout title="Demande introuvable" subtitle="Erreur">
                <div className="bg-red-50 border border-red-200 p-6 max-w-2xl mx-auto mt-8">
                    <h2 className="text-red-800 font-bold mb-2 uppercase tracking-wide">Erreur</h2>
                    <p className="text-red-600 mb-6">{error || "Cette demande n'existe pas ou ne vous appartient pas."}</p>
                    <Button variant="secondary" onClick={() => navigate('/requests')}>Retour à mes demandes</Button>
                </div>
            </Layout>
        );
    }

    const canAddDocuments = request.statut === 'EN_ATTENTE';

    return (
        <Layout
            title={`Demande #${request.id}`}
            subtitle={`Section ${request.sectionCode} - UE ${request.ueCode}`}
        >
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <Button variant="ghost" onClick={() => navigate('/requests')}>
                        ← Retour à la liste
                    </Button>
                    <StatusBadge
                        status={STATUS_TYPE[request.statut] ?? 'pending'}
                        label={request.statut.replaceAll('_', ' ')}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white border border-gray-300 p-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                                Résumé de la demande
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-[10px] text-gray-400 font-mono uppercase">Unité d'Enseignement</span>
                                    <span className="font-bold text-gray-900 border-b-2 border-orange-500">{request.ueCode}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-gray-400 font-mono uppercase">Motif / Commentaire</span>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 whitespace-pre-line border border-gray-100 mt-1">
                                        {request.motif || <span className="italic text-gray-400">Aucun motif fourni.</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-300 p-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                                Documents fournis ({request.documents?.length ?? 0})
                            </h3>
                            {!request.documents?.length ? (
                                <p className="text-sm text-gray-400 italic">Aucun document n'a été joint à cette demande.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {request.documents.map(doc => (
                                        <li key={doc.id} className="flex justify-between items-center bg-gray-50 border border-gray-200 p-3 hover:border-gray-300 transition-colors">
                                            <div className="flex items-center space-x-3 overflow-hidden">
                                                <div className="bg-gray-200 p-2 text-gray-500 text-xs font-bold">PDF</div>
                                                <span className="text-sm text-gray-700 truncate font-medium" title={doc.originalName}>
                                                    {doc.originalName}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap ml-4">
                                                {(doc.size / 1024).toFixed(1)} KB
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {canAddDocuments ? (
                            <div className="bg-orange-50 border border-orange-200 p-6 sticky top-6">
                                <h3 className="text-xs font-bold text-orange-800 uppercase tracking-widest mb-2">
                                    Compléter le dossier
                                </h3>
                                <p className="text-sm text-orange-700 mb-4 leading-relaxed">
                                    Il manque des éléments ? Vous pouvez ajouter d'autres preuves de réussite ici.
                                </p>
                                <FilePond
                                    files={files as never}
                                    onupdatefiles={setFiles}
                                    allowMultiple
                                    maxFiles={5}
                                    server={null}
                                    name="files"
                                    labelIdle='Glissez vos fichiers ici ou <span class="filepond--label-action">Parcourir</span>'
                                    credits={false}
                                    acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
                                    labelFileTypeNotAllowed="Type de fichier non valide"
                                    fileValidateTypeLabelExpectedTypes="Attendu: PDF, JPEG, PNG"
                                />
                                {uploadError && (
                                    <p className="text-red-600 text-xs mt-2">{uploadError}</p>
                                )}
                                <Button
                                    variant="primary"
                                    className="w-full mt-4"
                                    disabled={files.length === 0 || isSubmitting}
                                    onClick={handleUploadDocuments}
                                >
                                    {isSubmitting ? 'Envoi...' : 'Ajouter ces documents'}
                                </Button>
                            </div>
                        ) : (
                            <div className="bg-gray-50 border border-gray-200 p-6 sticky top-6">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                    Dossier verrouillé
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Cette demande a été clôturée ou est en cours de traitement. Vous ne pouvez plus ajouter de documents.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default RequestDetail;