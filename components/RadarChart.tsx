import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint } from '../types';

interface RadarChartProps {
  data: ChartDataPoint[];
}

export const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  return (
    <div className="relative aspect-square w-full max-w-[400px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#283843" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#99b1c2', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Your Score"
            dataKey="A"
            stroke="#2e87c2"
            strokeWidth={3}
            fill="#2e87c2"
            fillOpacity={0.2}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};
