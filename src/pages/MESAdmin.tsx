import React from 'react';
import { Settings } from 'lucide-react';
import Layout from '../components/Layout';

const MESAdmin: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center mb-8">
          <div className="bg-mn-primary rounded-full p-3 mr-4">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-mn-primary">MES Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manufacturing Execution System Administration</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600 text-center">
            MES Admin content will be added here.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default MESAdmin;
