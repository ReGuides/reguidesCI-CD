'use client';

interface ChartData {
  labels: string[];
  data: number[];
  color?: string;
}

interface DashboardChartProps {
  data: ChartData;
  type: 'bar' | 'line' | 'progress';
  title: string;
  height?: number;
}

export default function DashboardChart({ data, type, title, height = 200 }: DashboardChartProps) {
  const maxValue = Math.max(...data.data, 1);
  
  if (type === 'bar') {
    return (
      <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
        <h3 className="text-white font-semibold mb-4 text-center">{title}</h3>
        <div className="flex items-end justify-between h-32 gap-2">
          {data.data.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-purple-600 to-purple-500 rounded-t transition-all duration-300 hover:from-purple-500 hover:to-purple-400"
                style={{ height: `${(value / maxValue) * 100}%` }}
              />
              <span className="text-xs text-gray-400 mt-2 text-center">
                {data.labels[index]}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-sm text-gray-400">
          Максимум: {maxValue}
        </div>
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
        <h3 className="text-white font-semibold mb-4 text-center">{title}</h3>
        <div className="relative h-32">
          <svg className="w-full h-full" viewBox={`0 0 ${data.data.length * 50} 100`}>
            <polyline
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              points={data.data.map((value, index) => 
                `${index * 50},${100 - (value / maxValue) * 80}`
              ).join(' ')}
            />
            {data.data.map((value, index) => (
              <circle
                key={index}
                cx={index * 50}
                cy={100 - (value / maxValue) * 80}
                r="3"
                fill="#8b5cf6"
              />
            ))}
          </svg>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          {data.labels.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'progress') {
    const percentage = (data.data[0] / maxValue) * 100;
    return (
      <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
        <h3 className="text-white font-semibold mb-4 text-center">{title}</h3>
        <div className="relative">
          <div className="w-full bg-neutral-700 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-purple-600 to-purple-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-center mt-2">
            <span className="text-2xl font-bold text-white">{Math.round(percentage)}%</span>
            <div className="text-sm text-gray-400">{data.labels[0]}</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
