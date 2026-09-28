import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { ueService } from '../api/ueService';
import type { Section } from '../models/Section';
import type { UE } from '../models/UE';
import { FilePond, registerPlugin } from 'react-filepond';
import type { FilePondFile } from 'filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import { requestService } from '../api/requestService';
import SimulateurDispense from '../components/SimulateurDispense';
import type { SimulationResponse, CoursExterneSimulation } from '../models/Simulation';
import type { CoursExterneDemandeInput } from '../models/CoursExterneDemande';

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

type Step = 'SELECTION' | 'SIMULATION' | 'SOUMISSION';

const STEPS: Step[] = ['SELECTION', 'SIMULATION', 'SOUMISSION'];

const STEP_LABELS: Record<Step, string> = {
    SELECTION:  '1. Sélection',
    SIMULATION: '2. Simulation',
    SOUMISSION: '3. Soumission',
};

// Helper pour obtenir le label et les styles CSS d'un résultat de simulation
const getSimResultConfig = (res: SimulationResponse) => {
    if (res.dispenseAcceptee) return { label: 'Validée', styles: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    if (res.coursInconnus) return { label: 'Inconnue', styles: 'text-red-800 bg-red-50 border-red-200' };
    if (res.pourcentageCouvert === 0) return { label: 'Aucune', styles: 'text-red-800 bg-red-50 border-red-200' };
    return { label: 'Partielle', styles: 'text-amber-800 bg-amber-50 border-amber-200' };
};

/** Données complémentaires saisies par l'étudiant pour un cours inconnu. */
interface UnknownCourseFormData {
    codeEtablissement: string;
    codeCours: string;
    intituleCours: string;
    creditsEcts: string;
    nomEtablissement: string;
    ficheUeFiles: FilePondFile[];
}

const NewRequest = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('SELECTION');
    const [error, setError] = useState<string | null>(null);

    const [sections, setSections] = useState<Section[]>([]);
    const [selectedSection, setSelectedSection] = useState('');
    const [ues, setUEs] = useState<UE[]>([]);
    const [selectedUEs, setSelectedUEs] = useState<string[]>([]);

    const [simulationIndex, setSimulationIndex] = useState(0);
    const [simulationResults, setSimulationResults] = useState<Record<string, SimulationResponse>>({});
    // Cours soumis lors de chaque simulation, par code UE
    const [simulationCourses, setSimulationCourses] = useState<Record<string, CoursExterneSimulation[]>>({});

    const [motif, setMotif] = useState('');
    const [files, setFiles] = useState<FilePondFile[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cours inconnus détectés à travers toutes les simulations
    const [unknownCoursesForms, setUnknownCoursesForms] = useState<UnknownCourseFormData[]>([]);
    // Cours ajoutés manuellement (quand l'étudiant a cliqué "Continuer sans cours externe")
    const [manualCourses, setManualCourses] = useState<UnknownCourseFormData[]>([]);
    const [skippedSimulation, setSkippedSimulation] = useState(false);

    useEffect(() => {
        ueService.getSections()
            .then(setSections)
            .catch(() => setError('Erreur lors du chargement des sections.'));
    }, []);

    useEffect(() => {
        if (!selectedSection) return;
        ueService.getUEs(selectedSection)
            .then(data => { setUEs(data); setSelectedUEs([]); })
            .catch(() => setError('Erreur lors du chargement des UEs.'));
    }, [selectedSection]);

    const handleUEChange = (ueCode: string) => {
        setSelectedUEs(prev =>
            prev.includes(ueCode) ? prev.filter(c => c !== ueCode) : [...prev, ueCode]
        );
    };

    const handleStartSimulation = () => {
        if (selectedUEs.length === 0) return;
        setSimulationIndex(0);
        setSimulationResults({});
        setSimulationCourses({});
        setSkippedSimulation(false);
        setStep('SIMULATION');
    };

    const handleSimulationDone = (result: SimulationResponse, coursUtilises: CoursExterneSimulation[]) => {
        const ueCode = selectedUEs[simulationIndex];
        setSimulationResults(prev => ({ ...prev, [ueCode]: result }));
        setSimulationCourses(prev => ({ ...prev, [ueCode]: coursUtilises }));

        const next = simulationIndex + 1;
        if (next < selectedUEs.length) {
            setSimulationIndex(next);
        } else {
            prepareSubmissionStep({ ...simulationResults, [ueCode]: result }, { ...simulationCourses, [ueCode]: coursUtilises });
        }
    };

    /**
     * Prépare l'étape de soumission : détecte les cours inconnus pour afficher le formulaire enrichi.
     */
    const prepareSubmissionStep = (
        results: Record<string, SimulationResponse>,
        courses: Record<string, CoursExterneSimulation[]>
    ) => {
        // Collecter tous les codes de cours inconnus à travers les simulations
        const unknownCodesSet = new Set<string>();
        const unknownEntries: UnknownCourseFormData[] = [];

        for (const [, result] of Object.entries(results)) {
            if (result.codesCoursInconnus) {
                for (const code of result.codesCoursInconnus) {
                    if (!unknownCodesSet.has(code)) {
                        unknownCodesSet.add(code);
                        // Trouver l'établissement associé
                        let etabCode = '';
                        for (const [, courseList] of Object.entries(courses)) {
                            const found = courseList.find(c => c.codeCours === code);
                            if (found) { etabCode = found.codeEtablissement; break; }
                        }
                        unknownEntries.push({
                            codeEtablissement: etabCode,
                            codeCours: code,
                            intituleCours: '',
                            creditsEcts: '',
                            nomEtablissement: '',
                            ficheUeFiles: [],
                        });
                    }
                }
            }
        }

        setUnknownCoursesForms(unknownEntries);
        setStep('SOUMISSION');
    };

    const handleUnknownCourseChange = (index: number, field: keyof UnknownCourseFormData, value: string) => {
        setUnknownCoursesForms(prev =>
            prev.map((c, i) => i === index ? { ...c, [field]: value } : c)
        );
    };

    const handleUnknownCourseFilesChange = (index: number, files: FilePondFile[]) => {
        setUnknownCoursesForms(prev =>
            prev.map((c, i) => i === index ? { ...c, ficheUeFiles: files } : c)
        );
    };

    // Gestion des cours manuels (ajoutés quand aucun dans la liste)
    const handleAddManualCourse = () => {
        setManualCourses(prev => [...prev, {
            codeEtablissement: '',
            codeCours: '',
            intituleCours: '',
            creditsEcts: '',
            nomEtablissement: '',
            ficheUeFiles: [],
        }]);
    };

    const handleRemoveManualCourse = (index: number) => {
        setManualCourses(prev => prev.filter((_, i) => i !== index));
    };

    const handleManualCourseChange = (index: number, field: keyof UnknownCourseFormData, value: string) => {
        setManualCourses(prev =>
            prev.map((c, i) => i === index ? { ...c, [field]: value } : c)
        );
    };

    const handleManualCourseFilesChange = (index: number, files: FilePondFile[]) => {
        setManualCourses(prev =>
            prev.map((c, i) => i === index ? { ...c, ficheUeFiles: files } : c)
        );
    };

    // Déterminer si le formulaire est valide
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
        if (selectedUEs.length === 0) return;

        if (hasUnknownCourses && !unknownFormsValid) {
            setError('Veuillez remplir tous les champs obligatoires pour les cours inconnus (intitulé, ECTS, établissement, fiche UE).');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            const fileObjects = files.map(f => f.file as File);

            // Construire la liste de cours externes à envoyer
            const coursExternes: CoursExterneDemandeInput[] = [];

            // Ajouter les cours connus (issus des simulations)
            for (const [, courseList] of Object.entries(simulationCourses)) {
                for (const c of courseList) {
                    // Vérifier si ce cours est dans la liste des inconnus
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
            }

            // Ajouter les cours inconnus avec les infos complémentaires
            for (const u of allUnknownForms) {
                coursExternes.push({
                    codeEtablissement: u.codeEtablissement || undefined,
                    codeCours: u.codeCours || undefined,
                    intituleCours: u.intituleCours,
                    creditsEcts: parseInt(u.creditsEcts),
                    nomEtablissement: u.nomEtablissement,
                });
                // Ajouter les fiches UE aux fichiers
                for (const fp of u.ficheUeFiles) {
                    fileObjects.push(fp.file as File);
                }
            }

            await Promise.all(
                selectedUEs.map(ueCode =>
                    requestService.createRequest(ueCode, selectedSection, motif, fileObjects,
                        coursExternes.length > 0 ? coursExternes : undefined)
                )
            );
            navigate('/requests');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la création des demandes.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentUE = ues.find(u => u.code === selectedUEs[simulationIndex]);
    const stepIndex = STEPS.indexOf(step);

    /** Rendu d'un bloc de champs pour un cours inconnu. */
    const renderUnknownCourseForm = (
        course: UnknownCourseFormData,
        index: number,
        onChange: (idx: number, field: keyof UnknownCourseFormData, value: string) => void,
        onFilesChange: (idx: number, files: FilePondFile[]) => void,
        onRemove?: (idx: number) => void,
    ) => (
        <div key={`unknown-${index}`} className="border border-red-200 bg-red-50 p-5 space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-xs font-bold uppercase tracking-widest text-red-800">
                    {course.codeCours ? `Cours inconnu : ${course.codeCours}` : `Cours inconnu #${index + 1}`}
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
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Nom de l'établissement *
                    </label>
                    <input
                        type="text"
                        className="w-full p-3 bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="Ex: Haute École XYZ"
                        value={course.nomEtablissement}
                        onChange={e => onChange(index, 'nomEtablissement', e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Intitulé du cours *
                    </label>
                    <input
                        type="text"
                        className="w-full p-3 bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="Ex: Programmation Web Avancée"
                        value={course.intituleCours}
                        onChange={e => onChange(index, 'intituleCours', e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Crédits ECTS *
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="60"
                        className="w-full p-3 bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="Ex: 5"
                        value={course.creditsEcts}
                        onChange={e => onChange(index, 'creditsEcts', e.target.value)}
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Fiche UE *
                </label>
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
        <Layout title="Nouvelle Demande" subtitle="Soumettre un dossier de dispense">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Stepper */}
                <div className="flex items-center gap-0">
                    {STEPS.map((s, i) => (
                        <Fragment key={s}>
                            <div className={[
                                'flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 border-2 transition-colors',
                                step === s        ? 'bg-orange-600 text-white border-orange-600' :
                                stepIndex > i     ? 'bg-gray-900 text-white border-gray-900' :
                                                    'bg-white text-gray-400 border-gray-200'
                            ].join(' ')}>
                                <span>{i + 1}</span>
                                <span className="hidden sm:inline">{STEP_LABELS[s].slice(3)}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`h-0.5 flex-1 ${stepIndex > i ? 'bg-gray-900' : 'bg-gray-200'}`} />
                            )}
                        </Fragment>
                    ))}
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-sm">{error}</div>
                )}

                <div className="bg-white p-8 border border-gray-300">

                    {/* ÉTAPE 1 */}
                    {step === 'SELECTION' && (
                        <>
                            <h2 className="text-xl font-bold mb-8 uppercase tracking-wide border-b border-gray-100 pb-4">
                                {STEP_LABELS.SELECTION} — Section et UEs
                            </h2>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Section d'études
                                </label>
                                <select
                                    className="w-full p-4 bg-gray-50 border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors rounded-none"
                                    value={selectedSection}
                                    onChange={e => setSelectedSection(e.target.value)}
                                >
                                    <option value="">-- Sélectionner une section --</option>
                                    {sections.map(s => (
                                        <option key={s.code} value={s.code}>{s.nom}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-8">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                    Unités d'enseignement (sélection multiple)
                                </label>
                                {!selectedSection ? (
                                    <div className="text-gray-400 italic text-sm p-4 border border-dashed rounded bg-gray-50">
                                        Veuillez d'abord sélectionner une section.
                                    </div>
                                ) : ues.length === 0 ? (
                                    <div className="text-gray-400 italic text-sm">Aucune UE disponible.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded">
                                        {ues.map(ue => (
                                            <label
                                                key={ue.code}
                                                className={[
                                                    'flex items-start space-x-3 p-3 rounded cursor-pointer transition-colors border',
                                                    selectedUEs.includes(ue.code)
                                                        ? 'bg-orange-50 border-orange-200'
                                                        : 'hover:bg-gray-50 border-transparent'
                                                ].join(' ')}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                                                    checked={selectedUEs.includes(ue.code)}
                                                    onChange={() => handleUEChange(ue.code)}
                                                />
                                                <div className="text-sm">
                                                    <span className="font-bold text-gray-900 block">{ue.code}</span>
                                                    <span className="text-gray-600">{ue.nom}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 mt-2 text-right">
                                    {selectedUEs.length} UE(s) sélectionnée(s)
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button variant="ghost" onClick={() => navigate('/requests')}>Annuler</Button>
                                <Button variant="secondary" size="lg" onClick={handleStartSimulation} disabled={selectedUEs.length === 0 || !selectedSection}>
                                    Simuler la correspondance →
                                </Button>
                            </div>
                        </>
                    )}

                    {/* ÉTAPE 2 */}
                    {step === 'SIMULATION' && currentUE && (
                        <>
                            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                                <h2 className="text-xl font-bold uppercase tracking-wide">{STEP_LABELS.SIMULATION}</h2>
                                <span className="text-xs text-gray-400 font-bold uppercase">
                                    UE {simulationIndex + 1} / {selectedUEs.length}
                                </span>
                            </div>

                            <SimulateurDispense
                                ueCode={currentUE.code}
                                ueName={currentUE.nom}
                                onSimulationDone={handleSimulationDone}
                                onContinueWithoutCourses={() => {
                                    setSkippedSimulation(true);
                                    const next = simulationIndex + 1;
                                    if (next < selectedUEs.length) setSimulationIndex(next);
                                    else {
                                        setUnknownCoursesForms([]);
                                        if (manualCourses.length === 0) {
                                            setManualCourses([{
                                                codeEtablissement: '', codeCours: '', intituleCours: '', creditsEcts: '', nomEtablissement: '', ficheUeFiles: []
                                            }]);
                                        }
                                        setStep('SOUMISSION');
                                    }
                                }}
                            />

                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <Button variant="ghost" onClick={() => {
                                    setSkippedSimulation(true);
                                    setUnknownCoursesForms([]);
                                    if (manualCourses.length === 0) {
                                        setManualCourses([{
                                            codeEtablissement: '', codeCours: '', intituleCours: '', creditsEcts: '', nomEtablissement: '', ficheUeFiles: []
                                        }]);
                                    }
                                    setStep('SOUMISSION');
                                }}>
                                    Passer la simulation
                                </Button>
                            </div>
                        </>
                    )}

                    {/* ÉTAPE 3 */}
                    {step === 'SOUMISSION' && (
                        <>
                            <h2 className="text-xl font-bold mb-8 uppercase tracking-wide border-b border-gray-100 pb-4">
                                {STEP_LABELS.SOUMISSION} — Documents et motif
                            </h2>

                            {Object.keys(simulationResults).length > 0 && (
                                <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
                                    <p className="text-xs font-bold uppercase text-gray-500 mb-3">Résumé des simulations</p>
                                    <div className="space-y-2">
                                        {selectedUEs.map(code => {
                                            const res = simulationResults[code];
                                            const config = res ? getSimResultConfig(res) : null;
                                            return (
                                                <div key={code} className="flex items-center justify-between text-sm">
                                                    <span className="font-bold text-gray-700">{code}</span>
                                                    {config ? (
                                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 border ${config.styles}`}>
                                                            {config.label}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Non simulée</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Bloc cours inconnus issus de la simulation */}
                            {unknownCoursesForms.length > 0 && (
                                <div className="mb-6 space-y-4">
                                    <div className="bg-red-50 border border-red-200 p-4">
                                        <p className="text-sm font-bold uppercase tracking-widest text-red-800">
                                            ⚠ Informations complémentaires requises
                                        </p>
                                        <p className="mt-1 text-sm text-red-700">
                                            Certains cours n'ont pas été trouvés dans notre base. Veuillez compléter les informations ci-dessous et joindre la fiche UE correspondante.
                                        </p>
                                    </div>
                                    {unknownCoursesForms.map((course, i) =>
                                        renderUnknownCourseForm(course, i, handleUnknownCourseChange, handleUnknownCourseFilesChange)
                                    )}
                                </div>
                            )}

                            {/* Bloc pour ajouter des cours manuellement (si sim passée ou sautée) */}
                            {(skippedSimulation || Object.keys(simulationResults).length === 0) && (
                                <div className="mb-6 space-y-4">
                                    <div className="bg-amber-50 border border-amber-200 p-4">
                                        <p className="text-sm font-bold uppercase tracking-widest text-amber-900">
                                            Cours externes non référencés
                                        </p>
                                        <p className="mt-1 text-sm text-amber-800">
                                            Si vous avez suivi des cours dans un autre établissement qui ne figurent pas dans nos listes, vous pouvez les ajouter manuellement.
                                        </p>
                                    </div>
                                    {manualCourses.map((course, i) =>
                                        renderUnknownCourseForm(course, i, handleManualCourseChange, handleManualCourseFilesChange, handleRemoveManualCourse)
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleAddManualCourse}
                                        className="text-orange-600 text-sm font-bold uppercase hover:text-orange-800 transition-colors flex items-center gap-1"
                                    >
                                        <span>+</span> Ajouter un cours externe
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Motif de la demande
                                    </label>
                                    <textarea
                                        className="w-full p-4 bg-gray-50 border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors rounded-none min-h-[150px] resize-y"
                                        placeholder="Expliquez brièvement pourquoi vous demandez ces dispenses..."
                                        value={motif}
                                        onChange={e => setMotif(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Documents justificatifs
                                    </label>
                                    <FilePond
                                        files={files as never}
                                        onupdatefiles={setFiles}
                                        allowMultiple
                                        maxFiles={3}
                                        server={null}
                                        name="files"
                                        labelIdle='Glissez vos fichiers ici ou <span class="filepond--label-action">Parcourir</span>'
                                        credits={false}
                                        acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
                                        labelFileTypeNotAllowed="Type de fichier non valide"
                                        fileValidateTypeLabelExpectedTypes="Attendu: PDF, JPEG, PNG"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 uppercase">Formats: PDF, JPG, PNG. Max 5MB.</p>
                                </div>

                                <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-100">
                                    <Button variant="ghost" type="button" onClick={() => setStep('SIMULATION')}>
                                        ← Retour simulation
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button variant="ghost" onClick={() => navigate('/requests')} disabled={isSubmitting}>
                                            Annuler
                                        </Button>
                                        <Button variant="secondary" type="submit" size="lg" disabled={isSubmitting || (hasUnknownCourses && !unknownFormsValid)}>
                                            {isSubmitting ? 'Traitement...' : `Soumettre (${selectedUEs.length}) demande(s)`}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default NewRequest;