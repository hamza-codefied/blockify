import { SEOHead } from '@components/seo/SEOHead';
import { StructuredData } from '@components/seo/StructuredData';
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
} from '@utils/seo';
import { InstituteDetails } from '@/components/profile/InstituteDetails';
import { PermissionManagement } from '@/components/profile/PermissionManagement';
import { AllowedApps } from '@/components/profile/AllowedApps';
// import { Grades } from '@/components/profile/Grades';
// import { Schedules } from '@/components/profile/Schedules';
import { Typography as PageTitle } from '@/components/common/PageTitle';
import { LockedSection } from '@/components/common/LockedSection';
import { PERMISSIONS } from '@/utils/permissions';

export const Profile = () => {
  const structuredData = [
    generateWebsiteStructuredData(),
    generateOrganizationStructuredData(),
  ];

  return (
    <>
      <SEOHead
        title='Profile | Blockify'
        description='Institute profile, permissions, and grade management'
        url='/profile'
      />
      <StructuredData structuredData={structuredData} />

      <div className="flex flex-col">
        <PageTitle variant="primary" className="mb-4">Profile</PageTitle>

        <div
          className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch'
          style={{}}
        >
          {/* Top Row */}
          <div className='lg:row-start-1 lg:col-start-1' style={{ display: 'flex', alignItems: 'stretch' }}>
            <LockedSection
              permission={PERMISSIONS.SCHOOLS_READ}
              lockMessage="You do not have permission to view school information"
            >
              <InstituteDetails />
            </LockedSection>
          </div>
          <div className='lg:row-start-1 lg:col-start-2' style={{ display: 'flex', alignItems: 'stretch' }}>
            <LockedSection
              permission={PERMISSIONS.ROLES_READ}
              lockMessage="You do not have permission to view roles and permissions"
            >
              <PermissionManagement />
            </LockedSection>
          </div>

          {/* Second Row - Allowed Apps (full width) */}
          <div className='lg:col-span-2' style={{ display: 'flex', alignItems: 'stretch' }}>
            <LockedSection
              permission={PERMISSIONS.ALLOWED_APPS_READ}
              lockMessage="You do not have permission to manage allowed apps"
            >
              <AllowedApps />
            </LockedSection>
          </div>
        </div>
      </div>
    </>
  );
};
