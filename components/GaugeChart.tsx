
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { RiskLevel } from '../types';

interface GaugeChartProps {
  value: number; // 0 to 1
  riskLevel: RiskLevel;
}

const RISK_COLOR_MAP: Record<RiskLevel, string> = {
  VERY_LOW: '#3b82f6', // blue-500
  LOW: '#22c55e',      // green-500
  MEDIUM: '#f59e0b',   // amber-500
  HIGH: '#ef4444',     // red-500
};

const GaugeChart: React.FC<GaugeChartProps> = ({ value, riskLevel }) => {
  const percentage = Math.round(value * 100);
  const data = [
    { name: 'value', value: percentage },
    { name: 'remaining', value: 100 - percentage },
  ];

  const color = RISK_COLOR_MAP[riskLevel] || '#6b7280'; // gray-500 as fallback

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius="60%"
            outerRadius="100%"
            fill="#8884d8"
            paddingAngle={0}
            dataKey="value"
            cornerRadius={20}
          >
            <Cell key="cell-0" fill={color} />
            <Cell key="cell-1" fill="#e5e7eb" />
             <Label
              value={`${percentage}%`}
              position="center"
              dy={-10}
              className="text-3xl font-bold"
              style={{ fill: color, transform: 'translateY(-10px)' }}
            />
            <Label
                value="Probability"
                position="center"
                dy={20}
                className="text-sm font-medium text-gray-500"
                style={{ fill: '#6b7280', transform: 'translateY(-10px)' }}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GaugeChart;
