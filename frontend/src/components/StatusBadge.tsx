// Composant pour afficher un badge de statut
type StatusType = 'pending' | 'approved' | 'rejected' | 'processing' | 'active' | 'closed';

interface StatusBadgeProps {
    status: StatusType;
    label?: string;
    className?: string;
}

// Styles de base pour le badge
const BASE_STYLES = 'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border inline-block';

// Configuration des statuts
const STATUS_CONFIG: Record<StatusType, { styles: string; defaultLabel: string }> = {
    pending:    { styles: 'border-yellow-200 bg-yellow-50 text-yellow-700', defaultLabel: 'En attente' },
    approved:   { styles: 'border-green-200 bg-green-50 text-green-700',   defaultLabel: 'Validée'    },
    rejected:   { styles: 'border-red-200 bg-red-50 text-red-700',         defaultLabel: 'Refusée'    },
    processing: { styles: 'border-blue-200 bg-blue-50 text-blue-700',      defaultLabel: 'Traitement' },
    active:     { styles: 'border-green-200 bg-green-50 text-green-700',   defaultLabel: 'Actif'      },
    closed:     { styles: 'bg-gray-500 text-white border-transparent',     defaultLabel: 'Clôturé'    },
};

const StatusBadge = ({ status, label, className = '' }: StatusBadgeProps) => {
    const config = STATUS_CONFIG[status];

    return (
        <span className={`${BASE_STYLES} ${config.styles} ${className}`.trim()}>
            {label ?? config.defaultLabel}
        </span>
    );
};

export default StatusBadge;