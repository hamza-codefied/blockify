'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Upload, Button, Typography, Alert } from 'antd';
import { UploadOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import { useImportStudentsCSV } from '@/hooks/useStudents';
import { useImportManagersCSV } from '@/hooks/useManagers';
import { useImportSchedulesCSV } from '@/hooks/useSchedules';

const { Text, Title } = Typography;
const { Dragger } = Upload;

export const CSVImportModal = ({ open, onClose, activeTab, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [importResult, setImportResult] = useState(null); // Store import result for error CSV download
  const importStudentsMutation = useImportStudentsCSV();
  const importManagersMutation = useImportManagersCSV();
  const importSchedulesMutation = useImportSchedulesCSV();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setFile(null);
      setFileList([]);
      setImportResult(null);
    }
  }, [open]);

  const handleFileChange = (info) => {
    const { file: currentFile, fileList: currentFileList } = info;
    
    // Update fileList state
    setFileList(currentFileList);
    
    // Handle file removal
    if (currentFile.status === 'removed' || currentFileList.length === 0) {
      setFile(null);
      setFileList([]);
      return;
    }
    
    // Get the actual file object - Ant Design wraps it in originFileObj
    // When beforeUpload returns false, the file is still in fileList but not uploaded
    const fileObj = currentFile.originFileObj || currentFile;
    
    // Validate and set file
    if (fileObj) {
      // Check if it's a File instance
      if (fileObj instanceof File) {
        const fileName = fileObj.name || currentFile.name || '';
        const isCSV = fileObj.type === 'text/csv' || 
                     fileName.toLowerCase().endsWith('.csv');
        
        if (isCSV) {
          setFile(fileObj);
        } else {
          // If file is selected but not CSV, show error and don't set file
          console.warn('Only CSV files are allowed');
          setFile(null);
          // Remove invalid file from list
          setFileList([]);
        }
      } else {
        // If it's not a File instance, try to use it anyway (might be a blob or other format)
        setFile(fileObj);
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      return;
    }

    try {
      let result;
      if (activeTab === 'students') {
        result = await importStudentsMutation.mutateAsync(file);
      } else if (activeTab === 'managers') {
        result = await importManagersMutation.mutateAsync(file);
      } else if (activeTab === 'schedules') {
        result = await importSchedulesMutation.mutateAsync(file);
      }
      
      //>>> Store result to show error CSV download if needed
      if (result?.data) {
        setImportResult(result.data);
      }
      
      //>>> Only close if no errors (or if user wants to close anyway)
      //>>> If there are errors, keep modal open to show download option
      if (result?.data?.failed === 0) {
        setFile(null);
        setFileList([]);
        setImportResult(null);
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  //>>> Download error CSV file
  const handleDownloadErrorCSV = () => {
    if (!importResult?.errorCSV) return;

    try {
      //>>> Convert base64 to blob
      const base64Data = importResult.errorCSV;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'text/csv' });

      //>>> Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `import-errors-${activeTab}-${new Date().getTime()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  const isLoading = activeTab === 'students' 
    ? importStudentsMutation.isPending 
    : activeTab === 'managers'
    ? importManagersMutation.isPending
    : importSchedulesMutation.isPending;

  const getCSVFormat = () => {
    if (activeTab === 'students') {
      return 'fullName, email, gradeLevel (required: 1-12, optional: password, status)';
    } else if (activeTab === 'managers') {
      return 'fullName, email, password, roleName, gradeNames (optional: phone, address, zipcode, status)';
    } else if (activeTab === 'schedules') {
      return 'gradeLevel (1-12), courseName, managerEmail, dayOfWeek (1-5 for Mon-Fri), startTime (HH:mm), endTime (HH:mm)';
    }
    return '';
  };

  const getTitle = () => {
    if (activeTab === 'students') return 'Students';
    if (activeTab === 'managers') return 'Managers';
    if (activeTab === 'schedules') return 'Schedules';
    return 'Data';
  };

  const getSampleCSVPath = () => {
    if (activeTab === 'students') return '/students-import-sample.csv';
    if (activeTab === 'managers') return '/managers-import-sample.csv';
    if (activeTab === 'schedules') return '/schedules-import-sample.csv';
    return '';
  };

  const handleDownloadSample = () => {
    const samplePath = getSampleCSVPath();
    if (samplePath) {
      const link = document.createElement('a');
      link.href = samplePath;
      link.download = samplePath.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Modal
      title={`Import ${getTitle()} from CSV`}
      open={open}
      onCancel={() => {
        setFile(null);
        setFileList([]);
        onClose();
      }}
      footer={null}
      centered
      width={600}
      okButtonProps={{
        style: {
          backgroundColor: '#00B894',
          borderColor: '#00B894',
        },
      }}
      cancelButtonProps={{
        style: {
          borderColor: '#00B894',
        },
        className: 'hover:!text-[#00b894] hover:!border-[#00b894]',
      }}
    >
      <div className='space-y-4'>
        <Alert
          message='CSV Format Required'
          description={
            <div>
              <Text>Required columns: <strong>{getCSVFormat()}</strong></Text>
              <br />
              <Text type='secondary' className='text-xs'>
                CSV must have a header row. Maximum file size: 10MB
              </Text>
              <br />
              <Button
                type='link'
                icon={<DownloadOutlined />}
                onClick={handleDownloadSample}
                className='p-0 mt-2 text-xs'
                size='small'
              >
                Download Sample CSV Template
              </Button>
            </div>
          }
          type='info'
          showIcon
          className='mb-4'
        />

        {file ? (
          <div className='p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <FileTextOutlined className='text-2xl text-[#00B894]' />
                <div>
                  <Text strong className='block'>
                    {file.name}
                  </Text>
                  <Text type='secondary' className='text-xs'>
                    Size: {(file.size / 1024).toFixed(2)} KB
                  </Text>
                </div>
              </div>
              <Button
                type='text'
                danger
                size='small'
                onClick={() => {
                  setFile(null);
                  setFileList([]);
                }}
                disabled={isLoading}
              >
                Remove
              </Button>
            </div>
            <div className='mt-3 pt-3 border-t border-gray-200 dark:border-gray-700'>
              <Button
                type='link'
                size='small'
                onClick={() => {
                  setFile(null);
                  setFileList([]);
                }}
                disabled={isLoading}
                className='p-0'
              >
                Select different file
              </Button>
            </div>
          </div>
        ) : (
          <Dragger
            accept='.csv'
            maxCount={1}
            beforeUpload={(file) => {
              // Prevent auto upload, but allow file selection
              return false;
            }}
            onChange={handleFileChange}
            fileList={fileList}
            onRemove={() => {
              setFile(null);
              setFileList([]);
              return true;
            }}
          >
            <p className='ant-upload-drag-icon'>
              <FileTextOutlined />
            </p>
            <p className='ant-upload-text'>
              Click or drag CSV file to this area to upload
            </p>
            <p className='ant-upload-hint'>
              Support for CSV files only. Maximum file size: 10MB
            </p>
          </Dragger>
        )}

        {/* Error CSV Download Section */}
        {importResult && importResult.errorCSV && importResult.failed > 0 && (
          <Alert
            message={
              importResult.successful === 0
                ? `All ${importResult.failed} row(s) failed`
                : `Import completed with ${importResult.failed} error(s)`
            }
            description={
              <div>
                {importResult.successful === 0 ? (
                  <Text>
                    No {activeTab} were imported. All {importResult.failed} row(s) failed validation. 
                    Download the error CSV file to see which rows failed and why.
                  </Text>
                ) : (
                  <Text>
                    {importResult.successful || 0} {activeTab} imported successfully. 
                    {importResult.failed || 0} failed. 
                    Download the error CSV file to see which rows failed and why.
                  </Text>
                )}
                <br />
                <Button
                  type='link'
                  icon={<FileTextOutlined />}
                  onClick={handleDownloadErrorCSV}
                  className='p-0 mt-2'
                >
                  Download Error CSV
                </Button>
              </div>
            }
            type={importResult.successful === 0 ? 'error' : 'warning'}
            showIcon
            className='mt-4'
          />
        )}

        <div className='flex justify-end gap-2 mt-6'>
          <Button 
            onClick={() => {
              setFile(null);
              setFileList([]);
              onClose();
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type='primary'
            loading={isLoading}
            onClick={handleImport}
            disabled={!file}
            style={{
              backgroundColor: '#00B894',
              borderColor: '#00B894',
            }}
            className='hover:!bg-[#00b894] hover:!border-[#00b894]'
            icon={<UploadOutlined />}
          >
            Import CSV
          </Button>
        </div>
      </div>
    </Modal>
  );
};

