'use client';
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Avatar,
  Row,
  Col,
  Button,
  Typography,
  TimePicker,
  Radio,
} from 'antd';
import dayjs from 'dayjs';
import './custom-groups.css';
const { Title, Text } = Typography;
const { Option } = Select;

const dummyStudents = [
  {
    id: 1,
    name: 'Olivia',
    grade: '8th Grade',
    avatar: 'https://i.pravatar.cc/150?img=6',
  },
  {
    id: 2,
    name: 'Aiden Andrews',
    grade: '9th Grade',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 3,
    name: 'Sophia Johnson',
    grade: '10th Grade',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 4,
    name: 'Michael Brown',
    grade: '11th Grade',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: 5,
    name: 'Emily Davis',
    grade: '12th Grade',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    id: 6,
    name: 'Lucas Miller',
    grade: '9th Grade',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    id: 7,
    name: 'Olivia Wilson',
    grade: '10th Grade',
    avatar: 'https://i.pravatar.cc/150?img=6',
  },
];

const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const CustomGroupModal = ({ open, onClose, mode, groupData }) => {
  const [form] = Form.useForm();
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]); // changed from single grade
  const [addEntireGrade, setAddEntireGrade] = useState(null);
  const isViewMode = mode === 'view';

  useEffect(() => {
    if (isViewMode && groupData) {
      form.setFieldsValue({
        session_name: groupData.session_name,
        students: groupData.students,
        times: groupData.times || {},
        grade: groupData.grade || [],
      });
      setSelectedDays(groupData.selectedDays || []);
      setSelectedGrades(groupData.grade || []);
      setAddEntireGrade(groupData.addEntireGrade || false);
    } else {
      form.resetFields();
      setSelectedDays([]);
      setSelectedGrades([]);
      setAddEntireGrade(null);
    }
  }, [mode, groupData, form]);

  const toggleDay = day => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      let finalStudents = values.students || [];

      // include all students from selected grades if "yes" selected
      if (addEntireGrade && selectedGrades.length > 0) {
        finalStudents = dummyStudents
          .filter(s => selectedGrades.includes(s.grade))
          .map(s => s.name);
      }

      const data = {
        ...values,
        selectedDays,
        addEntireGrade,
        grade: selectedGrades,
        students: finalStudents,
      };

      console.log('Saved group:', data);
      onClose();
    });
  };

  // Filter students from all selected grades
  const filteredStudents =
    selectedGrades.length > 0
      ? dummyStudents.filter(s => selectedGrades.includes(s.grade))
      : [];

  // Unique grade list
  const uniqueGrades = [...new Set(dummyStudents.map(s => s.grade))];

  return (
    <Modal
      title={isViewMode ? 'View Custom Group' : 'Add Custom Group'}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={700}
      bodyStyle={{ maxHeight: '85vh', overflowY: 'auto' }}
      className='rounded-xl'
    >
      <Form form={form} layout='vertical'>
        {/* ===== Session Name ===== */}
        <Form.Item
          label='Session Name'
          name='session_name'
          rules={[{ required: true, message: 'Please enter session name' }]}
        >
          <Input placeholder='Enter session name' disabled={isViewMode} />
        </Form.Item>

        {/* ===== Entire Grade Selection ===== */}
        <Form.Item label='Do you want to add entire grade?'>
          <Radio.Group
            disabled={isViewMode}
            onChange={e => {
              setAddEntireGrade(e.target.value);
              form.setFieldsValue({ students: [] });
            }}
            value={addEntireGrade}
          >
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        </Form.Item>

        {/* ===== Select Grade(s) ===== */}
        <Form.Item
          label='Select Grade(s)'
          name='grade'
          rules={[
            { required: true, message: 'Please select at least one grade' },
          ]}
        >
          <Select
            mode='multiple'
            placeholder='Select grade(s)'
            disabled={isViewMode}
            onChange={values => {
              setSelectedGrades(values);
              form.setFieldsValue({ students: [] });
            }}
            getPopupContainer={trigger => trigger.parentNode}
          >
            {uniqueGrades.map(grade => (
              <Option key={grade} value={grade}>
                {grade}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* ===== Select Students (Only when "No" is selected) ===== */}
        {!addEntireGrade && (
          <Form.Item
            label='Select Students'
            name='students'
            rules={[{ required: true, message: 'Please select students' }]}
          >
            <Select
              mode='multiple'
              placeholder={
                selectedGrades.length > 0
                  ? 'Select students'
                  : 'Please select grade(s) first'
              }
              showSearch
              disabled={isViewMode || selectedGrades.length === 0}
              optionFilterProp='value'
              filterOption={(input, option) =>
                option?.value?.toLowerCase().includes(input.toLowerCase())
              }
              getPopupContainer={trigger => trigger.parentNode}
            >
              {filteredStudents.map(student => (
                <Option
                  key={student.id}
                  value={student.name}
                  label={student.name}
                >
                  <div className='flex items-center justify-between gap-2'>
                    <div className='flex items-center justify-start gap-3'>
                      <Avatar size={28} src={student.avatar} />
                      {student.name}
                    </div>
                    <span>
                      <Text className='text-black' type='secondary'>
                        {student.grade}
                      </Text>
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* ===== Select Days ===== */}
        {!isViewMode && (
          <>
            <Text strong>Select Days</Text>
            <div className='flex flex-wrap gap-3 mt-2 mb-4 w-full justify-between'>
              {daysList.map(day => {
                const selected = selectedDays.includes(day);
                return (
                  <div
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      selected
                        ? 'bg-[#151515] text-white border-b-4 border-[#00B894]'
                        : 'bg-white hover:bg-gray-200 text-black border-2 border-gray-200 shadow-lg'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===== Time Pickers ===== */}
        {selectedDays.map(day => (
          <Row key={day} gutter={16} className='mb-3 w-full'>
            <Col span={24}>
              <Text strong>{day}</Text>
            </Col>
            <Col xs={12}>
              <Form.Item
                name={['times', day, 'start']}
                label='Start Time'
                rules={[{ required: true, message: 'Select start time' }]}
              >
                <TimePicker
                  style={{ width: '100%' }}
                  format='HH:mm'
                  disabled={isViewMode}
                  defaultOpenValue={dayjs('09:00', 'HH:mm')}
                />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item
                name={['times', day, 'end']}
                label='End Time'
                rules={[{ required: true, message: 'Select end time' }]}
              >
                <TimePicker
                  style={{ width: '100%' }}
                  format='HH:mm'
                  disabled={isViewMode}
                  defaultOpenValue={dayjs('10:00', 'HH:mm')}
                />
              </Form.Item>
            </Col>
          </Row>
        ))}

        {/* ===== Save Button ===== */}
        {!isViewMode && (
          <Form.Item className='text-center mt-6'>
            <Button
              type='primary'
              onClick={handleSave}
              className='bg-[#00B894] hover:bg-[#019A7D] font-semibold px-10'
            >
              Save
            </Button>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
