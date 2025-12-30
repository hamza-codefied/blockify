'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Upload, Button, Typography, Alert } from 'antd';
import { UploadOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import { useAssignSchedulesToStudentsCSV } from '@/hooks/useStudents';

const { Text, Title } = Typography;
const { Dragger } = Upload;

export const ScheduleAssignmentModal = ({ open, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const assignSchedulesMutation = useAssignSchedulesToStudentsCSV();

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
    
    setFileList(currentFileList);
    
    if (currentFile.status === 'removed' || currentFileList.length === 0) {
      setFile(null);
      setFileList([]);
      return;
    }
    
    const fileObj = currentFile.originFileObj || currentFile;
    
    if (fileObj) {
      if (fileObj instanceof File) {
        const fileName = fileObj.name || currentFile.name || '';
        const isCSV = fileObj.type === 'text/csv' || 
                     fileName.toLowerCase().endsWith('.csv');
        
        if (isCSV) {
          setFile(fileObj);
        } else {
          console.warn('Only CSV files are allowed');
          setFile(null);
          setFileList([]);
        }
      } else {
        setFile(fileObj);
      }
    }
  };

  const handleAssign = async () => {
    if (!file) {
      return;
    }

    try {
      const result = await assignSchedulesMutation.mutateAsync(file);
      
      if (result?.data) {
        setImportResult(result.data);
      }
      
      if (result?.data?.failed === 0) {
        setFile(null);
        setFileList([]);
        setImportResult(null);
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Schedule assignment error:', error);
    }
  };

  const handleDownloadErrorCSV = () => {
    if (!importResult?.errorCSV) return;

    try {
      //>>> Decode base64 error CSV
      const binaryString = atob(importResult.errorCSV);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'schedule-assignment-errors.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download error CSV:', error);
    }
  };

  const handleDownloadTemplate = () => {
    //>>> Create template CSV content
    const templateContent = 'Email,Schedules\nstudent1@example.com,ENG-12-MON-13-14,MATH-12-TUE-09-10\nstudent2@example.com,SCI-12-WED-10-11';
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schedule-assignment-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Modal
      title={
        <div className='flex items-center gap-2'>
          <FileTextOutlined className='text-blue-500' />
          <span>Assign Schedules to Students</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key='cancel' onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key='template'
          icon={<DownloadOutlined />}
          onClick={handleDownloadTemplate}
        >
          Download Template
        </Button>,
        <Button
          key='assign'
          type='primary'
          loading={assignSchedulesMutation.isPending}
          disabled={!file || assignSchedulesMutation.isPending}
          onClick={handleAssign}
        >
          Assign Schedules
        </Button>,
      ]}
      width={600}
      centered
    >
      <div className='py-4'>
        <Alert
          message='CSV Format Required'
          description={
            <div>
              <Text strong>Required columns:</Text>
              <ul className='mt-2 ml-4 list-disc'>
                <li><Text code>Email</Text> - Student email address</li>
                <li><Text code>Schedules</Text> - Comma-separated schedule codes (e.g., ENG-12-MON-13-14, MATH-12-TUE-09-10)</li>
              </ul>
              <Text className='mt-2 block'>
                <strong>Note:</strong> This will replace all existing schedules for each student with the schedules in the CSV.
              </Text>
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
                disabled={assignSchedulesMutation.isPending}
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
                disabled={assignSchedulesMutation.isPending}
                className='p-0'
              >
                Select different file
              </Button>
            </div>
          </div>
        ) : (
          <Dragger
            accept='.csv'
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={() => false} //>>> Prevent auto-upload
            maxCount={1}
          >
            <p className='ant-upload-drag-icon'>
              <UploadOutlined className='text-[#00B894] text-4xl' />
            </p>
            <p className='ant-upload-text'>Click or drag CSV file to this area to upload</p>
            <p className='ant-upload-hint'>
              Only CSV files are allowed. The file should contain email and schedules columns.
            </p>
          </Dragger>
        )}

        {importResult && importResult.failed > 0 && (
          <Alert
            message={`Assignment completed with ${importResult.failed} error(s)`}
            description={
              <div className='mt-2'>
                <Text>
                  {importResult.successful || 0} student(s) assigned successfully, {importResult.failed || 0} failed.
                </Text>
                {importResult.errorCSV && (
                  <div className='mt-2'>
                    <Button
                      type='link'
                      icon={<DownloadOutlined />}
                      onClick={handleDownloadErrorCSV}
                      className='p-0'
                    >
                      Download error CSV file
                    </Button>
                  </div>
                )}
              </div>
            }
            type='warning'
            showIcon
            className='mt-4'
          />
        )}

        {importResult && importResult.successful > 0 && importResult.failed === 0 && (
          <Alert
            message={`Successfully assigned schedules to ${importResult.successful} student(s)`}
            type='success'
            showIcon
            className='mt-4'
          />
        )}
      </div>
    </Modal>
  );
};

