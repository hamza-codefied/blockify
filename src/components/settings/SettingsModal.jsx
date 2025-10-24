import { useEffect, useState } from 'react';
import { Modal, Switch, Input, Button } from 'antd';
import { Link } from 'react-router-dom';
import './settings.css';

const SettingsModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState(null);

  // ✅ Load from localStorage or defaults
  useEffect(() => {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      setFormData(JSON.parse(saved));
    } else {
      setFormData({
        schoolDomain: 'institute.edu.com',
        studentEmergencySessionEnd: true,
        studentScheduleChangeRequests: true,
        weekendSettings: {
          staggeredSession: true,
          sessionWithMultipleBreaks: false,
          unstaggeredSession: false,
        },
        acceptingEnrollment: true,
        updatedTheme: true,
      });
    }
  }, []);

  // ✅ Save settings
  const handleSave = () => {
    if (formData) {
      localStorage.setItem('appSettings', JSON.stringify(formData));
      window.dispatchEvent(new Event('appSettingsUpdated'));
    }
    onClose();
  };

  const handleSwitchChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedSwitchChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev.weekendSettings };

      if (field === 'staggeredSession') {
        if (value) {
          updated.staggeredSession = true;
          updated.unstaggeredSession = false;
        } else {
          updated.staggeredSession = false;
          updated.unstaggeredSession = true;
        }
      } else if (field === 'unstaggeredSession') {
        if (value) {
          updated.unstaggeredSession = true;
          updated.staggeredSession = false;
        } else {
          updated.unstaggeredSession = false;
          updated.staggeredSession = true;
        }
      } else {
        updated[field] = value;
      }

      return { ...prev, weekendSettings: updated };
    });
  };

  if (!formData) return null;

  return (
    <Modal
      title='Settings'
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width='50vw'
      className='custom-settings-modal'
      centered
      style={{ top: 0 }}
      bodyStyle={{
        maxHeight: '70vh',
        overflowY: 'auto',
        paddingRight: '12px',
        marginTop: 0,
      }}
    >
      <div className='space-y-4'>
        {/* ====== Domain ====== */}
        <div className='border-2 border-gray-100 flex items-center justify-between px-2 py-1 rounded-lg'>
          <label>School Domain</label>
          <Input
            value={formData.schoolDomain}
            onChange={e => handleSwitchChange('schoolDomain', e.target.value)}
            placeholder='Enter school domain'
            className='border-2 border-gray-100 w-[200px] text-center py-2 text-primary-600 underline'
          />
        </div>

        {/* ====== Student Permissions ====== */}
        <div className='space-y-1'>
          <h3 className='text-black font-semibold'>Student Permissions</h3>
          <div className='border-2 border-gray-100 flex items-center justify-between px-2 py-1 rounded-lg'>
            <label>Student Early Session End Request</label>
            <Switch
              checked={formData.studentEmergencySessionEnd}
              onChange={value =>
                handleSwitchChange('studentEmergencySessionEnd', value)
              }
              style={{
                backgroundColor: formData.studentEmergencySessionEnd
                  ? '#00B894'
                  : '#fff',
              }}
            />
          </div>
          <div className='border-2 border-gray-100 flex items-center justify-between px-2 py-1 rounded-lg'>
            <label>Student Schedule Change Requests</label>
            <Switch
              checked={formData.studentScheduleChangeRequests}
              onChange={value =>
                handleSwitchChange('studentScheduleChangeRequests', value)
              }
              style={{
                backgroundColor: formData.studentScheduleChangeRequests
                  ? '#00B894'
                  : '#fff',
              }}
            />
          </div>
        </div>

        {/* ====== Session Settings ====== */}
        <div className='space-y-1'>
          <h3 className='text-black font-semibold'>Session Settings</h3>
          <div className='border-2 border-gray-100 flex items-center justify-between px-2 py-1 rounded-lg'>
            <div>
              <label>Weekend Sessions</label>
              <p className='text-xs text-gray-400'>
                Add the option to create sessions for Saturday and Sunday.
              </p>
            </div>
            <Switch
              checked={formData.weekendSettings.sessionWithMultipleBreaks}
              onChange={value =>
                handleNestedSwitchChange('sessionWithMultipleBreaks', value)
              }
              style={{
                backgroundColor: formData.weekendSettings
                  .sessionWithMultipleBreaks
                  ? '#00B894'
                  : '#fff',
              }}
            />
          </div>
          <div className='border-2 border-gray-100 flex items-center justify-between px-2 py-1 rounded-lg'>
            <div>
              <label>Staggered Sessions</label>
              <p className='text-xs text-gray-400'>
                Session with multiple breaks in it throughout the day.
              </p>
            </div>
            <Switch
              checked={formData.weekendSettings.staggeredSession}
              onChange={value =>
                handleNestedSwitchChange('staggeredSession', value)
              }
              style={{
                backgroundColor: formData.weekendSettings.staggeredSession
                  ? '#00B894'
                  : '#fff',
              }}
            />
          </div>
          <div className='border-2 border-gray-100 flex items-center justify-between px-2 py-1 rounded-lg'>
            <div>
              <label>UnStaggered Sessions</label>
              <p className='text-xs text-gray-400'>
                Session with no breaks in it throughout the day.
              </p>
            </div>
            <Switch
              checked={formData.weekendSettings.unstaggeredSession}
              onChange={value =>
                handleNestedSwitchChange('unstaggeredSession', value)
              }
              style={{
                backgroundColor: formData.weekendSettings.unstaggeredSession
                  ? '#00B894'
                  : '#fff',
              }}
            />
          </div>
        </div>

        {/* ====== Other Settings ====== */}
        <div className='space-y-1'>
          <h3 className='text-black font-semibold'>Settings</h3>
          <div className='border-2 border-gray-100 flex items-center justify-between px-2 py-1 rounded-lg'>
            <label>Accepting Enrollment</label>
            <Switch
              checked={formData.acceptingEnrollment}
              onChange={value =>
                handleSwitchChange('acceptingEnrollment', value)
              }
              style={{
                backgroundColor: formData.acceptingEnrollment
                  ? '#00B894'
                  : '#fff',
              }}
            />
          </div>
          <div className='border-2 border-gray-100 flex items-center justify-between px-2 py-1 rounded-lg'>
            <label>Inverted Theme</label>
            <Switch
              checked={formData.updatedTheme}
              onChange={value => handleSwitchChange('updatedTheme', value)}
              style={{
                backgroundColor: formData.updatedTheme ? '#00B894' : '#fff',
              }}
            />
          </div>
        </div>

        {/* ====== Support Section ====== */}
        <div className='space-y-1'>
          <p className='text-primary-600 text-xs underline'>Having Trouble?</p>
          <p className='text-xs text-black'>
            Let us know what isn’t working and we’ll fix it right away.
          </p>
        </div>

        {/* ====== Logout ====== */}
        <Link
          to='/'
          className='text-red-700 hover:text-red-800 focus:text-red-800 text-[16px] font-bold'
        >
          Logout
        </Link>

        {/* ====== Save Button ====== */}
        <div className='flex justify-end mt-4'>
          <Button
            type='primary'
            onClick={handleSave}
            style={{
              backgroundColor: '#00B894',
              borderColor: '#00B894',
              borderRadius: '8px',
              padding: '0 24px',
            }}
          >
            Save Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
