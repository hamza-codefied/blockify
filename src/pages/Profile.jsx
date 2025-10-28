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
        <h1 className='text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200'>Profile</h1>

        <div className='flex flex-col lg:flex-row justify-between items-start gap-6'>
          <InstituteDetails />
          <PermissionManagement />
        </div>

        <div className='flex flex-col lg:flex-row justify-between items-start gap-6'>
          <CustomGroups />
          <Grades />
        </div>
      </div>
    </>
  );
};
