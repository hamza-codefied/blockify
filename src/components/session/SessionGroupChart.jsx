import { useState, useEffect, useMemo } from 'react';
import { useGetSessions } from '@/hooks/useSessions';
import { useGetSchedules } from '@/hooks/useSchedules';
import dayjs from 'dayjs';
import { SessionChartView } from './SessionChartView';

/**
 * Group Session Chart Component
 * Handles group-specific (Schedule Name) data fetching and passes props to SessionChartView.
 * "Groups" here refer to unique Schedule Names (e.g. "Math 101", "Chess Club").
 */
export const SessionGroupChart = () => {
    const [selectedGroupName, setSelectedGroupName] = useState(null);

    // Fetch all schedules to extract unique group names (course/schedule names)
    // We fetch 'custom' type to focus on groups, or we can fetch all.
    // Assuming "Group" means any unique schedule name.
    // Using limit 1000 to get enough schedules to form a list.
    const { data: schedulesData, isLoading: schedulesLoading } = useGetSchedules({
        page: 1,
        limit: 1000,
        type: 'custom',
    });

    const allSchedules = schedulesData?.data || [];

    // Extract unique schedule names as "Groups"
    const groupOptions = useMemo(() => {
        const uniqueNames = [...new Set(allSchedules.map(s => s.name).filter(Boolean))];
        return uniqueNames.sort().map(name => ({
            id: name, // Using name as ID since we filter by name
            label: name
        }));
    }, [allSchedules]);

    // Set default group on mount
    useEffect(() => {
        if (groupOptions.length > 0 && !selectedGroupName) {
            setSelectedGroupName(groupOptions[0].id);
        }
    }, [groupOptions, selectedGroupName]);

    // Fetch sessions for the last 7 days, filtered by scheduleName
    const endDate = dayjs().endOf('day').toISOString();
    const startDate = dayjs().subtract(6, 'days').startOf('day').toISOString();

    const { data: sessionsData, isLoading: sessionsLoading } = useGetSessions({
        page: 1,
        limit: 100,
        startDate,
        endDate,
        ...(selectedGroupName && { scheduleName: selectedGroupName })
    });

    const sessions = sessionsData?.data || [];
    const isLoading = schedulesLoading || sessionsLoading;

    return (
        <SessionChartView
            sessions={sessions}
            isLoading={isLoading}
            options={groupOptions}
            selectedId={selectedGroupName}
            onSelectionChange={setSelectedGroupName}
            title="Session - By Group"
            placeholder="Select Group"
            dropdownWidth={180}
            chartId="group"
            emptyMessage="No groups found"
            showEmptyState={true}
        />
    );
};
