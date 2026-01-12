import { SEOHead } from '@components/seo/SEOHead';
import { StructuredData } from '@components/seo/StructuredData';
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
} from '@utils/seo';
import { InstituteDetails } from '@/components/profile/InstituteDetails';
import { PermissionManagement } from '@/components/profile/PermissionManagement';
import { Grades } from '@/components/profile/Grades';
import { CustomGroups } from '@/components/profile/CustomGroups';
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

      <div>
        <PageTitle variant="primary" className="mb-4">Profile</PageTitle>

        <div 
          className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch'
          style={{ gridTemplateRows: 'auto auto' }}
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
          <div className='lg:row-start-1 lg:col-start-2 lg:col-span-2' style={{ display: 'flex', alignItems: 'stretch' }}>
            <LockedSection 
              permission={PERMISSIONS.ROLES_READ}
              lockMessage="You do not have permission to view roles and permissions"
            >
              <PermissionManagement />
            </LockedSection>
          </div>

          {/* Bottom Row */}
          <div className='lg:row-start-2 lg:col-start-1' style={{ display: 'flex' }}>
            <LockedSection 
              permission={PERMISSIONS.CUSTOM_GROUPS_READ}
              lockMessage="You do not have permission to view custom groups"
            >
              <CustomGroups />
            </LockedSection>
          </div>
          <div className='lg:row-start-2 lg:col-start-2 lg:col-span-2' style={{ display: 'flex' }}>
            <LockedSection 
              permission={PERMISSIONS.GRADES_READ}
              lockMessage="You do not have permission to view grades"
            >
              <Grades />
            </LockedSection>
          </div>
        </div>
      </div>
    </>
  );
};
