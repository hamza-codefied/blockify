'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Upload, Button, Typography, Alert } from 'antd';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { useImportStudentsCSV } from '@/hooks/useStudents';
import { useImportManagersCSV } from '@/hooks/useManagers';

const { Text, Title } = Typography;
const { Dragger } = Upload;

export const CSVImportModal = ({ open, onClose, activeTab, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const importStudentsMutation = useImportStudentsCSV();
  const importManagersMutation = useImportManagersCSV();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setFile(null);
      setFileList([]);
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
      if (activeTab === 'students') {
        await importStudentsMutation.mutateAsync(file);
      } else {
        await importManagersMutation.mutateAsync(file);
      }
      
      setFile(null);
      setFileList([]);
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  const isLoading = activeTab === 'students' 
    ? importStudentsMutation.isPending 
    : importManagersMutation.isPending;

  const csvFormat = activeTab === 'students' 
    ? 'fullName, email, gradeLevel (optional: password, status)'
    : 'fullName, email, password (optional: department, status)';

  return (
    <Modal
      title={`Import ${activeTab === 'students' ? 'Students' : 'Managers'} from CSV`}
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
              <Text>Required columns: <strong>{csvFormat}</strong></Text>
              <br />
              <Text type='secondary' className='text-xs'>
                CSV must have a header row. Maximum file size: 10MB
              </Text>
            </div>
          }
          type='info'
          showIcon
          className='mb-4'
        />

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

        {file && (
          <div className='mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded'>
            <Text strong>Selected file: </Text>
            <Text>{file.name}</Text>
            <br />
            <Text type='secondary' className='text-xs'>
              Size: {(file.size / 1024).toFixed(2)} KB
            </Text>
          </div>
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

