import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Bot, Settings } from 'lucide-react';

type AdminType = 'ai-assistant' | 'mes' | null;

const AdminLogin: React.FC = () => {
  const [selectedAdmin, setSelectedAdmin] = useState<AdminType>(null);
  const navigate = useNavigate();

  const handleAdminSelect = (type: AdminType) => {
    if (type === 'ai-assistant') {
      navigate('/admin');
    } else if (type === 'mes') {
      navigate('/mes-admin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="bg-mn-primary rounded-full p-4">
              <Lock className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-mn-primary">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select the admin area you would like to access
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <button
            onClick={() => handleAdminSelect('ai-assistant')}
            className="group relative flex flex-col items-center p-8 border-2 border-gray-300 rounded-lg hover:border-mn-accent-teal hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mn-accent-teal"
          >
            <div className="bg-mn-primary rounded-full p-4 mb-4 group-hover:bg-mn-accent-teal transition-colors">
              <Bot className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-mn-primary mb-2">
              AI Assistant Admin
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Manage chatbot content, documents, and knowledge base
            </p>
          </button>

          <button
            onClick={() => handleAdminSelect('mes')}
            className="group relative flex flex-col items-center p-8 border-2 border-gray-300 rounded-lg hover:border-mn-accent-teal hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mn-accent-teal"
          >
            <div className="bg-mn-primary rounded-full p-4 mb-4 group-hover:bg-mn-accent-teal transition-colors">
              <Settings className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-mn-primary mb-2">
              MES Admin
            </h3>
            <p className="text-sm text-gray-600 text-center">
              Manage MES system configuration and settings
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
