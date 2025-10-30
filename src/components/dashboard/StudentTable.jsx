'use client';
import React, { useEffect, useState } from 'react';
import {
  List,
  Card,
  Avatar,
  Input,
  Select,
  Row,
  Col,
  Space,
  Typography,
  Tag,
  Pagination,
  Table,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './student-table.css';
import { RiDeleteBinLine } from 'react-icons/ri';
import { TbEdit } from 'react-icons/tb';
import EditStudentModal from './EditStudentModal';
import DeleteStudentModal from './DeleteStudentModal';

const { Title, Text } = Typography;
const { Option } = Select;

export default function StudentTable() {
  const [isMobileView, setIsMobileView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [selectedAttendance, setSelectedAttendance] = useState('All');
  const [selectedArrival, setSelectedArrival] = useState('All');
  const [selectedSession, setSelectedSession] = useState('All');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const students = [
    {
      name: 'Andrews',
      email: 'andrews_aiden@gmail.com',
      contact: '+1 (123) 123-1234',
      grade: '9th Grade',
      attendance: 'Not Signed In',
      time: '07:30 am',
      session: 'In Session',
      img: 'https://i.pravatar.cc/40?img=1',
    },
    {
      name: 'Miller',
      email: 'miller_jane@gmail.com',
      contact: '+1 (123) 222-9876',
      grade: '8th Grade',
      attendance: 'Not Signed In',
      time: 'N/A',
      session: 'Not In Session',
      img: 'https://i.pravatar.cc/40?img=2',
    },
    {
      name: 'Smith',
      email: 'smith_joe@gmail.com',
      contact: '+1 (123) 321-7777',
      grade: '10th Grade',
      attendance: 'Signed In',
      time: '07:50 am',
      session: 'In Session',
      img: 'https://i.pravatar.cc/40?img=3',
    },
    {
      name: 'Hamza',
      email: 'hamza@gmail.com',
      contact: '+1 (123) 123-1234',
      grade: '9th Grade',
      attendance: 'Signed In',
      time: '07:30 am',
      session: 'In Session',
      img: 'https://i.pravatar.cc/40?img=1',
    },
    {
      name: 'Hammad',
      email: 'Hammad@gmail.com',
      contact: '+1 (123) 222-9876',
      grade: '8th Grade',
      attendance: 'Not Signed In',
      time: 'N/A',
      session: 'Not In Session',
      img: 'https://i.pravatar.cc/40?img=2',
    },
    {
      name: 'Rohail',
      email: 'Rohail@gmail.com',
      contact: '+1 (123) 321-7777',
      grade: '10th Grade',
      attendance: 'Signed In',
      time: '07:50 am',
      session: 'In Session',
      img: 'https://i.pravatar.cc/40?img=3',
    },
  ];

  // Detect screen width dynamically
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    handleResize(); // run on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🧠 Filtering logic
  useEffect(() => {
    let filtered = students;

    // Search filter (name, email, contact)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.name.toLowerCase().includes(search) ||
          s.email.toLowerCase().includes(search) ||
          s.contact.toLowerCase().includes(search)
      );
    }

    // Grade filter
    if (selectedGrade !== 'All Grades' && selectedGrade !== 'Grade') {
      filtered = filtered.filter(s => s.grade === selectedGrade);
    }

    // Attendance filter
    if (selectedAttendance !== 'All' && selectedAttendance !== 'Attendance') {
      if (selectedAttendance === 'Present') {
        filtered = filtered.filter(s => s.attendance === 'Signed In');
      } else if (selectedAttendance === 'Absent') {
        filtered = filtered.filter(s => s.attendance === 'Not Signed In');
      } else {
        // just placeholder for Late/Excused (you can expand logic)
        filtered = filtered;
      }
    }

    // Arrival filter (simple time logic)
    if (selectedArrival !== 'All' && selectedArrival !== 'Arrival') {
      if (selectedArrival === 'On Time') {
        filtered = filtered.filter(s => s.time !== 'N/A');
      } else if (selectedArrival === 'Late Arrival') {
        filtered = filtered.filter(s => s.time > '07:45 am');
      } else if (selectedArrival === 'Early Departure') {
        filtered = filtered.filter(s => s.time < '07:30 am');
      }
    }

    // Session filter
    if (selectedSession !== 'All' && selectedSession !== 'Sessions') {
      filtered = filtered.filter(s =>
        selectedSession === 'InSession'
          ? s.session === 'In Session'
          : s.session === 'Not In Session'
      );
    }

    setFilteredStudents(filtered);
  }, [
    searchTerm,
    selectedGrade,
    selectedAttendance,
    selectedArrival,
    selectedSession,
  ]);

  // Columns for Table View (mobile/tablet)
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (text, record) => (
        <Space>
          <Avatar src={record.img} size={36} />
          <div>
            <Text strong>{record.name}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact',
      render: (text, record) => (
        <div className='flex flex-col items-start gap-2'>
          <a
            href={`mailto:${record.email}`}
            className='text-xs hover:underline'
          >
            {record.email}
          </a>
          <a href={`tel:${record.contact}`} className='text-xs hover:underline'>
            {record.contact}
          </a>
        </div>
      ),
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: 'Attendance',
      dataIndex: 'attendance',
      key: 'attendance',
      render: (att, record) => {
        // Instead of useState here, use the record's value directly
        const isSignedIn = att === 'Signed In';
        const bgColor = isSignedIn ? '#f6ffed' : '#fff2e8';
        const textColor = isSignedIn ? '#389e0d' : '#ff4d4d';

        return (
          <Select
            value={att}
            size='small'
            variant='borderless'
            className='custom-select rounded-xl'
            style={{
              // backgroundColor: bgColor,
              color: textColor,
              width: 120,
            }}
            options={[
              { value: 'Signed In', label: 'Signed In' },
              { value: 'Not Signed In', label: 'Not Signed In' },
            ]}
            onChange={val => {
              // Update filteredStudents state properly
              setFilteredStudents(prev =>
                prev.map(s =>
                  s.email === record.email ? { ...s, attendance: val } : s
                )
              );
            }}
          />
        );
      },
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: (time, record) => (
        <Input
          defaultValue={time}
          size='small'
          style={{ width: 70 }}
          bordered={false}
          variant='outlined'
          styles={{}}
          className='cursor-pointer bg-[#e6fffb] border-[#87e8de] rounded-lg text-center text-[#08979c]'
        />
      ),
    },
    {
      title: 'Session',
      dataIndex: 'session',
      key: 'session',

      render: (session, record) => {
        // Instead of useState here, use the record's value directly
        const isInSession = session === 'In Session';
        const bgColor = isInSession ? '#f6ffed' : '#fff2e8';
        const textColor = isInSession ? '#389e0d' : '#ff4d4d';

        return (
          <Select
            value={session}
            size='small'
            variant='borderless'
            className='custom-select rounded-xl'
            style={{
              backgroundColor: bgColor,
              color: textColor,
              width: 120,
            }}
            options={[
              { value: 'In Session', label: 'In Session' },
              { value: 'Not In Session', label: 'Not In Session' },
            ]}
            onChange={val => {
              // Update filteredStudents state properly
              setFilteredStudents(prev =>
                prev.map(s =>
                  s.email === record.email ? { ...s, session: val } : s
                )
              );
            }}
          />
        );
      },
    },
    {
      title: 'Action',
      render: (_, student) => (
        <div className='flex space-x-4'>
          <TbEdit
            className='w-5 h-5 cursor-pointer text-[#00B894]'
            onClick={() => {
              setSelectedStudent(student);
              setIsEditModalOpen(true);
            }}
          />
          <RiDeleteBinLine
            className='w-5 h-5 cursor-pointer text-[#801818]'
            onClick={() => {
              setSelectedStudent(student);
              setIsDeleteModalOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        className='student-card'
        style={{
          borderRadius: 12,
          marginTop: 24,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        {/* ===== Header ===== */}
        <Row justify='space-between' align='middle' gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Title level={5} style={{ marginBottom: 0 }}>
              Student Information Log
            </Title>
          </Col>

          <Col xs={24} lg={16}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Input
                placeholder='Search'
                prefix={<SearchOutlined />}
                allowClear
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: 180, borderRadius: 8 }}
                className='hover:!border-[#00b894]'
              />

              <Select
                defaultValue='Grade'
                style={{ width: 120 }}
                onChange={val => setSelectedGrade(val)}
              >
                <Option value='All Grades'>All Grades</Option>
                <Option value='8th Grade'>8th Grade</Option>
                <Option value='9th Grade'>9th Grade</Option>
                <Option value='10th Grade'>10th Grade</Option>
                <Option value='11th Grade'>11th Grade</Option>
                <Option value='12th Grade'>12th Grade</Option>
              </Select>

              <Select
                defaultValue='Attendance'
                style={{ width: 120 }}
                onChange={val => setSelectedAttendance(val)}
              >
                <Option value='All'>All</Option>
                <Option value='Present'>Present</Option>
                <Option value='Absent'>Absent</Option>
              </Select>

              <Select
                defaultValue='Arrival'
                style={{ width: 120 }}
                onChange={val => setSelectedArrival(val)}
              >
                <Option value='All'>All</Option>
                <Option value='On Time'>On Time</Option>
                <Option value='Late Arrival'>Late Arrival</Option>
              </Select>

              <Select
                defaultValue='Sessions'
                style={{ width: 120 }}
                onChange={val => setSelectedSession(val)}
              >
                <Option value='All'>All</Option>
                <Option value='InSession'>In Session</Option>
                <Option value='NotInSession'>Not In Session</Option>
              </Select>
            </Space>
          </Col>
        </Row>

        {/* ===== Conditional View ===== */}
        {isMobileView ? (
          <div className='mt-4'>
            <Table
              columns={columns}
              dataSource={filteredStudents}
              pagination={{ pageSize: 5 }}
              rowKey='email'
              scroll={{ x: 'max-content' }}
              size='middle'
            />
          </div>
        ) : (
          <div className='student-table-wrapper'>
            <Row
              justify='space-between'
              className='student-table-header'
              style={{
                marginTop: 24,
                marginBottom: 8,
                fontWeight: 500,
                background: '#fff',
                boxShadow: '0 0 8px 0px rgba(0,0,0,0.05)',
                border: '2px solid rgba(0,0,0,0.05)',
                borderRadius: 12,
                padding: '20px 16px',
                minWidth: 750,
              }}
            >
              <Col className='pl-2' flex='2'>
                Name
              </Col>
              <Col flex='2'>Contact</Col>
              <Col flex='1'>Grade</Col>
              <Col flex='2'>Attendance</Col>
              <Col flex='1'>Time</Col>
              <Col flex='2'>Session</Col>
              <Col flex='1' style={{ textAlign: 'right' }}>
                Action
              </Col>
            </Row>

            <List
              itemLayout='horizontal'
              dataSource={filteredStudents}
              renderItem={student => (
                <List.Item
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    marginBottom: 8,
                    padding: '12px 16px',
                    boxShadow: '0 0 8px 0px rgba(0,0,0,0.05)',
                    border: '2px solid rgba(0,0,0,0.05)',
                    minWidth: 750,
                  }}
                >
                  <Row align='middle' style={{ width: '100%' }}>
                    <Col flex='2'>
                      <Space>
                        <Avatar src={student.img} size={40} />
                        <Text>{student.name}</Text>
                      </Space>
                    </Col>
                    <Col flex='2'>
                      <div className='flex flex-col'>
                        <a
                          href={`mailto:${student.email}`}
                          className='text-inherit hover:text-[#00B894]'
                        >
                          {student.email}
                        </a>
                        <a
                          href={`tel:${student.contact.replace(/\D/g, '')}`}
                          className='text-inherit hover:text-[#00B894]'
                        >
                          {student.contact}
                        </a>
                      </div>
                    </Col>
                    <Col flex='1'>
                      <Text>{student.grade}</Text>
                    </Col>
                    <Col flex='2'>
                      <Select
                        value={student.attendance}
                        size='small'
                        variant='borderless'
                        className='custom-select rounded-xl'
                        style={{
                          // backgroundColor:
                          //   student.attendance === 'Signed In'
                          //     ? '#f6ffed'
                          //     : '#fff2e8',
                          color:
                            student.attendance === 'Signed In'
                              ? '#389e0d'
                              : '#ff4d4d',
                          width: 130,
                        }}
                        options={[
                          { value: 'Signed In', label: 'Signed In' },
                          { value: 'Not Signed In', label: 'Not Signed In' },
                        ]}
                        onChange={val =>
                          setFilteredStudents(prev =>
                            prev.map(s =>
                              s.email === student.email
                                ? { ...s, attendance: val }
                                : s
                            )
                          )
                        }
                      />
                    </Col>
                    <Col flex='1'>
                      <Input
                        defaultValue={student.time}
                        size='small'
                        style={{ width: 80 }}
                        variant='outlined'
                        styles={{}}
                        className='cursor-pointer bg-[#e6fffb] border-[#87e8de] rounded-lg text-center text-[#08979c]'
                      />
                    </Col>
                    <Col flex='2'>
                      <Select
                        value={student.session}
                        size='small'
                        variant='borderless'
                        className='custom-select rounded-xl'
                        style={{
                          backgroundColor:
                            student.session === 'In Session'
                              ? '#f6ffed'
                              : '#fff2e8',
                          color:
                            student.session === 'In Session'
                              ? '#389e0d'
                              : '#ff4d4d',
                          width: 130,
                        }}
                        options={[
                          { value: 'In Session', label: 'In Session' },
                          { value: 'Not In Session', label: 'Not In Session' },
                        ]}
                        onChange={val =>
                          setFilteredStudents(prev =>
                            prev.map(s =>
                              s.email === student.email
                                ? { ...s, session: val }
                                : s
                            )
                          )
                        }
                      />
                    </Col>

                    <Col flex='1'>
                      <div className='flex space-x-4 justify-end'>
                        <TbEdit
                          className='w-5 h-5 cursor-pointer text-[#00B894]'
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsEditModalOpen(true);
                          }}
                        />
                        <RiDeleteBinLine
                          className='w-5 h-5 cursor-pointer text-[#801818]'
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsDeleteModalOpen(true);
                          }}
                        />
                      </div>
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          </div>
        )}
      </Card>
      <EditStudentModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={selectedStudent}
      />

      <DeleteStudentModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        student={selectedStudent}
      />
    </>
  );
}
