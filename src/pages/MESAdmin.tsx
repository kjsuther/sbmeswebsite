import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import Layout from '../components/Layout';
import SliceMaintenance from '../components/SliceMaintenance';

type TabType = 'slices';

const MESAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('slices');

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center mb-8">
          <div className="bg-mn-primary rounded-full p-3 mr-4">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-mn-primary">MES Admin Dashboard</h1>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('slices')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'slices'
                    ? 'border-mn-accent-teal text-mn-accent-teal'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Slice Maintenance
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'slices' && <SliceMaintenance />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MESAdmin;
