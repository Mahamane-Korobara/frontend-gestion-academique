// src/components/charts/PieChart.jsx
'use client';

import { Pie, PieChart as RechartsPieChart, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Femmes', value: 1300 },
  { name: 'Hommes', value: 1150 },
];

const COLORS = ['#3b82f6', '#9ca3af'];

export default function PieChart({ data = [] }) {
  return (
    <div className="h-64">
        <ResponsiveContainer>
      <RechartsPieChart width={400} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}