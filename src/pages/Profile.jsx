import { SEOHead } from '@components/seo/SEOHead';
import { StructuredData } from '@components/seo/StructuredData';
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
} from '@utils/seo';
import { InstituteDetails } from '@/components/profile/InstituteDetails';
import { PermissionManagement } from '@/components/profile/PermissionManagement';
import { Grades } from '@/components/profile/Grades';
import { Subjects } from '@/components/profile/Subjects';
import { CustomGroups } from '@/components/profile/CustomGroups';
import { PageTitle } from '@/components/common/PageTitle';

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
        <PageTitle variant="primary" style={{ marginBottom: 16 }}>Profile</PageTitle>

        <div 
          className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch'
          style={{ gridTemplateRows: 'auto auto' }}
        >
          {/* Top Row */}
          <div className='lg:row-start-1 lg:col-start-1' style={{ display: 'flex', alignItems: 'stretch' }}>
            <InstituteDetails />
          </div>
          <div className='lg:row-start-1 lg:col-start-2 lg:col-span-2' style={{ display: 'flex', alignItems: 'stretch' }}>
            <PermissionManagement />
          </div>

          {/* Bottom Row */}
          <div className='lg:row-start-2 lg:col-start-1' style={{ display: 'flex' }}>
            <CustomGroups />
          </div>
          <div className='lg:row-start-2 lg:col-start-2' style={{ display: 'flex' }}>
            <Subjects />
          </div>
          <div className='lg:row-start-2 lg:col-start-3' style={{ display: 'flex' }}>
            <Grades />
          </div>
        </div>
      </div>
    </>
  );
};
