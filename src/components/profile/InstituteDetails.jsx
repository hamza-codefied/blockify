'use client';
import { useState, useRef, useEffect } from 'react';
import { TbEdit } from 'react-icons/tb';
import client from '@/images/user_client.png';
import { useAuthStore } from '@/store/authStore';
import {
  useGetSchoolInformation,
  useUpdateSchoolInformation,
} from '@/hooks/useSchool';
import { Spin } from 'antd';

export const InstituteDetails = () => {
  const { user } = useAuthStore();
  // Get schoolId from user object (could be schoolId, school_id, or from user.school?.id)
  const schoolId = user?.schoolId || user?.school_id || user?.school?.id;

  const [image, setImage] = useState(client);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch school information
  const { data: schoolInfoData, isLoading } = useGetSchoolInformation(
    schoolId,
    !!schoolId
  );
  const updateSchoolInfoMutation = useUpdateSchoolInformation();

  // Update form data when school info is fetched
  useEffect(() => {
    if (schoolInfoData?.data) {
      const schoolInfo = schoolInfoData.data;
      setFormData({
        name: schoolInfo.name || '',
        phone: schoolInfo.phone || '',
        email: schoolInfo.email || '',
      });
      // Set image URL if available, otherwise use default
      if (schoolInfo.image) {
        setImage(schoolInfo.image);
      } else {
        setImage(client);
      }
    }
  }, [schoolInfoData]);

  // Image select handler
  const handleImageChange = async e => {
    const file = e.target.files?.[0];
    if (file && schoolId) {
      // Show preview immediately
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setImageFile(file);

      // Save image immediately
      setIsUpdating(true);
      try {
        await updateSchoolInfoMutation.mutateAsync({
          schoolId,
          data: {},
          imageFile: file,
        });
        setImageFile(null); // Clear after successful upload
      } catch (error) {
        console.error('Failed to upload image:', error);
        // Revert to previous image on error
        if (schoolInfoData?.data?.image) {
          setImage(schoolInfoData.data.image);
        } else {
          setImage(client);
        }
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Field change handler
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save field changes
  const handleSave = async field => {
    if (!schoolId) {
      console.error('School ID not available');
      return;
    }

    setIsUpdating(true);
    try {
      const updateData = {
        [field]: formData[field],
      };

      // If image was changed, include it
      if (imageFile) {
        await updateSchoolInfoMutation.mutateAsync({
          schoolId,
          data: updateData,
          imageFile: imageFile,
        });
        setImageFile(null); // Clear image file after upload
      } else {
        await updateSchoolInfoMutation.mutateAsync({
          schoolId,
          data: updateData,
        });
      }

      setEditingField(null);
    } catch (error) {
      console.error('Failed to update school information:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle image removal
  const handleImageRemove = async () => {
    if (!schoolId) {
      console.error('School ID not available');
      return;
    }

    setIsUpdating(true);
    try {
      await updateSchoolInfoMutation.mutateAsync({
        schoolId,
        data: { image: null },
      });
      setImage(client); // Reset to default image
      setImageFile(null);
    } catch (error) {
      console.error('Failed to remove image:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!schoolId) {
    return (
      <div
        className='w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex flex-col items-center justify-center border-2 border-gray-200 dark:border-gray-700 min-h-[300px]'
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <p className='text-gray-500 dark:text-gray-400'>
          School ID not available
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className='w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex flex-col items-center justify-center border-2 border-gray-200 dark:border-gray-700 min-h-[300px]'
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div
      className='w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex flex-col items-center lg:items-start border-2 border-gray-200 dark:border-gray-700'
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
      }}
    >
      {/* Image Section */}
      <div className='flex flex-col items-center w-full'>
        <div className='relative flex items-center justify-center w-24 h-24'>
          <img
            src={image}
            alt='Institute Logo'
            className='rounded-full border border-gray-200 dark:border-gray-700 w-20 h-20 object-cover'
          />
          <TbEdit
            className='absolute w-5 h-5 bottom-1 right-[-8px] text-[#00B894] cursor-pointer'
            onClick={() => fileInputRef.current?.click()}
            disabled={isUpdating}
          />
          <input
            type='file'
            accept='image/*'
            className='hidden'
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={isUpdating}
          />
        </div>
        <h2 className='mt-3 text-center text-base font-semibold text-[24px] text-[#000] dark:text-gray-200'>
          {formData.name || 'Loading...'}
        </h2>
      </div>

      {/* Details Section */}
      <div className='mt-6 w-full space-y-4 text-base border-t border-gray-200 dark:border-gray-700'>
        {/* Name */}
        <div className='flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2'>
          <div className='w-full'>
            <p className='text-gray-500 dark:text-gray-400'>Name</p>
            {editingField === 'name' ? (
              <input
                type='text'
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                onBlur={() => {
                  handleSave('name');
                  setEditingField(null);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleSave('name');
                    setEditingField(null);
                  } else if (e.key === 'Escape') {
                    setEditingField(null);
                  }
                }}
                autoFocus
                disabled={isUpdating}
                className='font-medium w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md px-2 py-1 focus:outline-none'
              />
            ) : (
              <p className='font-medium text-gray-800 dark:text-gray-200'>
                {formData.name || 'N/A'}
              </p>
            )}
          </div>
          <TbEdit
            className='cursor-pointer w-5 h-5 flex-shrink-0 ml-2 text-gray-600 dark:text-gray-400'
            onClick={() => setEditingField('name')}
          />
        </div>

        {/* Phone */}
        <div className='flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2'>
          <div className='w-full'>
            <p className='text-gray-500 dark:text-gray-400'>Phone Number</p>
            {editingField === 'phone' ? (
              <input
                type='text'
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                onBlur={() => {
                  handleSave('phone');
                  setEditingField(null);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleSave('phone');
                    setEditingField(null);
                  } else if (e.key === 'Escape') {
                    setEditingField(null);
                  }
                }}
                autoFocus
                disabled={isUpdating}
                className='font-medium w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md px-2 py-1 focus:outline-none'
              />
            ) : (
              <p className='font-medium text-gray-800 dark:text-gray-200'>
                {formData.phone || 'N/A'}
              </p>
            )}
          </div>
          <TbEdit
            className='cursor-pointer w-5 h-5 flex-shrink-0 ml-2 text-gray-600 dark:text-gray-400'
            onClick={() => setEditingField('phone')}
          />
        </div>

        {/* Email */}
        <div className='flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2'>
          <div className='w-full'>
            <p className='text-gray-500 dark:text-gray-400'>Email</p>
            {editingField === 'email' ? (
              <input
                type='email'
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => {
                  handleSave('email');
                  setEditingField(null);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleSave('email');
                    setEditingField(null);
                  } else if (e.key === 'Escape') {
                    setEditingField(null);
                  }
                }}
                autoFocus
                disabled={isUpdating}
                className='font-medium w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md px-2 py-1 focus:outline-none break-all'
              />
            ) : (
              <p className='font-medium text-gray-800 dark:text-gray-200 break-all'>
                {formData.email || 'N/A'}
              </p>
            )}
          </div>
          <TbEdit
            className='cursor-pointer w-5 h-5 flex-shrink-0 ml-2 text-gray-600 dark:text-gray-400'
            onClick={() => setEditingField('email')}
          />
        </div>
      </div>
    </div>
  );
};
