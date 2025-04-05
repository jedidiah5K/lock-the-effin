import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import { useMoneyStore } from '../../store/moneyStore';
import { formatCurrency } from '../../utils/currencyUtils';

interface SpendingChartProps {
  data: Record<string, number>;
}

// Chart colors - pastel palette
const chartColors = [
  'rgba(79, 70, 229, 0.7)',   // Indigo
  'rgba(236, 72, 153, 0.7)',  // Pink
  'rgba(245, 158, 11, 0.7)',  // Amber
  'rgba(16, 185, 129, 0.7)',  // Emerald
  'rgba(59, 130, 246, 0.7)',  // Blue
  'rgba(139, 92, 246, 0.7)',  // Purple
  'rgba(239, 68, 68, 0.7)',   // Red
  'rgba(14, 165, 233, 0.7)',  // Sky
  'rgba(20, 184, 166, 0.7)',  // Teal
  'rgba(249, 115, 22, 0.7)',  // Orange
  'rgba(168, 85, 247, 0.7)',  // Violet
  'rgba(217, 70, 239, 0.7)',  // Fuchsia
];

const SpendingChart: React.FC<SpendingChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { defaultCurrency } = useMoneyStore();
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Prepare data for chart
    const categories = Object.keys(data);
    const values = Object.values(data);
    const total = values.reduce((sum, val) => sum + val, 0);
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories,
        datasets: [{
          data: values,
          backgroundColor: categories.map((_, i) => chartColors[i % chartColors.length]),
          borderColor: 'rgba(255, 255, 255, 0.5)',
          borderWidth: 1,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              padding: 15,
              font: {
                size: 11
              },
              generateLabels: (chart) => {
                const data = chart.data;
                if (data.labels && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i] as number;
                    const percentage = ((value / total) * 100).toFixed(1);
                    const formattedValue = formatCurrency(value, defaultCurrency);
                    
                    return {
                      text: `${label}: ${formattedValue} (${percentage}%)`,
                      fillStyle: chartColors[i % chartColors.length],
                      strokeStyle: 'rgba(255, 255, 255, 0.5)',
                      lineWidth: 1,
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${formatCurrency(value, defaultCurrency)} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '65%',
        animation: {
          animateRotate: true,
          animateScale: true
        }
      }
    });
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, defaultCurrency]);
  
  return (
    <div className="relative h-full">
      {Object.keys(data).length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500 dark:text-slate-400">No spending data to display</p>
        </div>
      ) : (
        <>
          <canvas ref={chartRef}></canvas>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(
                Object.values(data).reduce((sum, val) => sum + val, 0),
                defaultCurrency
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default SpendingChart;
