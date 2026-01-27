// src/components/charts/BarChart.jsx
'use client';

import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Info', students: 500 },
  { name: 'Gest', students: 600 },
  { name: 'Droit', students: 400 },
  { name: 'Arts', students: 300 },
  { name: 'Sci', students: 450 },
  { name: 'Eco', students: 200 },
];

export default function BarChart({ data = [] }) {
  return (
    // On utilise ResponsiveContainer pour que le graphique ne dépasse jamais
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: -25, // Ajusté pour gagner de la place sur les libellés
            bottom: 15,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#888888', fontSize: 12 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#888888', fontSize: 12 }} 
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend />
          {/* IMPORTANT : dataKey="value" car c'est ce que tu envoies depuis AdminDashboard */}
          <Bar 
            name="Nombre d'étudiants"
            dataKey="value" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]} 
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}