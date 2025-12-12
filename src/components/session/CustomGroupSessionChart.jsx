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
import { useGetCustomGroups, useGetCustomGroupSessions } from '@/hooks/useCustomGroups';
import dayjs from 'dayjs';

export const CustomGroupSessionChart = () => {
  const [selectedCustomGroupId, setSelectedCustomGroupId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch custom groups to populate dropdown (Admin)
  const { data: customGroupsData, isLoading: customGroupsLoading } = useGetCustomGroups({
    page: 1,
    limit: 100, // Get all groups for dropdown
    sort: 'created_at',
    sortOrder: 'DESC',
  });
  const customGroups = customGroupsData?.data || [];

  // Set default custom group on mount
  useEffect(() => {
    if (customGroups.length > 0 && !selectedCustomGroupId) {
      setSelectedCustomGroupId(customGroups[0].id);
    }
  }, [customGroups, selectedCustomGroupId]);

  // Fetch sessions for the last 7 days
  const endDate = dayjs().endOf('day').toISOString();
  const startDate = dayjs().subtract(6, 'days').startOf('day').toISOString();
  
  const { data: sessionsData, isLoading: sessionsLoading } = useGetCustomGroupSessions(
    selectedCustomGroupId,
    {
      page: 1,
      limit: 100, // Max allowed by API
      startDate,
      endDate,
    },
    !!selectedCustomGroupId
  );
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
        dateOnly: date.format('YYYY-MM-DD'), // For comparison with sessionDate
      };
    });

    return last7Days.map(({ date, dayName, dateStr, dateOnly }) => {
      // Filter sessions for this day using sessionDate
      const daySessions = sessions.filter(session => {
        if (!session.sessionDate) return false;
        const sessionDateOnly = dayjs(session.sessionDate).format('YYYY-MM-DD');
        return sessionDateOnly === dateOnly;
      });

      // Count sessions where startTimestamp is NOT null (students in session)
      const inSession = daySessions.filter(s => s.startTimestamp !== null && s.startTimestamp !== undefined).length;
      
      // Count sessions where startTimestamp IS null (students not in session)
      const notInSession = daySessions.filter(s => s.startTimestamp === null || s.startTimestamp === undefined).length;

      return {
        day: `${dayName}\n${dateStr}`,
        inSession,
        notInSession,
      };
    });
  }, [sessions]);

  const isLoading = customGroupsLoading || sessionsLoading;

  if (isLoading) {
    return (
      <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700'>
        <div className='flex justify-center items-center h-64'>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (customGroups.length === 0) {
    return (
      <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700'>
        <div className='flex justify-center items-center h-64'>
          <Empty description="No custom groups found. Create a custom group to view sessions." />
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-100 dark:border-gray-700'>
      {/* Header */}
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
          Session - By Custom Group
        </h2>

        <Select
          value={selectedCustomGroupId}
          onChange={setSelectedCustomGroupId}
          size='small'
          style={{ width: 200 }}
          placeholder="Select Custom Group"
          options={customGroups.map(group => ({
            value: group.id,
            label: group.name,
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
            interval={0}
            angle={isMobile ? -25 : 0}
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

