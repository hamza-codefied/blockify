'use client';
import { useEffect, useState } from 'react';
import { Select, Button, Card } from 'antd';
import { PiStudentFill } from 'react-icons/pi';
import { SEOHead } from '@components/seo/SEOHead';
import { StructuredData } from '@components/seo/StructuredData';
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
} from '@utils/seo';
import { Grades } from '@/components/profile/Grades';
import { EarlySessionRequests } from '@/components/session/EarlySessionRequests';
import { ScheduleChangeRequests } from '@/components/session/ScheduleChangeRequests';
import { UnstaggeredScheduleView } from '@/components/session/UnstaggeredScheduleView';
import { SessionChart } from '@/components/session/SessionChart';
import { SessionGroupChart } from '@/components/session/SessionGroupChart';
import { AddSessionModal } from '@/components/session/AddSessionModal';
import { SessionModal } from '@/components/session/SessionModal';
import { useCreateUpcomingSessions } from '@/hooks/useSessions';
import { StaggeredScheduleView } from '@/components/session/StaggeredScheduleView';
import { CSVImportModal } from '@/components/userManagement/CSVImportModal';
import { useAuthStore } from '@/store/authStore';
import { useGetSchoolSettings } from '@/hooks/useSchool';
import { message } from 'antd';
import { Typography as PageTitle } from '@/components/common/PageTitle';
import { LockedSection } from '@/components/common/LockedSection';
import { PERMISSIONS } from '@/utils/permissions';

export const Session = () => {
  const structuredData = [
    generateWebsiteStructuredData(),
    generateOrganizationStructuredData(),
  ];

  const [activeTab, setActiveTab] = useState('grades');
  const [openScheduleModal, setOpenScheduleModal] = useState(false); // For schedules (AddSessionModal)
  const [openSessionModal, setOpenSessionModal] = useState(false); // For actual sessions (SessionModal)
  const [isCSVImportModalOpen, setIsCSVImportModalOpen] = useState(false); // For CSV import

  const { user, hasPermission } = useAuthStore();
  const schoolId = user?.schoolId || user?.school_id || user?.school?.id;
  const createUpcomingSessionsMutation = useCreateUpcomingSessions();

  // Fetch school settings to determine staggered/unstaggered
  const { data: settingsData } = useGetSchoolSettings(schoolId, !!schoolId);
  const isStaggered = settingsData?.data?.enableStaggeredSessions || false;

  // Grades Tab Content
  const GradesTabContent = () => (
    <>
      <div className='flex justify-between items-center mb-4'>
        <div></div>
        <div className='flex gap-2'>
          {hasPermission(PERMISSIONS.SESSIONS_CREATE) && (
            <button
              onClick={async () => {
                try {
                  await createUpcomingSessionsMutation.mutateAsync();
                } catch (error) {
                  // Error handling is done in the hook
                }
              }}
              disabled={createUpcomingSessionsMutation.isPending}
              className='bg-[#00B894] text-white font-semibold text-sm px-4 py-2 rounded-[4px] hover:bg-[#019a7d] disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {createUpcomingSessionsMutation.isPending ? 'Creating...' : 'Create Upcoming Sessions'}
            </button>
          )}
        </div>
      </div>

      <LockedSection
        permission={PERMISSIONS.SESSIONS_READ}
        lockMessage="You do not have permission to view sessions"
      >
        <div className='flex justify-center mb-6'>
          <div className='flex flex-col md:flex-row items-center justify-center gap-5 md:gap-20'>
            <Button
              type={activeTab === 'grades' ? 'primary' : 'text'}
              onClick={() => setActiveTab('grades')}
              className={`flex w-[256px] h-[52px] justify-center items-center gap-3 shrink-0 rounded-[10px] text-base ${activeTab === 'grades'
                  ? 'bg-[#00B894] text-white hover:!bg-[#00b894]'
                  : 'bg-[#f2f3f4] dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
            >
              Grades
            </Button>
            <Button
              type={activeTab === 'groups' ? 'primary' : 'text'}
              onClick={() => setActiveTab('groups')}
              className={`flex w-[256px] h-[52px] justify-center items-center gap-3 shrink-0 rounded-[10px] text-base ${activeTab === 'groups'
                  ? 'bg-[#00B894] text-white hover:!bg-[#00b894]'
                  : 'bg-[#f2f3f4] dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
            >
              Groups
            </Button>
          </div>
        </div>

        {activeTab === 'grades' ? (
          <SessionChart mode="grade" />
        ) : (
          <SessionGroupChart />
        )}
      </LockedSection>

      <div className='grid grid-cols-1 xl:grid-cols-2 items-stretch gap-6 mt-6'>
        {/* Left Column: Grades */}
        <div className="h-full" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <LockedSection
            permission={PERMISSIONS.GRADES_READ}
            lockMessage="You do not have permission to view grades"
          >
            <div className="h-full">
              <Grades />
            </div>
          </LockedSection>
        </div>

        {/* Right Column: Schedules */}
        <div className="h-full" style={{ display: 'flex', alignItems: 'stretch', flexDirection: 'column' }}>
          <LockedSection
            permission={PERMISSIONS.SCHEDULES_READ}
            lockMessage="You do not have permission to view schedules"
          >
            {/* Use UnstaggeredScheduleView for both modes since schedules are now course-based */}
            <div className="h-full">
              <UnstaggeredScheduleView
                onAddSchedule={() => setOpenScheduleModal(true)}
                onImportCSV={() => setIsCSVImportModalOpen(true)}
              />
            </div>
          </LockedSection>
        </div>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 items-start gap-6 mt-6'>
        <LockedSection
          permission={PERMISSIONS.REQUESTS_READ}
          lockMessage="You do not have permission to view schedule change requests"
        >
          <ScheduleChangeRequests />
        </LockedSection>

        <LockedSection
          permission={PERMISSIONS.REQUESTS_READ}
          lockMessage="You do not have permission to view early end requests"
        >
          <EarlySessionRequests sessionType='grade' />
        </LockedSection>
      </div>
    </>
  );

  return (
    <>
      <SEOHead title='Blockify' description='Session page' url='/' />
      <StructuredData structuredData={structuredData} />

      <div>
        <div className='flex justify-between items-center'>
          <PageTitle variant='primary' className="mb-4">Sessions</PageTitle>
        </div>

        <Card
          variant='outlined'
          className='dark:!bg-gray-800 dark:!border-gray-700 rounded-[10px] shadow-sm'
        >
          {/* Tab Content */}
          <div>
            <GradesTabContent />
          </div>
        </Card>
      </div>

      {/* Session Modal - For creating actual Session instances */}
      <SessionModal
        open={openSessionModal}
        onClose={() => setOpenSessionModal(false)}
        mode='add'
        onSuccess={() => {
          setOpenSessionModal(false);
        }}
      />

      {/* Schedule Modal - For creating Schedule templates */}
      <AddSessionModal
        open={openScheduleModal}
        onClose={() => setOpenScheduleModal(false)}
        onSuccess={() => {
          setOpenScheduleModal(false);
        }}
      />



      {/* CSV Import Modal - For importing schedules */}
      <CSVImportModal
        open={isCSVImportModalOpen}
        onClose={() => setIsCSVImportModalOpen(false)}
        activeTab='schedules'
        onSuccess={() => {
          setIsCSVImportModalOpen(false);
        }}
      />
    </>
  );
};
