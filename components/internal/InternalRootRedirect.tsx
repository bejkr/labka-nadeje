
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shelter } from '../../types';

const InternalRootRedirect: React.FC = () => {
    const { currentUser, isLoading, userRole } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) return;

        if (!currentUser) {
            navigate('/auth?role=shelter');
            return;
        }

        if (userRole === 'shelter') {
            const shelter = currentUser as Shelter;
            if (shelter.slug) {
                navigate(`/${shelter.slug}`);
            } else {
                // Fallback for shelters without slugs (should rarely happen with new system)
                navigate(`/${shelter.id}`);
            }
        } else {
            // Logged in as regular user but trying to access internal system
            // Maybe redirect to public site or show error?
            // For now, redirect to auth to switch accounts
            navigate('/auth?role=shelter');
        }
    }, [currentUser, isLoading, userRole, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-400">Načítavam...</div>
            </div>
        );
    }

    return null;
};

export default InternalRootRedirect;
