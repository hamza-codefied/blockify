import { useState, useEffect } from 'react';
import { useGetCustomGroups, useGetCustomGroupSessions } from '@/hooks/useCustomGroups';
import dayjs from 'dayjs';
import { SessionChartView } from './SessionChartView';

/**
 * Custom Group Session Chart Component
 * Handles custom group-specific data fetching and passes props to SessionChartView
 */
export const CustomGroupSessionChart = () => {
  const [selectedCustomGroupId, setSelectedCustomGroupId] = useState(null);

  // Fetch custom groups to populate dropdown
  const { data: customGroupsData, isLoading: customGroupsLoading } = useGetCustomGroups({
    page: 1,
    limit: 100,
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
    selectedCustomGroupId || '',
    {
      page: 1,
      limit: 100,
      startDate,
      endDate,
    },
    !!selectedCustomGroupId
  );

  const sessions = sessionsData?.data || [];
  const isLoading = customGroupsLoading || sessionsLoading;

  // Format options for dropdown
  const options = customGroups.map(group => ({
    id: group.id,
    label: group.name,
  }));

  return (
    <SessionChartView
      sessions={sessions}
      isLoading={isLoading}
      options={options}
      selectedId={selectedCustomGroupId}
      onSelectionChange={setSelectedCustomGroupId}
      title="Session - By Custom Group"
      placeholder="Select Custom Group"
      dropdownWidth={200}
      emptyMessage="No custom groups found. Create a custom group to view sessions."
      showEmptyState={true}
      chartId="customGroup"
    />
  );
};
