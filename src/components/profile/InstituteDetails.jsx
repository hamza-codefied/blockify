'use client';
import { useState, useRef } from 'react';
import { TbEdit } from 'react-icons/tb';
import client from '@/images/user_client.png';

export const InstituteDetails = () => {
  const [image, setImage] = useState(client);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    name: 'Name Of Institute',
    phone: '+1 (123) 123-1234',
    email: 'user_user@email.com',
  });

  const fileInputRef = useRef(null);

  // Image select handler
  const handleImageChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  // Field change handler
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className='w-full lg:w-1/3 bg-white rounded-xl shadow-sm p-6 flex flex-col items-center lg:items-start border-2 border-gray-200'>
      {/* Image Section */}
      <div className='flex flex-col items-center w-full'>
        <div className='relative flex items-center justify-center w-24 h-24'>
          <img
            src={image}
            alt='Institute Logo'
            className='rounded-full border w-20 h-20 object-cover'
          />
          <TbEdit
            className='absolute w-5 h-5 bottom-1 right-[-8px] text-[#00B894] cursor-pointer'
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            type='file'
            accept='image/*'
            className='hidden'
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>
        <h2 className='mt-3 text-center text-base font-semibold'>
          {formData.name}
        </h2>
      </div>

      {/* Details Section */}
      <div className='mt-6 w-full space-y-4 text-sm border-t'>
        {/* Name */}
        <div className='flex justify-between items-center border-b py-2'>
          <div className='w-full'>
            <p className='text-gray-500'>Name</p>
            {editingField === 'name' ? (
              <input
                type='text'
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                onBlur={() => setEditingField(null)}
                autoFocus
                className='font-medium w-full border rounded-md px-2 py-1 focus:outline-none'
              />
            ) : (
              <p className='font-medium'>{formData.name}</p>
            )}
          </div>
          <TbEdit
            className='cursor-pointer w-5 h-5 flex-shrink-0 ml-2'
            onClick={() => setEditingField('name')}
          />
        </div>

        {/* Phone */}
        <div className='flex justify-between items-center border-b pb-2'>
          <div className='w-full'>
            <p className='text-gray-500'>Phone Number</p>
            {editingField === 'phone' ? (
              <input
                type='text'
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                onBlur={() => setEditingField(null)}
                autoFocus
                className='font-medium w-full border rounded-md px-2 py-1 focus:outline-none'
              />
            ) : (
              <p className='font-medium'>{formData.phone}</p>
            )}
          </div>
          <TbEdit
            className='cursor-pointer w-5 h-5 flex-shrink-0 ml-2'
            onClick={() => setEditingField('phone')}
          />
        </div>

        {/* Email */}
        <div className='flex justify-between items-center border-b pb-2'>
          <div className='w-full'>
            <p className='text-gray-500'>Email</p>
            {editingField === 'email' ? (
              <input
                type='email'
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => setEditingField(null)}
                autoFocus
                className='font-medium w-full border rounded-md px-2 py-1 focus:outline-none break-all'
              />
            ) : (
              <p className='font-medium break-all'>{formData.email}</p>
            )}
          </div>
          <TbEdit
            className='cursor-pointer w-5 h-5 flex-shrink-0 ml-2'
            onClick={() => setEditingField('email')}
          />
        </div>
      </div>
    </div>
  );
};
