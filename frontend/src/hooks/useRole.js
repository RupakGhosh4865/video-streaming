import { useAuth } from '../context/AuthContext';

export const useRole = () => {
    const { user } = useAuth();

    const role = user?.role || 'viewer';
    const orgId = user?.orgId || null;

    return {
        role,
        orgId,
        isViewer: role === 'viewer',
        isEditor: role === 'editor',
        isAdmin: role === 'admin',
    };
};
