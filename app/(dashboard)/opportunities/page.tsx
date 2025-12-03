'use client';
import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Popconfirm, message, Typography, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import api from '@/lib/api';
import { Opportunity } from '@/types';

const { Title } = Typography;

export default function OpportunitiesPage() {
    const [data, setData] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            // const res = await api.get('/mod/opportunities');
            // setData(res.data);

            // Mock data for MVP
            const mockData: Opportunity[] = [
                {
                    id: '1',
                    title: 'Google Generation Scholarship',
                    short_description: 'For women in tech',
                    full_description: 'Full details...',
                    category: 'Scholarship',
                    eligibility_criteria: 'Women in CS',
                    deadline: new Date('2025-12-31').toISOString(),
                    source_url: 'https://google.com',
                    is_live: true,
                },
                {
                    id: '2',
                    title: 'Frontend Intern at Vercel',
                    short_description: 'React developer needed',
                    full_description: 'Full details...',
                    category: 'Internship',
                    eligibility_criteria: 'React knowledge',
                    deadline: new Date('2024-05-01').toISOString(),
                    source_url: 'https://vercel.com',
                    is_live: false,
                }
            ];
            setData(mockData);
        } catch (error) {
            message.error('Failed to load opportunities');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            // await api.delete(`/mod/opportunities/${id}`);
            message.success('Opportunity archived successfully');
            setData((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            message.error('Failed to archive opportunity');
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <span className="font-bold">{text}</span>,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category: string) => {
                let color = 'geekblue';
                if (category === 'Scholarship') color = 'gold';
                if (category === 'Internship') color = 'blue';
                if (category === 'Workshop') color = 'green';
                if (category === 'Competition') color = 'purple';
                return <Tag color={color}>{category.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Deadline',
            dataIndex: 'deadline',
            key: 'deadline',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Status',
            dataIndex: 'is_live',
            key: 'is_live',
            render: (isLive: boolean) => (
                <Tag color={isLive ? 'success' : 'error'}>
                    {isLive ? 'LIVE' : 'ARCHIVED'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Opportunity) => (
                <Space size="middle">
                    <Link href={`/opportunities/${record.id}`}>
                        <Tooltip title="Edit">
                            <Button icon={<EditOutlined />} />
                        </Tooltip>
                    </Link>
                    <Popconfirm
                        title="Are you sure you want to archive this?"
                        onConfirm={() => handleDelete(record.id!)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Archive">
                            <Button danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Title level={2} style={{ margin: 0 }}>Manage Opportunities</Title>
                <Link href="/opportunities/create">
                    <Button type="primary" icon={<PlusOutlined />} size="large">
                        Create New
                    </Button>
                </Link>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
}
