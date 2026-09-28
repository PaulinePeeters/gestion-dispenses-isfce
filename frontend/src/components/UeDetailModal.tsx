import { useState } from 'react';
import type { UE } from '../models/UE';
import SimulateurDispense from './SimulateurDispense';
import DemandeDispenseForm from './DemandeDispenseForm';
import Button from './Button';
import type { SimulationResponse, CoursExterneSimulation } from '../models/Simulation';
import { useAuth } from '../context/AuthContext';

interface UeDetailModalProps {
    ue: UE | null;
    sectionCode?: string | null;
    onClose: () => void;
    hasActiveRequest?: boolean;
}

type TabType = 'PROGRAMME' | 'DISPENSE';
type DispenseStep = 'SIMULATION' | 'SOUMISSION' | 'SUCCESS';

const tabClass = (active: boolean) =>
    ['pb-3 text-sm font-bold uppercase tracking-wider border-b-4 transition-colors',
     active ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-900'
    ].join(' ');

const getResultConfig = (result: SimulationResponse) => {
    if (result.dispenseAcceptee) return {
        container: 'bg-emerald-50 border-emerald-200',
        title: 'text-emerald-900',
        message: 'text-emerald-800',
        label: 'Correspondance validée'
    };
    if (result.pourcentageCouvert === 0) return {
        container: 'bg-red-50 border-red-200',
        title: 'text-red-800',
        message: 'text-red-700',
        label: 'Aucun rapport identifié'
    };
    return {
        container: 'bg-amber-50 border-amber-200',
        title: 'text-amber-900',
        message: 'text-amber-800',
        label: 'Correspondance partielle'
    };
};

const UeDetailModal = ({ ue, sectionCode, onClose, hasActiveRequest = false }: UeDetailModalProps) => {
    const { isAuthenticated, login } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('PROGRAMME');
    const [dispenseStep, setDispenseStep] = useState<DispenseStep>('SIMULATION');
    const [simulationResult, setSimulationResult] = useState<SimulationResponse | null>(null);
    const [simulationCourses, setSimulationCourses] = useState<CoursExterneSimulation[]>([]);
    const [skippedSimulation, setSkippedSimulation] = useState(false);

    if (!ue) return null;

    const handleClose = () => {
        setActiveTab('PROGRAMME');
        setDispenseStep('SIMULATION');
        setSimulationResult(null);
        setSimulationCourses([]);
        setSkippedSimulation(false);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
            onClick={handleClose}
        >
            <div
                className="bg-white border-2 border-gray-200 w-[90%] max-w-[700px] max-h-[90vh] flex flex-col shadow-2xl animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-orange-600 hover:bg-orange-50 text-3xl font-bold leading-none p-2 transition-all z-10"
                    onClick={handleClose}
                >
                    &times;
                </button>

                <div className="bg-gray-50 border-b-2 border-gray-200 pt-6 px-8 flex flex-col shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{ue.nom}</h2>
                        <span className="inline-block mt-3 px-4 py-1.5 bg-orange-50 text-orange-600 text-xs font-bold border-2 border-orange-200 uppercase tracking-widest">
                            {ue.code}
                        </span>
                    </div>

                    <div className="flex gap-6 mt-6">
                        <button className={tabClass(activeTab === 'PROGRAMME')} onClick={() => setActiveTab('PROGRAMME')}>
                            Programme
                        </button>
                        <button className={`${tabClass(activeTab === 'DISPENSE')} flex items-center gap-2`} onClick={() => setActiveTab('DISPENSE')}>
                            Demander une dispense
                            {hasActiveRequest && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-300 uppercase tracking-wider">
                                    En cours
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="p-8 bg-white overflow-y-auto flex-1">
                    {activeTab === 'PROGRAMME' && (
                        <div className="animate-fadeIn">
                            <div className="grid grid-cols-3 gap-6 mb-8">
                                {[
                                    { label: 'Référence', value: ue.ref },
                                    { label: 'ECTS', value: ue.ects },
                                    { label: 'Périodes', value: ue.nbPeriodes },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-gray-50 p-5 border border-gray-200 text-center hover:border-orange-600 hover:bg-orange-50 transition-all">
                                        <span className="block text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">{label}</span>
                                        <span className="text-gray-900 text-xl font-black break-all">{value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-gray-900 text-sm font-black uppercase tracking-widest mb-4">Contenu du cours</h3>
                                <div className="text-gray-600 leading-relaxed text-base whitespace-pre-line">{ue.prgm}</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'DISPENSE' && (
                        <div className="animate-fadeIn">
                            {hasActiveRequest ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Demande déjà soumise</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto">Vous avez déjà une demande de dispense en cours ou validée pour cette UE. Consultez vos demandes pour suivre son état.</p>
                                </div>
                            ) : dispenseStep === 'SIMULATION' ? (
                                <>
                                    <SimulateurDispense
                                        ueCode={ue.code}
                                        ueName={ue.nom}
                                        onSimulationDone={(res, courses) => {
                                            setSimulationResult(res);
                                            setSimulationCourses(courses);
                                            setSkippedSimulation(false);
                                        }}
                                        onContinueWithoutCourses={() => {
                                            if (isAuthenticated) {
                                                setSkippedSimulation(true);
                                                setDispenseStep('SOUMISSION');
                                            } else {
                                                login();
                                            }
                                        }}
                                    />

                                    {simulationResult && (() => {
                                        const config = getResultConfig(simulationResult);
                                        return (
                                            <div className={`mt-8 p-6 border-2 animate-slideUp ${config.container}`}>
                                                <h4 className={`text-lg font-black uppercase tracking-tight mb-2 ${config.title}`}>
                                                    {config.label}
                                                </h4>
                                                <p className={`mb-4 ${config.message}`}>{simulationResult.message}</p>

                                                {simulationResult.dispenseAcceptee ? (
                                                    <Button onClick={() => isAuthenticated ? setDispenseStep('SOUMISSION') : login()} className="w-full">
                                                        {isAuthenticated ? 'Poursuivre la demande officielle' : 'Se connecter pour poursuivre'}
                                                    </Button>
                                                ) : (
                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        {!simulationResult.coursInconnus && (
                                                            <Button variant="secondary" onClick={() => setSimulationResult(null)} className="flex-1">
                                                                Ajouter d'autres cours
                                                            </Button>
                                                        )}
                                                        <Button variant="secondary" onClick={() => isAuthenticated ? setDispenseStep('SOUMISSION') : login()} className="flex-1">
                                                            {isAuthenticated ? 'Soumettre pour analyse manuelle' : 'Se connecter pour soumettre'}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </>
                            ) : dispenseStep === 'SOUMISSION' ? (
                                <DemandeDispenseForm
                                    ueCode={ue.code}
                                    sectionCode={sectionCode || ue.sectionCode || ''}
                                    simulationResult={simulationResult}
                                    simulationCourses={simulationCourses}
                                    skippedSimulation={skippedSimulation}
                                    onSuccess={() => setDispenseStep('SUCCESS')}
                                    onCancel={() => setDispenseStep('SIMULATION')}
                                />
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Demande envoyée</h3>
                                    <p className="text-gray-500 mb-8">Votre dossier a bien été mis à jour avec ces nouvelles informations.</p>
                                    <Button onClick={handleClose}>Fermer et retourner au programme</Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UeDetailModal;