// Composant ProcessStep avec numéro, titre et description

interface ProcessStepProps {
    number: number;
    title: string;
    description: string;
}

const ProcessStep = ({ number, title, description }: ProcessStepProps) => {
    return (
        <div className="bg-white p-6 border border-gray-200 text-center">
            <div className="text-3xl font-black text-orange-600 mb-2">{number}</div>
            <div className="text-sm font-bold text-gray-900 mb-1">{title}</div>
            <div className="text-xs text-gray-500">{description}</div>
        </div>
    );
};

export default ProcessStep;
