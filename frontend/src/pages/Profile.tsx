import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { userService } from '../api/userService';
import type { UserDto } from '../models/User';

const ProfileField = ({ label, value, mono = false }: { label: string; value?: string; mono?: boolean }) => (
    <div>
        <dt className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</dt>
        <dd className={`text-sm font-medium text-gray-900 bg-gray-50 p-3 border border-gray-200 rounded-sm ${mono ? 'font-mono' : ''}`}>
            {value || '—'}
        </dd>
    </div>
);

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserDto | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.preferred_username) return;
        userService.getUser(user.preferred_username)
            .then(setProfile)
            .catch(err => setError(err instanceof Error ? err.message : 'Échec du chargement du profil'))
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) return <div>Chargement...</div>;

    const initial = profile?.prenom?.[0]?.toUpperCase() || user.given_name?.[0]?.toUpperCase() || 'U';

    return (
        <Layout title="Mon Profil" subtitle="Informations personnelles">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="bg-white rounded p-8 border border-gray-200 shadow-sm flex items-center gap-8">
                    <div className="h-24 w-24 bg-orange-600 rounded flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                        {initial}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-1">
                            {profile?.prenom || user.given_name} {profile?.nom || user.family_name}
                        </h2>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600 tracking-widest uppercase border border-gray-200">
                            Étudiant
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4">
                        <p className="text-sm text-red-700 font-bold">{error}</p>
                    </div>
                )}

                <div className="bg-white rounded p-8 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight mb-6 border-b border-gray-100 pb-4">
                        Informations du Compte
                    </h3>

                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-gray-100 rounded" />)}
                        </div>
                    ) : (
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <ProfileField label="Nom d'utilisateur" value={profile?.username || user.preferred_username} mono />
                            <ProfileField label="Email"   value={profile?.email    || user.email} />
                            <ProfileField label="Prénom"  value={profile?.prenom   || user.given_name} />
                            <ProfileField label="Nom"     value={profile?.nom      || user.family_name} />
                        </dl>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Profile;