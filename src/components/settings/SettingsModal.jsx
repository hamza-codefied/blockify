import { useEffect, useState } from 'react';
import { Modal, Switch, Input, Button, Spin } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useGetSchoolSettings, useUpdateSchoolSettings } from '@/hooks/useSchool';
import './settings.css';

const SettingsModal = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const schoolId = user?.schoolId || user?.school_id || user?.school?.id;
  
  const [formData, setFormData] = useState(null);
  const [originalSettings, setOriginalSettings] = useState(null); // Store original values
  const [acceptingEnrollment, setAcceptingEnrollment] = useState(true); // Keep in localStorage
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState(null);
  const logoutMutation = useLogout();
  
  // Fetch school settings from API
  const { data: settingsData, isLoading } = useGetSchoolSettings(schoolId, isOpen && !!schoolId);
  const updateSettingsMutation = useUpdateSchoolSettings();

  // ✅ Load accepting enrollment from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAcceptingEnrollment(parsed.acceptingEnrollment ?? true);
    }
  }, []);

  // ✅ Load settings from API when data is fetched
  useEffect(() => {
    if (settingsData?.data) {
      const data = settingsData.data;
      const newFormData = {
        schoolDomain: data.schoolDomain && data.schoolDomain.length > 0 
          ? data.schoolDomain.join(', ') 
          : '',
        studentEmergencySessionEnd: data.allowStudentEarlySessionEndRequests ?? true,
        studentScheduleChangeRequests: data.allowStudentScheduleChangeRequests ?? true,
        weekendSettings: {
          staggeredSession: data.enableStaggeredSessions ?? true,
          sessionWithMultipleBreaks: data.enableWeekendSessions ?? false,
          unstaggeredSession: data.enableUnstaggeredSessions ?? true,
        },
      };
      setFormData(newFormData);
      // Store original values to detect changes
      setOriginalSettings({
        enableStaggeredSessions: data.enableStaggeredSessions ?? true,
        enableUnstaggeredSessions: data.enableUnstaggeredSessions ?? true,
      });
    }
  }, [settingsData]);

  // ✅ Check if schedule type is changing
  const isScheduleTypeChanging = () => {
    if (!originalSettings || !formData) return false;
    
    const oldStaggered = originalSettings.enableStaggeredSessions;
    const oldUnstaggered = originalSettings.enableUnstaggeredSessions;
    const newStaggered = formData.weekendSettings.staggeredSession;
    const newUnstaggered = formData.weekendSettings.unstaggeredSession;
    
    return (oldStaggered !== newStaggered) || (oldUnstaggered !== newUnstaggered);
  };

  // ✅ Save settings
  const handleSave = async () => {
    if (!formData || !schoolId) return;

    // Check if schedule type is changing
    if (isScheduleTypeChanging()) {
      // Store the save data and show warning
      setPendingSaveData({
        schoolId,
        data: {
          allowStudentEarlySessionEndRequests: formData.studentEmergencySessionEnd,
          allowStudentScheduleChangeRequests: formData.studentScheduleChangeRequests,
          enableWeekendSessions: formData.weekendSettings.sessionWithMultipleBreaks,
          enableStaggeredSessions: formData.weekendSettings.staggeredSession,
          enableUnstaggeredSessions: formData.weekendSettings.unstaggeredSession,
        },
      });
      setShowWarningModal(true);
      return;
    }

    // If not changing, proceed with normal save
    await performSave();
  };

  // ✅ Perform the actual save
  const performSave = async () => {
    if (!formData || !schoolId) return;

    try {
      // Save accepting enrollment to localStorage (not in API)
      const settingsToSave = {
        ...formData,
        acceptingEnrollment,
      };
      localStorage.setItem('appSettings', JSON.stringify(settingsToSave));
      window.dispatchEvent(new Event('appSettingsUpdated'));

      // Use pendingSaveData if available (from warning confirmation), otherwise use current formData
      const saveData = pendingSaveData || {
        schoolId,
        data: {
          allowStudentEarlySessionEndRequests: formData.studentEmergencySessionEnd,
          allowStudentScheduleChangeRequests: formData.studentScheduleChangeRequests,
          enableWeekendSessions: formData.weekendSettings.sessionWithMultipleBreaks,
          enableStaggeredSessions: formData.weekendSettings.staggeredSession,
          enableUnstaggeredSessions: formData.weekendSettings.unstaggeredSession,
        },
      };

      // Update settings via API
      await updateSettingsMutation.mutateAsync(saveData);

      // Clear pending data
      setPendingSaveData(null);
      onClose();
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error('Failed to save settings:', error);
    }
  };

  // ✅ Handle warning confirmation
  const handleWarningConfirm = async () => {
    setShowWarningModal(false);
    await performSave();
  };

  // ✅ Handle warning cancel
  const handleWarningCancel = () => {
    setShowWarningModal(false);
    setPendingSaveData(null);
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
        //>>> Mutual exclusivity: if enabling staggered, disable unstaggered
        if (value) {
          updated.staggeredSession = true;
          updated.unstaggeredSession = false;
        } else {
          //>>> If disabling staggered, enable unstaggered (at least one must be true)
          updated.staggeredSession = false;
          updated.unstaggeredSession = true;
        }
      } else if (field === 'unstaggeredSession') {
        //>>> Mutual exclusivity: if enabling unstaggered, disable staggered
        if (value) {
          updated.unstaggeredSession = true;
          updated.staggeredSession = false;
        } else {
          //>>> If disabling unstaggered, enable staggered (at least one must be true)
          updated.unstaggeredSession = false;
          updated.staggeredSession = true;
        }
      } else {
        updated[field] = value;
      }

      return { ...prev, weekendSettings: updated };
    });
  };

  if (isLoading || !formData) {
    return (
      <Modal
        title='Settings'
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width='50vw'
        className='custom-settings-modal'
        centered
      >
        <div className='flex justify-center items-center py-8'>
          <Spin size='large' />
        </div>
      </Modal>
    );
  }

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
            readOnly
            placeholder='School domain'
            className='border-2 border-gray-100 w-[200px] text-center py-2 text-primary-600 underline cursor-not-allowed'
            disabled
          />
        </div>

        {/* ====== Student Permissions ====== */}
        <div className='space-y-1'>
          <h3 className='text-black dark:text-white font-semibold'>
            Student Permissions
          </h3>
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
          <h3 className='text-black dark:text-white font-semibold'>
            Session Settings
          </h3>
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
          <h3 className='text-black dark:text-white font-semibold'>Settings</h3>
          <div className='border-2 border-gray-100 flex items-center justify-between px-2 py-1 rounded-lg'>
            <label>Accepting Enrollment</label>
            <Switch
              checked={acceptingEnrollment}
              onChange={value => setAcceptingEnrollment(value)}
              style={{
                backgroundColor: acceptingEnrollment
                  ? '#00B894'
                  : '#fff',
              }}
            />
          </div>
        </div>

        {/* ====== Support Section ====== */}
        <div className='space-y-1'>
          <p className='text-primary-600 text-xs underline'>Having Trouble?</p>
          <p className='text-xs text-black dark:text-white'>
            Let us know what isn’t working and we’ll fix it right away.
          </p>
        </div>

        {/* ====== Logout ====== */}
        <Button
          type='text'
          danger
          onClick={() => logoutMutation.mutate()}
          loading={logoutMutation.isPending}
          className='text-red-700 hover:text-red-800 focus:text-red-800 text-[16px] font-bold p-0 h-auto'
        >
          Logout
        </Button>

        {/* ====== Save Button ====== */}
        <div className='flex justify-end mt-4'>
          <Button
            type='primary'
            onClick={handleSave}
            loading={updateSettingsMutation.isPending}
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

      {/* Warning Modal for Schedule Type Change */}
      <Modal
        title={
          <div className='flex items-center gap-2'>
            <ExclamationCircleOutlined className='text-orange-500 text-xl' />
            <span>Warning: Schedule Type Change</span>
          </div>
        }
        open={showWarningModal}
        onOk={handleWarningConfirm}
        onCancel={handleWarningCancel}
        okText='Yes, Unassign Student Schedules'
        cancelText='Cancel'
        okButtonProps={{
          danger: true,
          style: {
            backgroundColor: '#ff4d4f',
            borderColor: '#ff4d4f',
          },
        }}
        centered
      >
        <div className='py-4'>
          <p className='mb-4 text-gray-700 dark:text-gray-300'>
            Changing the schedule type (Staggered/Unstaggered) will <strong>unassign all schedules from students</strong> in your school.
          </p>
          <p className='mb-2 text-gray-700 dark:text-gray-300'>
            <strong>Schedules will remain intact</strong>, but students will need to have their schedules reassigned based on the new validation rules:
          </p>
          <ul className='mb-4 ml-6 list-disc text-gray-700 dark:text-gray-300'>
            <li><strong>Staggered:</strong> Students can have multiple schedules per day, but no overlapping times</li>
            <li><strong>Unstaggered:</strong> Students can have only one schedule per day</li>
          </ul>
          <p className='text-gray-600 dark:text-gray-400 text-sm'>
            You can reassign schedules to students after this change. Are you sure you want to proceed?
          </p>
        </div>
      </Modal>
    </Modal>
  );
};

export default SettingsModal;
