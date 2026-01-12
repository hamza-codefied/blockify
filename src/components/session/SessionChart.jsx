import { useState, useEffect } from 'react';
import { useGetSessions } from '@/hooks/useSessions';
import { useGetGrades } from '@/hooks/useGrades';
import { formatGradeDisplayName, getDefaultGradeQueryParams } from '@/utils/grade.utils';
import dayjs from 'dayjs';
import { SessionChartView } from './SessionChartView';

/**
 * Grade Session Chart Component
 * Handles grade-specific data fetching and passes props to SessionChartView
 */
export const SessionChart = () => {
  const [selectedGradeId, setSelectedGradeId] = useState(null);

  // Fetch grades to populate dropdown
  const { data: gradesData, isLoading: gradesLoading } = useGetGrades({
    page: 1,
    limit: 100,
    ...getDefaultGradeQueryParams()
  });
  const grades = gradesData?.data || [];

  // Set default grade on mount
  useEffect(() => {
    if (grades.length > 0 && !selectedGradeId) {
      const defaultGrade = grades.find(g => g.gradeName === '1') || grades[0];
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
    limit: 100,
    startDate,
    endDate,
    ...(selectedGradeId && { gradeId: selectedGradeId })
  });

  const sessions = sessionsData?.data || [];
  const isLoading = gradesLoading || sessionsLoading;

  // Format options for dropdown
  const options = grades.map(grade => ({
    id: grade.id,
    label: formatGradeDisplayName(grade),
  }));

  return (
    <SessionChartView
      sessions={sessions}
      isLoading={isLoading}
      options={options}
      selectedId={selectedGradeId}
      onSelectionChange={setSelectedGradeId}
      title="Session - By Grade"
      placeholder="Grade"
      dropdownWidth={120}
      chartId="grade"
    />
  );
};
