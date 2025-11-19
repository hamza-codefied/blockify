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
import { Select, Spin } from 'antd';
import { useState, useEffect, useMemo } from 'react';
import { useGetSessions } from '@/hooks/useSessions';
import { useGetGrades } from '@/hooks/useGrades';
import dayjs from 'dayjs';

export const SessionChart = () => {
  const [selectedGradeId, setSelectedGradeId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch grades to populate dropdown
  const { data: gradesData, isLoading: gradesLoading } = useGetGrades({ page: 1, limit: 100 });
  const grades = gradesData?.data || [];

  // Set default grade on mount
  useEffect(() => {
    if (grades.length > 0 && !selectedGradeId) {
      // Default to grade 9 if available, otherwise first grade
      const defaultGrade = grades.find(g => g.gradeName === '9') || grades[0];
      if (defaultGrade) {
        setSelectedGradeId(defaultGrade.id);
      }
    }
  }, [grades, selectedGradeId]);


  // Fetch sessions for the last 7 days
  const endDate = dayjs().endOf('day').toISOString();
  const startDate = dayjs().subtract(6, 'days').startOf('day').toISOString();
  
  const { data: sessionsData, isLoading: sessionsLoading } = useGetSessions({
    page: 1,
    limit: 100, // Max allowed by API
    startDate,
    endDate,
    ...(selectedGradeId && { gradeId: selectedGradeId })
  });
  const sessions = sessionsData?.data || [];

  useEffect(() => {
    // Detect small screen dynamically
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
      };
    });

    return last7Days.map(({ date, dayName, dateStr }) => {
      // Filter sessions for this day
      const daySessions = sessions.filter(session => {
        const sessionStart = dayjs(session.startTimestamp);
        return sessionStart.isSame(date, 'day');
      });

      // Count active sessions (students in session)
      const activeSessions = daySessions.filter(s => s.status === 'active').length;
      
      // Count ended/cancelled sessions (students not in session)
      const endedSessions = daySessions.filter(s => s.status === 'ended' || s.status === 'cancelled').length;

      return {
        day: `${dayName}\n${dateStr}`,
        inSession: activeSessions,
        notInSession: endedSessions,
      };
    });
  }, [sessions]);

  const isLoading = gradesLoading || sessionsLoading;

  if (isLoading) {
    return (
      <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700'>
        <div className='flex justify-center items-center h-64'>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700'>
      {/* Header */}
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
          Session - By Grade
        </h2>

        <Select
          value={selectedGradeId}
          onChange={setSelectedGradeId}
          size='small'
          style={{ width: 140 }}
          placeholder="Select Grade"
          options={grades.map(grade => ({
            value: grade.id,
            label: `${grade.gradeName}${grade.gradeName.match(/^\d+$/) ? 'th Grade' : ''}`,
          }))}
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
