type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit';
    className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-orange-600 text-white border-transparent hover:bg-orange-700',
    secondary: 'bg-gray-900 text-white border-transparent hover:bg-orange-600 hover:border-orange-700',
    ghost: 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50',
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-3',
};

const Button = ({
    variant = 'primary',
    size = 'md',
    children,
    onClick,
    disabled = false,
    type = 'button',
    className,
}: ButtonProps) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={[
            'font-bold uppercase tracking-widest transition-colors border text-xs',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            variantStyles[variant],
            sizeStyles[size],
            className
        ].filter(Boolean).join(' ')}
    >
        {children}
    </button>
);

export default Button;