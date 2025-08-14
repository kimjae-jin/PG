import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertTriangle className="h-16 w-16 text-yellow-400 mb-4" />
            <h1 className="text-4xl font-bold text-text-primary mb-2">404 - Page Not Found</h1>
            <p className="text-lg text-text-secondary mb-6">
                The page you are looking for does not exist.
            </p>
            <Link to="/" className="px-6 py-2 bg-primary text-white rounded-md font-semibold hover:bg-primary-hover transition-colors">
                Go to Dashboard
            </Link>
        </div>
    );
};

export default NotFoundPage;
