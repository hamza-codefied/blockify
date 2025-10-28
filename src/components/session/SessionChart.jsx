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
import { Select } from 'antd';
import { useState, useEffect } from 'react';

export const SessionChart = () => {
  const [grade, setGrade] = useState('9th Grade');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect small screen dynamically
    const handleResize = () => setIsMobile(window.innerWidth < 1024); // sm breakpoint
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartData = [
    { day: 'Monday\n13-Oct', inSession: 120, notInSession: 30 },
    { day: 'Tuesday\n14-Oct', inSession: 125, notInSession: 30 },
    { day: 'Wednesday\n15-Oct', inSession: 30, notInSession: 30 },
    { day: 'Thursday\n16-Oct', inSession: 60, notInSession: 30 },
    { day: 'Friday\n17-Oct', inSession: 90, notInSession: 30 },
    { day: 'Saturday\n18-Oct', inSession: 0, notInSession: 0 },
    { day: 'Sunday\n19-Oct', inSession: 0, notInSession: 0 },
  ];

  return (
    <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700'>
      {/* Header */}
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
          Session - By Grade
        </h2>

        <Select
          value={grade}
          onChange={setGrade}
          size='small'
          style={{ width: 140 }}
          options={[
            { value: '8th Grade', label: '8th Grade' },
            { value: '9th Grade', label: '9th Grade' },
            { value: '10th Grade', label: '10th Grade' },
            { value: '11th Grade', label: '11th Grade' },
            { value: '12th Grade', label: '12th Grade' },
          ]}
        />
      </div>

      {/* Chart */}
      <ResponsiveContainer width='100%' height={260}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          barCategoryGap='25%'
        >
          <CartesianGrid strokeDasharray='3 3' vertical={false} />
          <XAxis
            dataKey='day'
            tick={{ fontSize: isMobile ? 10 : 12 }}
            interval={isMobile ? 0 : 0} // Show all, but smaller font
            angle={isMobile ? -25 : 0} // Tilt for small screens
            textAnchor={isMobile ? 'end' : 'middle'}
            height={isMobile ? 50 : 30}
          />
          <YAxis />
          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Legend
            iconType='circle'
            iconSize={10}
            wrapperStyle={{
              paddingTop: '20px',
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
            }}
          />

          <Bar
            dataKey='inSession'
            fill='#144fbe'
            radius={[8, 8, 0, 0]}
            barSize={10}
            name='Students in Session'
            activeBar={<Rectangle fill='#144fbe' stroke='#144fbe' />}
          />
          <Bar
            dataKey='notInSession'
            fill='#f3745a'
            radius={[8, 8, 0, 0]}
            barSize={10}
            name='Students Not in Session'
            activeBar={<Rectangle fill='#f3745a' stroke='#f3745a' />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
