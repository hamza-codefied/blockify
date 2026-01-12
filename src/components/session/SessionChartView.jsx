import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Rectangle,
} from 'recharts';
import { Select, Spin, Empty } from 'antd';
import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { Typography as PageTitle } from '@/components/common/PageTitle';

const { Option } = Select;

// Custom tick component for multi-line labels
const CustomXAxisTick = ({ x, y, payload }) => {
  const lines = payload.value.split('\n');
  return (
    <g transform={`translate(${x},${y + 10})`}>
      <text x={0} y={0} dy={0} textAnchor="middle" fill="#6B7280" fontSize={14} fontWeight={500}>
        <tspan x="0" dy="0">{lines[0]}</tspan>
        <tspan x="0" dy="18">{lines[1]}</tspan>
      </text>
    </g>
  );
};

/**
 * Pure presentational Session Chart Component
 * Handles only rendering - all data and configuration comes from props
 * 
 * @param {Object} props
 * @param {Array} props.sessions - Array of session objects
 * @param {boolean} props.isLoading - Loading state
 * @param {Array} props.options - Dropdown options [{id, label}]
 * @param {string|null} props.selectedId - Selected option ID
 * @param {Function} props.onSelectionChange - Callback when selection changes
 * @param {string} props.title - Chart title
 * @param {string} props.placeholder - Dropdown placeholder
 * @param {number} props.dropdownWidth - Dropdown width
 * @param {string} props.emptyMessage - Empty state message
 * @param {boolean} props.showEmptyState - Whether to show empty state
 * @param {string} props.chartId - Unique ID for gradient definitions
 */
export const SessionChartView = ({
  sessions = [],
  isLoading = false,
  options = [],
  selectedId = null,
  onSelectionChange,
  title = 'Session Chart',
  placeholder = 'Select',
  dropdownWidth = 120,
  emptyMessage = 'No data available',
  showEmptyState = false,
  chartId = 'default',
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Process sessions data to group by day
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = dayjs().subtract(6 - i, 'days');
      return {
        date,
        dayName: date.format('dddd'),
        dateStr: date.format('DD-MMM'),
        dateOnly: date.format('YYYY-MM-DD'),
      };
    });

    return last7Days.map(({ date, dayName, dateStr, dateOnly }) => {
      const daySessions = sessions.filter(session => {
        if (!session.sessionDate) return false;
        const sessionDateOnly = dayjs(session.sessionDate).format('YYYY-MM-DD');
        return sessionDateOnly === dateOnly;
      });

      const inSession = daySessions.filter(s => s.startTimestamp !== null && s.startTimestamp !== undefined).length;
      const notInSession = daySessions.filter(s => s.startTimestamp === null || s.startTimestamp === undefined).length;

      return {
        day: `${dayName}\n${dateStr}`,
        dayLabel: `${dayName}\n${dateStr}`,
        inSession,
        notInSession,
      };
    });
  }, [sessions]);

  if (isLoading) {
    return (
      <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700'>
        <div className='flex justify-center items-center h-64'>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (showEmptyState && options.length === 0) {
    return (
      <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700'>
        <div className='flex justify-center items-center h-64'>
          <Empty description={emptyMessage} />
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700'>
      <div className='flex justify-between items-center mb-4'>
        <PageTitle variant='primary'>{title}</PageTitle>

        <Select
          placeholder={placeholder}
          style={{ width: dropdownWidth }}
          value={selectedId}
          onChange={onSelectionChange}
          allowClear
        >
          {options.map(option => (
            <Option key={option.id} value={option.id}>
              {option.label}
            </Option>
          ))}
        </Select>
      </div>

      <ResponsiveContainer width='100%' height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 0, bottom: 35 }}
          barCategoryGap='20%'
        >
          <defs>
            <linearGradient id={`blueGradient-${chartId}`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#CCD9F1" stopOpacity={1} />
              <stop offset="100%" stopColor="#0040B8" stopOpacity={1} />
            </linearGradient>
            <linearGradient id={`orangeGradient-${chartId}`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#FCE0DA" stopOpacity={1} />
              <stop offset="100%" stopColor="#F16548" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray='3 3' 
            vertical={false} 
            stroke='#A0AEC0'
            strokeWidth={1}
          />
          <XAxis
            dataKey='dayLabel'
            interval={0}
            height={isMobile ? 90 : 80}
            axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
            tickLine={false}
            tick={<CustomXAxisTick />}
          />
          <YAxis 
            tick={{ 
              fontSize: 12,
              fill: '#6B7280',
              fontWeight: 400
            }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            labelStyle={{
              color: '#374151',
              fontWeight: 600,
              marginBottom: '4px'
            }}
          />
          <Legend
            iconType='circle'
            iconSize={20}
            wrapperStyle={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            content={(props) => {
              const { payload } = props;
              return (
                <ul style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '60px', listStyle: 'none', padding: 0, margin: 0 }}>
                  {payload.map((entry, index) => (
                    <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" style={{ verticalAlign: 'middle' }}>
                        <circle cx="10" cy="10" r="10" fill={entry.color} />
                      </svg>
                      <span style={{ color: '#A0AEC0', fontSize: '15px', fontWeight: 400, marginLeft: '5px' }}>
                        {entry.value}
                      </span>
                    </li>
                  ))}
                </ul>
              );
            }}
          />

          <Bar
            dataKey='inSession'
            fill={`url(#blueGradient-${chartId})`}
            radius={[10, 10, 0, 0]}
            barSize={15}
            name='Students in Session'
            activeBar={<Rectangle fill='#0040B8' stroke='#0040B8' strokeWidth={1} />}
          />
          <Bar
            dataKey='notInSession'
            fill={`url(#orangeGradient-${chartId})`}
            radius={[10, 10, 0, 0]}
            barSize={15}
            name='Students Not in Session'
            activeBar={<Rectangle fill='#F16548' stroke='#F16548' strokeWidth={1} />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

