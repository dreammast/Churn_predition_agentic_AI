
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, isPositive = true }) => {
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
  const changeIcon = isPositive ? '▲' : '▼';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-brand-blue">
      <h3 className="text-sm font-medium text-brand-gray-500 uppercase">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-3xl font-semibold text-brand-gray-900">{value}</p>
      </div>
      <div className={`mt-2 flex items-center text-sm ${changeColor}`}>
        {changeIcon} {change} vs. last period
      </div>
    </div>
  );
};

export default MetricCard;
