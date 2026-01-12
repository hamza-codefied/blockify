'use client';
import { useEffect, useState } from 'react';
import { Select, Button, Card } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { PiStudentFill } from 'react-icons/pi';
import { SEOHead } from '@components/seo/SEOHead';
import { StructuredData } from '@components/seo/StructuredData';
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
} from '@utils/seo';
import { EarlySessionRequests } from '@/components/session/EarlySessionRequests';
import { ScheduleChangeRequests } from '@/components/session/ScheduleChangeRequests';
import { UnstaggeredScheduleView } from '@/components/session/UnstaggeredScheduleView';
import { SessionChart } from '@/components/session/SessionChart';
import { AddSessionModal } from '@/components/session/AddSessionModal';
import { SessionModal } from '@/components/session/SessionModal';
import { useCreateUpcomingSessions } from '@/hooks/useSessions';
import { StaggeredScheduleView } from '@/components/session/StaggeredScheduleView';
import { CSVImportModal } from '@/components/userManagement/CSVImportModal';
import { CustomGroupSessionChart } from '@/components/session/CustomGroupSessionChart';
import { CustomGroupUnstaggeredScheduleView } from '@/components/session/CustomGroupUnstaggeredScheduleView';
import { CustomGroupStaggeredScheduleView } from '@/components/session/CustomGroupStaggeredScheduleView';
import { CustomGroupSessionModal } from '@/components/session/CustomGroupSessionModal';
import { useAuthStore } from '@/store/authStore';
import { useGetSchoolSettings } from '@/hooks/useSchool';
import { useGetCustomGroups } from '@/hooks/useCustomGroups';
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
  const [openCustomGroupSessionModal, setOpenCustomGroupSessionModal] =
    useState(false); // For custom group sessions
  const [selectedCustomGroupId, setSelectedCustomGroupId] = useState(null); // Selected custom group for session creation
  const [isCSVImportModalOpen, setIsCSVImportModalOpen] = useState(false); // For CSV import

  const { user, hasPermission } = useAuthStore();
  const schoolId = user?.schoolId || user?.school_id || user?.school?.id;
  const createUpcomingSessionsMutation = useCreateUpcomingSessions();

  // Fetch school settings to determine staggered/unstaggered
  const { data: settingsData } = useGetSchoolSettings(schoolId, !!schoolId);
  const isStaggered = settingsData?.data?.enableStaggeredSessions || false;

  // Fetch custom groups for session creation (get all for dropdown)
  const { data: customGroupsData } = useGetCustomGroups({
    page: 1,
    limit: 100, // Get all groups for dropdown
    sort: 'created_at',
    sortOrder: 'DESC',
  });
  const customGroups = customGroupsData?.data || [];

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
        <SessionChart mode="grade" />
      </LockedSection>

      <div className='grid grid-cols-1 xl:grid-cols-2 items-stretch gap-4 mt-4'>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <LockedSection 
            permission={PERMISSIONS.REQUESTS_READ}
            lockMessage="You do not have permission to view early end requests"
          >
            <EarlySessionRequests sessionType='grade' />
          </LockedSection>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <LockedSection 
            permission={PERMISSIONS.SCHEDULES_READ}
            lockMessage="You do not have permission to view schedules"
          >
            {/* Use UnstaggeredScheduleView for both modes since schedules are now course-based */}
            <UnstaggeredScheduleView 
              onAddSchedule={() => setOpenScheduleModal(true)}
              onImportCSV={() => setIsCSVImportModalOpen(true)}
            />
          </LockedSection>
        </div>
      </div>

      <div className='mt-4'>
        <LockedSection 
          permission={PERMISSIONS.REQUESTS_READ}
          lockMessage="You do not have permission to view schedule change requests"
        >
          <ScheduleChangeRequests />
        </LockedSection>
      </div>
    </>
  );

  // Custom Groups Tab Content
  const CustomGroupsTabContent = () => (
    <>
      <div className='flex justify-between items-center mb-4'>
        <div></div>
        <div className='flex gap-2'>
          {hasPermission(PERMISSIONS.CUSTOM_GROUPS_READ) && (
            <Select
              placeholder='Select custom group'
              style={{ width: 250 }}
              value={selectedCustomGroupId}
              onChange={value => setSelectedCustomGroupId(value)}
              options={customGroups.map(group => ({
                value: group.id,
                label: group.name,
              }))}
            />
          )}
          {hasPermission(PERMISSIONS.SESSIONS_CREATE) && (
            <button
              onClick={() => {
                if (!selectedCustomGroupId) {
                  message.warning('Please select a custom group first');
                  return;
                }
                setOpenCustomGroupSessionModal(true);
              }}
              disabled={!selectedCustomGroupId}
              className={`font-semibold text-sm px-4 py-2 rounded-[4px] ${
                selectedCustomGroupId
                  ? 'bg-[#00B894] text-white hover:bg-[#019a7d]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add Session +
            </button>
          )}
        </div>
      </div>

      <LockedSection 
        permission={PERMISSIONS.CUSTOM_GROUPS_READ}
        lockMessage="You do not have permission to view custom group sessions"
      >
        <CustomGroupSessionChart />
      </LockedSection>

      <div className='grid grid-cols-1 xl:grid-cols-2 items-stretch gap-4 mt-4'>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <LockedSection 
            permission={PERMISSIONS.REQUESTS_READ}
            lockMessage="You do not have permission to view early end requests"
          >
            <EarlySessionRequests sessionType='customGroup' />
          </LockedSection>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <LockedSection 
            permission={PERMISSIONS.SCHEDULES_READ}
            lockMessage="You do not have permission to view custom group schedules"
          >
            {isStaggered ? (
              <CustomGroupStaggeredScheduleView />
            ) : (
              <CustomGroupUnstaggeredScheduleView />
            )}
          </LockedSection>
        </div>
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
          {/* Tabs */}
          <div className='flex justify-center mb-6'>
            <div className='flex flex-col md:flex-row items-center justify-center gap-5 md:gap-20'>
              <Button
                type={activeTab === 'grades' ? 'primary' : 'text'}
                icon={<PiStudentFill className='w-5 h-5' />}
                onClick={() => setActiveTab('grades')}
                className={`flex w-[256px] h-[52px] justify-center items-center gap-3 shrink-0 rounded-[10px] text-base ${
                  activeTab === 'grades'
                    ? 'bg-[#00B894] text-white hover:!bg-[#00b894]'
                    : 'bg-[#f2f3f4] dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
              >
                Grades
              </Button>
              <Button
                type={activeTab === 'custom-groups' ? 'primary' : 'text'}
                icon={<TeamOutlined />}
                onClick={() => setActiveTab('custom-groups')}
                className={`flex w-[256px] h-[52px] justify-center items-center gap-3 shrink-0 rounded-[10px] text-base ${
                  activeTab === 'custom-groups'
                    ? 'bg-[#00B894] text-white hover:!bg-[#00b894]'
                    : 'bg-[#f2f3f4] dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
              >
                Custom Groups
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'grades' ? (
              <GradesTabContent />
            ) : (
              <CustomGroupsTabContent />
            )}
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

      {/* Custom Group Session Modal - For creating custom group sessions */}
      <CustomGroupSessionModal
        open={openCustomGroupSessionModal}
        onClose={() => {
          setOpenCustomGroupSessionModal(false);
        }}
        customGroupId={selectedCustomGroupId}
        onSuccess={() => {
          setOpenCustomGroupSessionModal(false);
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
