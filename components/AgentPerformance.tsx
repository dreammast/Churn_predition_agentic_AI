
import React from 'react';
import MetricCard from './MetricCard';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const riskData = [
  { name: 'Very Low', value: 450, color: '#60a5fa' },
  { name: 'Low', value: 320, color: '#4ade80' },
  { name: 'Medium', value: 280, color: '#facc15' },
  { name: 'High', value: 197, color: '#f87171' },
];

const actionData = [
  { name: 'Discount Offer', successRate: 45 },
  { name: 'Phone Call', successRate: 32 },
  { name: 'Email', successRate: 28 },
  { name: 'SMS', successRate: 18 },
  { name: 'Account Review', successRate: 38 },
];

const AgentPerformance: React.FC = () => {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-brand-gray-900">Agent Performance Analytics</h1>
        <p className="text-brand-gray-600 mt-1">Monitor the effectiveness and impact of the agentic AI system.</p>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Customers Processed" value="1,247" change="12%" isPositive={true} />
        <MetricCard title="Churn Prevention Rate" value="23%" change="5%" isPositive={true} />
        <MetricCard title="Agent Accuracy" value="85%" change="2%" isPositive={true} />
        <MetricCard title="Cost Savings" value="$124K" change="15%" isPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">Customer Risk Distribution</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-brand-gray-800 mb-4">Action Effectiveness (Success Rate %)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={actionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar dataKey="successRate" fill="#1f77b4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentPerformance;
