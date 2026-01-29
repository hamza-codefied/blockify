'use client';
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Select, TimePicker, InputNumber, Divider, Row, Col } from 'antd';
import { useCreateSchedule, useUpdateSchedule } from '@/hooks/useSchedules';
import { useGetGrades } from '@/hooks/useGrades';
import { useGetManagers } from '@/hooks/useManagers';
import dayjs from 'dayjs';

const { Option } = Select;

export const ScheduleModal = ({ open, onClose, mode, scheduleData, onSuccess }) => {
    const [form] = Form.useForm();
    const createScheduleMutation = useCreateSchedule();
    const updateScheduleMutation = useUpdateSchedule();
    const [scheduleType, setScheduleType] = useState('grade'); // 'grade' | 'custom'

    // Fetch grades for dropdown
    const { data: gradesData } = useGetGrades({ limit: 100 });
    const grades = gradesData?.data || [];

    // Fetch managers for dropdown (if needed for Grade schedules)
    const { data: managersData } = useGetManagers({ limit: 100 });
    const managers = managersData?.data || [];

    // When opening modal, pre-fill form if in edit mode
    useEffect(() => {
        if (open) {
            if (mode === 'edit' && scheduleData) {
                setScheduleType(scheduleData.type || 'grade');
                form.setFieldsValue({
                    type: scheduleData.type || 'grade',
                    name: scheduleData.name,
                    description: scheduleData.description,
                    capacity: scheduleData.capacity,
                    gradeId: scheduleData.gradeId || scheduleData.grade?.id, // Handle both flat and nested responses
                    managerId: scheduleData.managerId || scheduleData.manager?.id,
                    dayOfWeek: scheduleData.dayOfWeek,
                    timeRange: [
                        scheduleData.startTime ? dayjs(scheduleData.startTime, 'HH:mm') : null,
                        scheduleData.endTime ? dayjs(scheduleData.endTime, 'HH:mm') : null,
                    ],
                });
            } else {
                // Default for ADD
                setScheduleType('grade');
                form.resetFields();
                form.setFieldsValue({ type: 'grade' });
            }
        }
    }, [mode, scheduleData, form, open]);

    const handleTypeChange = (value) => {
        setScheduleType(value);
        // Optional: clear type-specific fields if needed, but Antd handles hidden inputs well
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const startTime = values.timeRange?.[0]?.format('HH:mm');
            const endTime = values.timeRange?.[1]?.format('HH:mm');

            const payload = {
                type: values.type,
                name: values.name,
                description: values.description,
                dayOfWeek: values.dayOfWeek,
                startTime,
                endTime,
            };

            if (values.type === 'grade') {
                payload.gradeId = values.gradeId;
                payload.managerId = values.managerId; // Optional now in backend, but good to send if selected
            } else {
                payload.capacity = values.capacity;
            }

            if (mode === 'edit' && scheduleData) {
                await updateScheduleMutation.mutateAsync({
                    scheduleId: scheduleData.id,
                    data: payload,
                });
            } else {
                await createScheduleMutation.mutateAsync(payload);
            }

            form.resetFields();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Form validation or API error:', error);
        }
    };

    const isLoading = mode === 'edit'
        ? updateScheduleMutation.isPending
        : createScheduleMutation.isPending;

    const days = [
        { value: 0, label: 'Sunday' },
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' },
    ];

    return (
        <Modal
            title={mode === 'edit' ? 'Edit Schedule' : 'Add Schedule'}
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            okText={mode === 'edit' ? 'Update' : 'Add'}
            cancelText='Cancel'
            confirmLoading={isLoading}
            centered
            width={600}
            okButtonProps={{
                style: {
                    backgroundColor: '#00B894',
                    borderColor: '#00B894',
                },
            }}
        >
            <Form form={form} layout='vertical'>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Schedule Type"
                            name="type"
                            rules={[{ required: true, message: 'Please select type' }]}
                        >
                            <Select onChange={handleTypeChange} disabled={mode === 'edit'}>
                                <Option value="grade">Grade Schedule</Option>
                                <Option value="custom">Custom Group</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label='Name'
                            name='name'
                            rules={[
                                { required: true, message: 'Please enter schedule name' },
                                { max: 100, message: 'Name too long' },
                            ]}
                        >
                            <Input placeholder='e.g., Math Class, Chess Club' />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Description" name="description">
                    <Input.TextArea rows={2} placeholder="Optional detailed description" />
                </Form.Item>

                {/* Type Specific Fields */}
                {scheduleType === 'grade' ? (
                    <>
                        <Divider orientation="left">Grade Details</Divider>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Grade"
                                    name="gradeId" // Sending gradeId backend expects
                                    rules={[{ required: true, message: 'Grade is required for grade schedules' }]}
                                >
                                    <Select placeholder="Select Grade" showSearch optionFilterProp="children">
                                        {grades.map(g => (
                                            <Option key={g.id} value={g.id}>{g.gradeName}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label="Manager (Optional)"
                                    name="managerId"
                                >
                                    <Select placeholder="Select Manager" showSearch optionFilterProp="children" allowClear>
                                        {managers.map(m => (
                                            <Option key={m.id} value={m.id}>{m.fullName}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </>
                ) : (
                    <>
                        <Divider orientation="left">Custom Group Details</Divider>
                        <Form.Item
                            label="Capacity (Optional)"
                            name="capacity"
                        >
                            <InputNumber min={1} style={{ width: '100%' }} placeholder="Max students" />
                        </Form.Item>
                    </>
                )}

                <Divider orientation="left">Time & Day</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Day of Week"
                            name="dayOfWeek"
                            rules={[{ required: true, message: 'Please select day' }]}
                        >
                            <Select placeholder="Select Day">
                                {days.map(d => (
                                    <Option key={d.value} value={d.value}>{d.label}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Time Range"
                            name="timeRange"
                            rules={[{ required: true, message: 'Please select time range' }]}
                        >
                            <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} minuteStep={15} />
                        </Form.Item>
                    </Col>
                </Row>

            </Form>
        </Modal>
    );
};
