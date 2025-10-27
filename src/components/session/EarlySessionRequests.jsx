import React, { useState } from 'react';
import { Card, List, Row, Col, Avatar, Typography, Tag } from 'antd';
import './early-session-requests.css';
import { RequestModal } from './RequestModal';

const { Title, Text } = Typography;

export const EarlySessionRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const requestsData = [
    {
      id: 1,
      name: 'Andrews, Aiden',
      grade: '9th Grade',
      time: '01:00 pm',
      img: 'https://i.pravatar.cc/40?img=5',
    },
    {
      id: 2,
      name: 'Miller, Olivia',
      grade: '10th Grade',
      time: '01:20 pm',
      img: 'https://i.pravatar.cc/40?img=6',
    },
    {
      id: 3,
      name: 'Johnson, Noah',
      grade: '11th Grade',
      time: '12:45 pm',
      img: 'https://i.pravatar.cc/40?img=7',
    },
    {
      id: 4,
      name: 'Davis, Emma',
      grade: '8th Grade',
      time: '01:10 pm',
      img: 'https://i.pravatar.cc/40?img=8',
    },
    {
      id: 5,
      name: 'Smith, Liam',
      grade: '9th Grade',
      time: '12:55 pm',
      img: 'https://i.pravatar.cc/40?img=9',
    },
    {
      id: 6,
      name: 'Brown, Ava',
      grade: '10th Grade',
      time: '01:05 pm',
      img: 'https://i.pravatar.cc/40?img=10',
    },
  ];

  const handleView = req => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  return (
    <Card
      variant='outlined'
      style={{
        borderRadius: 12,
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      }}
    >
      <h1 className='text-lg sm:text-xl font-semibold'>
        Early Session End Requests
      </h1>

      <div className='early-session-wrapper'>
        <Row
          justify='space-between'
          className='early-session-header'
          style={{
            marginTop: 24,
            marginBottom: 8,
            fontWeight: 500,
            background: '#fff',
            boxShadow: '0 0 8px 0px rgba(0,0,0,0.05)',
            border: '2px solid rgba(0,0,0,0.05)',
            borderRadius: 12,
            padding: '20px 16px',
          }}
        >
          <Col flex='2'>Name</Col>
          <Col flex='1'>Grade</Col>
          <Col flex='1'>Time</Col>
          <Col flex='1'>Action</Col>
        </Row>

        <List
          itemLayout='horizontal'
          dataSource={requestsData}
          renderItem={req => (
            <List.Item
              style={{
                background: '#fff',
                borderRadius: 12,
                marginBottom: 8,
                padding: '12px 16px',
                boxShadow: '0 0 8px 0px rgba(0,0,0,0.05)',
                border: '2px solid rgba(0,0,0,0.05)',
              }}
            >
              <Row align='middle' style={{ width: '100%' }}>
                <Col flex='2'>
                  <div className='flex items-center gap-2'>
                    <Avatar src={req.img} size={40} />
                    <Text>{req.name}</Text>
                  </div>
                </Col>
                <Col flex='1'>
                  <Text>{req.grade}</Text>
                </Col>
                <Col flex='1'>
                  <Tag
                    color='cyan'
                    style={{
                      borderRadius: 12,
                      fontWeight: 500,
                      padding: '2px 10px',
                    }}
                  >
                    {req.time}
                  </Tag>
                </Col>
                <Col flex='1'>
                  <button
                    className='view-request-btn'
                    onClick={() => handleView(req)}
                  >
                    View Request
                  </button>
                </Col>
              </Row>
            </List.Item>
          )}
        />
      </div>

      {/* Modal render */}
      <RequestModal
        open={isModalOpen}
        onClose={handleClose}
        request={selectedRequest}
      />
    </Card>
  );
};
