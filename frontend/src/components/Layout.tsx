import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

interface LayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

// Composant Layout avec titre et sous-titre
const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    [
        'flex items-center px-6 py-3 text-gray-400 font-medium border-l-4 border-transparent',
        'hover:bg-gray-800 hover:text-white hover:border-gray-600',
        isActive ? 'bg-gray-800 text-white border-orange-500 font-bold' : ''
    ].filter(Boolean).join(' ');

// Navigation links
const NAV_LINKS = [
    { to: '/dashboard', label: 'Tableau de bord' },
    { to: '/courses',   label: 'Cours & Sections' },
    { to: '/requests',  label: 'Mes Dispenses' },
    { to: '/profile',   label: 'Mon Profil' },
];

const Layout = ({ children, title, subtitle }: LayoutProps) => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const username = user?.preferred_username || 'Étudiant';
    const initial = username[0]?.toUpperCase() || 'E';
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans text-sm">
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={closeMobileMenu}
                />
            )}

            <aside className={[
                'w-64 bg-gray-900 z-30 flex flex-col fixed h-full border-r border-gray-800 transition-transform duration-300 ease-in-out',
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
                'md:translate-x-0'
            ].join(' ')}>
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 bg-gray-900">
                    <Link to="/" className="text-xl font-bold text-white tracking-wider uppercase">
                        DispMatch
                    </Link>
                    <button className="md:hidden text-gray-400 hover:text-white" onClick={closeMobileMenu}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 py-4 overflow-y-auto">
                    {NAV_LINKS.map(({ to, label }) => (
                        <NavLink key={to} to={to} className={navLinkClass} onClick={closeMobileMenu}>
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800 bg-gray-900">
                    <Button variant="ghost" onClick={logout} className="w-full">
                        Se déconnecter
                    </Button>
                </div>
            </aside>

            <div className="flex-1 md:ml-64 flex flex-col bg-gray-100 min-h-screen text-gray-900 transition-all duration-300">
                <header className="flex justify-between items-center py-5 px-4 md:px-8 bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="flex items-center">
                        <button className="mr-4 md:hidden text-gray-500 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(true)}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-tight">{title}</h1>
                            {subtitle && <p className="text-gray-500 text-xs mt-1 font-medium hidden md:block">{subtitle}</p>}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right mr-2 hidden md:block">
                            <p className="font-bold text-gray-800">{username}</p>
                            <p className="text-xs text-gray-500">Étudiant</p>
                        </div>
                        <div className="w-8 h-8 bg-orange-600 flex items-center justify-center text-white font-bold text-xs">
                            {initial}
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;