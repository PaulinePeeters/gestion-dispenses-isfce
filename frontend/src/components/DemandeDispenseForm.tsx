import { useState, useEffect } from 'react';
import { requestService } from '../api/requestService';
import Button from './Button';
import type { SimulationResponse, CoursExterneSimulation } from '../models/Simulation';
import type { CoursExterneDemandeInput } from '../models/CoursExterneDemande';
import { FilePond, registerPlugin } from 'react-filepond';
import type { FilePondFile } from 'filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

interface DemandeDispenseFormProps {
    ueCode: string;
    sectionCode: string;
    motifInitial?: string;
    simulationResult: SimulationResponse | null;
    simulationCourses: CoursExterneSimulation[];
    skippedSimulation: boolean;
    onSuccess: () => void;
    onCancel: () => void;
}

/** Données complémentaires saisies par l'étudiant pour un cours inconnu. */
interface UnknownCourseFormData {
    codeEtablissement?: string;
    codeCours?: string;
    intituleCours: string;
    creditsEcts: string;
    nomEtablissement: string;
    ficheUeFiles: FilePondFile[];
}

const DemandeDispenseForm = ({
    ueCode,
    sectionCode,
    motifInitial = '',
    simulationResult,
    simulationCourses,
    skippedSimulation,
    onSuccess,
    onCancel
}: DemandeDispenseFormProps) => {
    const [motif, setMotif] = useState(motifInitial);
    const [files, setFiles] = useState<FilePondFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [unknownCoursesForms, setUnknownCoursesForms] = useState<UnknownCourseFormData[]>([]);
    const [manualCourses, setManualCourses] = useState<UnknownCourseFormData[]>([]);

    useEffect(() => {
        const unknownEntries: UnknownCourseFormData[] = [];
        if (simulationResult && simulationResult.codesCoursInconnus) {
            for (const code of simulationResult.codesCoursInconnus) {
                const found = simulationCourses.find(c => c.codeCours === code);
                unknownEntries.push({
                    codeEtablissement: found?.codeEtablissement || '',
                    codeCours: code,
                    intituleCours: '',
                    creditsEcts: '',
                    nomEtablissement: '',
                    ficheUeFiles: [],
                });
            }
        }
        setUnknownCoursesForms(unknownEntries);

        if (skippedSimulation || (!simulationResult && !skippedSimulation)) {
            setManualCourses([{
                codeEtablissement: '',
                codeCours: '',
                intituleCours: '',
                creditsEcts: '',
                nomEtablissement: '',
                ficheUeFiles: [],
            }]);
        }
    }, [simulationResult, simulationCourses, skippedSimulation]);

    const handleUnknownCourseChange = (index: number, field: keyof UnknownCourseFormData, value: string) => {
        setUnknownCoursesForms(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
    };

    const handleUnknownCourseFilesChange = (index: number, f: FilePondFile[]) => {
        setUnknownCoursesForms(prev => prev.map((c, i) => i === index ? { ...c, ficheUeFiles: f } : c));
    };

    const handleAddManualCourse = () => {
        setManualCourses(prev => [...prev, {
            codeEtablissement: '', codeCours: '', intituleCours: '', creditsEcts: '', nomEtablissement: '', ficheUeFiles: []
        }]);
    };

    const handleRemoveManualCourse = (index: number) => {
        setManualCourses(prev => prev.filter((_, i) => i !== index));
    };

    const handleManualCourseChange = (index: number, field: keyof UnknownCourseFormData, value: string) => {
        setManualCourses(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
    };

    const handleManualCourseFilesChange = (index: number, f: FilePondFile[]) => {
        setManualCourses(prev => prev.map((c, i) => i === index ? { ...c, ficheUeFiles: f } : c));
    };

    const allUnknownForms = [...unknownCoursesForms, ...manualCourses];
    const hasUnknownCourses = allUnknownForms.length > 0;
    const unknownFormsValid = allUnknownForms.every(c =>
        c.intituleCours.trim() !== '' &&
        c.creditsEcts.trim() !== '' &&
        parseInt(c.creditsEcts) > 0 &&
        c.nomEtablissement.trim() !== '' &&
        c.ficheUeFiles.length > 0
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (hasUnknownCourses && !unknownFormsValid) {
            setError('Veuillez remplir tous les champs obligatoires pour les cours inconnus (intitulé, ECTS, établissement, fiche UE).');
            return;
        }

        const mainFiles = files.map(f => f.file as File);
        
        if (mainFiles.length === 0 && (!hasUnknownCourses || files.length === 0)) {
            // setError("Veuillez joindre au moins une preuve de réussite.");
            // return;
        }

        setLoading(true);
        setError(null);
        try {
            const coursExternes: CoursExterneDemandeInput[] = [];
            const fileObjects = [...mainFiles];

            // Ajouter les cours connus (issus de la simulation)
            for (const c of simulationCourses) {
                const isUnknown = allUnknownForms.some(u => u.codeCours === c.codeCours);
                if (!isUnknown) {
                    coursExternes.push({
                        codeEtablissement: c.codeEtablissement || undefined,
                        codeCours: c.codeCours || undefined,
                        intituleCours: '',
                        creditsEcts: 0,
                        nomEtablissement: '',
                    });
                }
            }

            // Ajouter les cours inconnus avec les infos
            for (const u of allUnknownForms) {
                if (!u.intituleCours.trim()) continue;
                coursExternes.push({
                    codeEtablissement: u.codeEtablissement || undefined,
                    codeCours: u.codeCours || undefined,
                    intituleCours: u.intituleCours,
                    creditsEcts: parseInt(u.creditsEcts),
                    nomEtablissement: u.nomEtablissement,
                });
                for (const fp of u.ficheUeFiles) {
                    fileObjects.push(fp.file as File);
                }
            }

            await requestService.createRequest(ueCode, sectionCode, motif, fileObjects.length > 0 ? fileObjects : undefined, coursExternes.length > 0 ? coursExternes : undefined);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    /** Rendu d'un bloc de champs pour un cours inconnu. */
    const renderUnknownCourseForm = (
        course: UnknownCourseFormData,
        index: number,
        onChange: (idx: number, field: keyof UnknownCourseFormData, value: string) => void,
        onFilesChange: (idx: number, f: FilePondFile[]) => void,
        onRemove?: (idx: number) => void,
    ) => (
        <div key={`unknown-${index}`} className="border border-red-200 bg-red-50 p-5 space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-xs font-bold uppercase tracking-widest text-red-800">
                    {course.codeCours ? `Cours inconnu : ${course.codeCours}` : `Cours ${index + 1}`}
                </p>
                {onRemove && (
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="text-red-400 hover:text-red-600 transition-colors text-xs font-bold uppercase"
                    >
                        Retirer
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nom de l'établissement *</label>
                    <input type="text" className="w-full p-3 bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-orange-500 transition-colors" placeholder="Ex: Haute École XYZ" value={course.nomEtablissement} onChange={e => onChange(index, 'nomEtablissement', e.target.value)} required />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Intitulé du cours *</label>
                    <input type="text" className="w-full p-3 bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-orange-500 transition-colors" placeholder="Ex: Programmation Web Avancée" value={course.intituleCours} onChange={e => onChange(index, 'intituleCours', e.target.value)} required />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Crédits ECTS *</label>
                    <input type="number" min="1" max="60" className="w-full p-3 bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-orange-500 transition-colors" placeholder="Ex: 5" value={course.creditsEcts} onChange={e => onChange(index, 'creditsEcts', e.target.value)} required />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fiche UE *</label>
                <FilePond
                    files={course.ficheUeFiles as never}
                    onupdatefiles={(newFiles) => onFilesChange(index, newFiles)}
                    allowMultiple={false}
                    maxFiles={1}
                    server={null}
                    name="ficheUe"
                    labelIdle='Glissez votre fiche UE ici ou <span class="filepond--label-action">Parcourir</span>'
                    credits={false}
                    acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
                    labelFileTypeNotAllowed="Type de fichier non valide"
                    fileValidateTypeLabelExpectedTypes="Attendu: PDF, JPEG, PNG"
                />
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4">
                <p className="text-blue-800 text-sm">
                    <strong>Soumission officielle</strong><br/>
                    Pour finaliser votre demande de dispense pour l'UE <strong>{ueCode}</strong>, veuillez joindre les preuves nécessaires.
                </p>
            </div>

            {unknownCoursesForms.length > 0 && (
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 p-4">
                        <p className="text-sm font-bold uppercase tracking-widest text-red-800">⚠ Informations complémentaires requises</p>
                        <p className="mt-1 text-sm text-red-700">Certains cours n'ont pas été trouvés dans notre base. Veuillez compléter les informations ci-dessous et joindre la fiche UE correspondante.</p>
                    </div>
                    {unknownCoursesForms.map((course, i) => renderUnknownCourseForm(course, i, handleUnknownCourseChange, handleUnknownCourseFilesChange))}
                </div>
            )}

            {(skippedSimulation || !simulationResult) && (
                <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 p-4">
                        <p className="text-sm font-bold uppercase tracking-widest text-amber-900">Cours externes non référencés</p>
                        <p className="mt-1 text-sm text-amber-800">Ajoutez manuellement les informations relatives aux cours que vous avez validés dans un autre établissement.</p>
                    </div>
                    {manualCourses.map((course, i) => renderUnknownCourseForm(course, i, handleManualCourseChange, handleManualCourseFilesChange, handleRemoveManualCourse))}
                    <button type="button" onClick={handleAddManualCourse} className="text-orange-600 text-sm font-bold uppercase hover:text-orange-800 transition-colors flex items-center gap-1">
                        <span>+</span> Ajouter un cours externe
                    </button>
                </div>
            )}

            <div className="border-t border-gray-200 pt-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Message / Motif (Optionnel)</label>
                <textarea
                    className="w-full bg-white border border-gray-300 p-3 text-gray-900 focus:outline-none focus:border-orange-500 h-24 resize-none"
                    placeholder="Préciser l'année de réussite, informations utiles..."
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Preuves globales (Bulletins, Relevés) {(!hasUnknownCourses) && '*'}</label>
                <FilePond
                    files={files as never}
                    onupdatefiles={setFiles}
                    allowMultiple
                    maxFiles={3}
                    server={null}
                    name="files"
                    labelIdle='Glissez vos fichiers globaux ici ou <span class="filepond--label-action">Parcourir</span>'
                    credits={false}
                    acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
                    labelFileTypeNotAllowed="Type de fichier non valide"
                    fileValidateTypeLabelExpectedTypes="Attendu: PDF, JPEG, PNG"
                />
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-sm">{error}</div>}

            <div className="flex gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={onCancel} disabled={loading} className="flex-1">
                    Annuler
                </Button>
                <Button type="submit" disabled={loading || (hasUnknownCourses && !unknownFormsValid) || (!hasUnknownCourses && files.length === 0)} className="flex-[2]">
                    {loading ? 'Envoi en cours...' : 'Soumettre'}
                </Button>
            </div>
        </form>
    );
};

export default DemandeDispenseForm;