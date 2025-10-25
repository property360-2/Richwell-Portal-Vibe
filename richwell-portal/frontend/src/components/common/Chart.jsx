// frontend/src/components/common/Chart.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Chart = ({ 
  title, 
  type = 'bar', 
  data, 
  options = {}, 
  className = '',
  height = 300 
}) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    ...options
  };

  const renderChart = () => {
    switch (type) {
      case 'doughnut':
        return <Doughnut data={data} options={defaultOptions} />;
      case 'line':
        return <Line data={data} options={defaultOptions} />;
      case 'bar':
      default:
        return <Bar data={data} options={defaultOptions} />;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6" style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default Chart;