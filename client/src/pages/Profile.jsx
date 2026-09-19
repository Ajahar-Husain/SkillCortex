import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CandidateProfile from './CandidateProfile';
import HRProfile from './HRProfile';

export default function Profile() {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Render different dashboards based on role
    if (user.role === 'hr') {
        return <HRProfile user={user} />;
    }

    return <CandidateProfile user={user} />;
}
