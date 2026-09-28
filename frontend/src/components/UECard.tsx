import type { UE } from '../models/UE';

interface UECardProps {
    ue: UE;
    onClick: () => void;
    hasActiveRequest?: boolean;
}

// Composant UECard avec titre, code, ECTS et nombre de périodes
const UECard = ({ ue, onClick, hasActiveRequest = false }: UECardProps) => {
    return (
        <div 
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick();
                }
            }}
            className="group bg-white p-8 border border-gray-200 hover:border-orange-500 transition-all duration-200 cursor-pointer relative shadow-sm hover:shadow-md"
        >
            <div className="flex justify-between items-start mb-6">
                <span className="inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold bg-gray-100 text-gray-600 tracking-widest uppercase border border-gray-200">
                    {ue.code}
                </span>
                <div className="flex items-center gap-2">
                    {hasActiveRequest && (
                        <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300 uppercase tracking-wider">
                            Demande en cours
                        </span>
                    )}
                    <span className="text-xs font-bold text-orange-600 uppercase">{ue.ects} ECTS</span>
                </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors uppercase tracking-tight">
                {ue.nom}
            </h3>
            
            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-medium uppercase tracking-wider">
                <span className="text-gray-500">{ue.nbPeriodes} Périodes</span>
                
                {/* Bouton Détails */}
                <span className="text-gray-900 flex items-center gap-2 group-hover:text-orange-600 transition-colors">
                    Détails
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m0-4H3" />
                    </svg>
                </span>
            </div>
        </div>
    );
};

export default UECard;
