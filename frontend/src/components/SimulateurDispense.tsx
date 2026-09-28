import { useState, useEffect, useCallback } from 'react';
import { dispenseService } from '../api/dispenseService';
import { etablissementService } from '../api/etablissementService';
import { coursService } from '../api/coursService';
import type { SimulationResponse, CoursExterneSimulation } from '../models/Simulation';
import type { Etablissement } from '../models/Etablissement';
import type { CoursExterne } from '../models/CoursExterne';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

interface CoursEntry extends CoursExterneSimulation {
    id: string;
}

interface SimulateurDispenseProps {
    ueCode: string;
    ueName: string;
    onSimulationDone: (response: SimulationResponse, coursUtilises: CoursExterneSimulation[]) => void;
    onContinueWithoutCourses?: () => void;
}

// Composant pour simuler une dispense
const SimulateurDispense = ({ ueCode, ueName, onSimulationDone, onContinueWithoutCourses }: SimulateurDispenseProps) => {
    const { isAuthenticated, login, register } = useAuth();
    const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
    const [availableCourses, setAvailableCourses] = useState<Record<string, CoursExterne[]>>({});
    const [cours, setCours] = useState<CoursEntry[]>([
        { id: crypto.randomUUID(), codeEtablissement: '', codeCours: '' }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedUnavailableCourse = cours.some(entry => {
        if (!entry.codeEtablissement) return false;
        const coursesForEtab = availableCourses[entry.codeEtablissement];
        return Array.isArray(coursesForEtab) && coursesForEtab.length === 0;
    });

    const helperMessage = etablissements.length === 0
        ? 'Aucun établissement n’est actuellement proposé pour la simulation. Vous pouvez tout de même soumettre une demande manuelle.'
        : selectedUnavailableCourse
            ? 'Aucun cours n’est référencé pour l’établissement sélectionné. Vous pouvez poursuivre sans cours externe.'
            : 'Votre établissement ou votre cours n’apparaît pas dans la liste ? Vous pouvez tout de même introduire une demande manuelle.';

    const fetchCoursesForEtab = useCallback((etabCode: string) => {
        if (availableCourses[etabCode]) return;
        coursService.getByEtablissement(etabCode)
            .then(data => {
                setAvailableCourses(prev => ({ ...prev, [etabCode]: data }));
            })
            .catch(() => console.error(`Erreur chargement cours pour ${etabCode}`));
    }, [availableCourses]);

    useEffect(() => {
        etablissementService.getAll()
            .then(data => {
                setEtablissements(data);
            })
            .catch(() => setError("Impossible de charger les établissements."));
    }, []);

    const handleAddCours = () => {
        setCours([...cours, { id: crypto.randomUUID(), codeEtablissement: '', codeCours: '' }]);
    };

    const handleRemoveCours = (index: number) => {
        setCours(cours.filter((_, i) => i !== index));
    };

    const handleChangeEtab = (index: number, value: string) => {
        setCours(cours.map((c, i) => i === index ? { ...c, codeEtablissement: value, codeCours: '' } : c));
        if (value) fetchCoursesForEtab(value);
    };

    const handleChangeCours = (index: number, value: string) => {
        setCours(cours.map((c, i) => i === index ? { ...c, codeCours: value } : c));
    };

    // Fonction pour simuler une dispense
    const handleSimuler = async () => {
        // Vérifie si au moins un code de cours est saisi
        const validCours = cours.filter(c => c.codeCours.trim() !== '');
        if (validCours.length === 0) {
            setError('Veuillez sélectionner au moins un cours ou poursuivre sans cours externe.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const coursToSend: CoursExterneSimulation[] = validCours.map(c => ({
                codeEtablissement: c.codeEtablissement,
                codeCours: c.codeCours
            }));
            const response = await dispenseService.simulerPourUE({
                codeUeCible: ueCode,
                coursExternesProposes: coursToSend
            });
            onSimulationDone(response, coursToSend);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la simulation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 p-4">
                <p className="text-orange-800 text-sm">
                    <strong>Simulation pour {ueName} ({ueCode})</strong><br />
                    Sélectionnez les cours que vous avez réussis dans un autre établissement.
                </p>
            </div>

            <div className="space-y-4">
                {cours.map((c, index) => (
                    <div key={c.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-gray-50 p-4 border border-gray-200">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                                Établissement
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full bg-white border border-gray-300 p-2.5 text-gray-900 focus:outline-none focus:border-orange-500 appearance-none"
                                    value={c.codeEtablissement}
                                    onChange={(e) => handleChangeEtab(index, e.target.value)}
                                >
                                    <option value="">-- Choisir un établissement --</option>
                                    {etablissements.map(etab => (
                                        <option key={etab.code} value={etab.code}>{etab.code} - {etab.nom}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                                Cours
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full bg-white border border-gray-300 p-2.5 text-gray-900 focus:outline-none focus:border-orange-500 appearance-none disabled:bg-gray-100 placeholder-gray-400"
                                    value={c.codeCours}
                                    onChange={(e) => handleChangeCours(index, e.target.value)}
                                    disabled={!c.codeEtablissement}
                                >
                                    <option value="">-- Choisir un cours --</option>
                                    {(availableCourses[c.codeEtablissement] || []).map(coursExt => (
                                        <option key={coursExt.id} value={coursExt.code}>
                                            {coursExt.code} ({coursExt.credits} ects)
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {cours.length > 1 && (
                            <button
                                onClick={() => handleRemoveCours(index)}
                                className="p-2.5 bg-white text-gray-400 hover:text-red-600 hover:border-red-200 transition-all border border-gray-300"
                                title="Retirer ce cours"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleAddCours}
                    className="text-orange-600 text-sm font-bold uppercase hover:text-orange-800 transition-colors flex items-center gap-1"
                >
                    <span>+</span> Ajouter un autre cours
                </button>
            </div>

            <div className="border border-amber-200 bg-amber-50 p-4 space-y-4">
                <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-amber-900">Établissement ou cours introuvable</p>
                    <p className="mt-2 text-sm text-amber-800">{helperMessage}</p>
                </div>

                {onContinueWithoutCourses && (
                    <div className="flex flex-col sm:flex-row gap-3">
                        {isAuthenticated ? (
                            <Button variant="secondary" className="flex-1" onClick={onContinueWithoutCourses}>
                                Continuer sans cours externe
                            </Button>
                        ) : (
                            <>
                                <Button variant="secondary" className="flex-1" onClick={login}>
                                    Se connecter
                                </Button>
                                <Button variant="ghost" className="flex-1" onClick={register}>
                                    Créer un compte
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-sm">{error}</div>
            )}

            <button
                onClick={handleSimuler}
                disabled={loading}
                className="w-full bg-gray-900 text-white font-bold uppercase tracking-widest py-3 hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
                {loading ? 'Vérification en cours...' : 'Vérifier la correspondance'}
            </button>
        </div>
    );
};

export default SimulateurDispense;