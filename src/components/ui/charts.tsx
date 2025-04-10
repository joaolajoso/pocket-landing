
import React from "react";
import { 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B6B'];

interface BarChartProps {
  data: any[];
  categories: string[];
  index: string;
  valueFormatter?: (value: number) => string;
  height?: number;
}

export const BarChart = ({ 
  data, 
  categories, 
  index, 
  valueFormatter = (value) => `${value}`,
  height = 300
}: BarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey={index} 
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis 
          tickFormatter={valueFormatter}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <Tooltip 
          formatter={valueFormatter}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            fontSize: '12px'
          }}
        />
        {categories.map((category, index) => (
          <Bar 
            key={category}
            dataKey={category} 
            fill={COLORS[index % COLORS.length]} 
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

interface PieChartProps {
  data: any[];
  category: string;
  index: string;
  valueFormatter?: (value: number) => string;
  height?: number;
}

export const PieChart = ({
  data,
  category,
  index,
  valueFormatter = (value) => `${value}`,
  height = 300
}: PieChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey={category}
          nameKey={index}
          label={({ name, value }) => `${name}: ${valueFormatter(value)}`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [valueFormatter(value as number), '']}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            fontSize: '12px'
          }}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
