
import React from 'react';
import { Page } from '../types';
import { NAV_ITEMS } from '../constants';
import { UserIcon, UsersIcon, ChartBarIcon, CogIcon } from './icons';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const iconMap: { [key in Page]: React.ElementType } = {
  'single-customer': UserIcon,
  'batch-processing': UsersIcon,
  'agent-performance': ChartBarIcon,
  'settings': CogIcon,
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <div className="w-64 bg-brand-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-brand-gray-700">
        <h1 className="text-xl font-bold text-center">🤖 Agentic AI</h1>
        <p className="text-xs text-brand-gray-400 text-center">Churn Prediction</p>
      </div>
      <nav className="mt-4 flex-1">
        <ul>
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.id];
            return (
              <li key={item.id} className="px-2">
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full text-left flex items-center p-3 my-1 rounded-md transition-colors duration-200 ${
                    currentPage === item.id
                      ? 'bg-brand-blue text-white'
                      : 'text-brand-gray-300 hover:bg-brand-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-brand-gray-700 text-center text-xs text-brand-gray-400">
        <p>&copy; {new Date().getFullYear()} Churn AI Systems</p>
      </div>
    </div>
  );
};

export default Sidebar;
