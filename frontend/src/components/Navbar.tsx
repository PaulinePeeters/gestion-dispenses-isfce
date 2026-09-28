import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from './Button';

const Navbar = () => {
    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="fixed w-full z-50 bg-gray-900 text-white border-b border-gray-800 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <Link to="/" className="flex-shrink-0 flex items-center gap-3">
                        <div className="h-10 w-10 bg-orange-600 rounded flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            D
                        </div>
                        <span className="text-2xl font-bold tracking-wider uppercase">DispMatch</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <Button onClick={() => navigate('/dashboard')}>Mon Espace</Button>
                        ) : (
                            <>
                                <button
                                    onClick={login}
                                    className="text-gray-400 hover:text-white font-medium text-sm transition-colors uppercase tracking-wide"
                                >
                                    Connexion
                                </button>
                                <Button onClick={login}>S'inscrire</Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;