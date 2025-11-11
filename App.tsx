
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import SingleCustomerAnalysis from './components/SingleCustomerAnalysis';
import BatchProcessing from './components/BatchProcessing';
import AgentPerformance from './components/AgentPerformance';
import Settings from './components/Settings';
import { Page } from './types';
import { NAV_ITEMS } from './constants';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(NAV_ITEMS[0].id);

  const renderPage = () => {
    switch (currentPage) {
      case 'single-customer':
        return <SingleCustomerAnalysis />;
      case 'batch-processing':
        return <BatchProcessing />;
      case 'agent-performance':
        return <AgentPerformance />;
      case 'settings':
        return <Settings />;
      default:
        return <SingleCustomerAnalysis />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-gray-100 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;
