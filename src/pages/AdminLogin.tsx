import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Bot, Settings } from 'lucide-react';
import { verifyAdminPassword, createAdminSession, isAdminAuthenticated } from '../lib/adminAuth';

type AdminType = 'ai-assistant' | 'mes' | null;

const AdminLogin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdminAuthenticated()) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const isValid = await verifyAdminPassword(password);

      if (isValid) {
        createAdminSession();
        setIsAuthenticated(true);
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSelect = (type: AdminType) => {
    navigate('/admin/portal');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <div className="bg-mn-primary rounded-full p-4">
                <Lock className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-mn-primary">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter the admin password to continue
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-mn-accent-teal focus:border-mn-accent-teal focus:z-10 sm:text-sm"
                placeholder="Admin password"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || !password}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-mn-primary hover:bg-mn-accent-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mn-accent-teal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Verifying...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  useEffect(() => {
    navigate('/admin/portal');
  }, [navigate]);

  return null;
};

export default AdminLogin;
