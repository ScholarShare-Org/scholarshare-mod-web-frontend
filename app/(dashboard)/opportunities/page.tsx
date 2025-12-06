'use client';
import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Popconfirm, App, Space, Tooltip, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';
import api from '@/lib/api';
import { Opportunity } from '@/types';

const { Title } = Typography;

export default function OpportunitiesPage() {
    const { message } = App.useApp();
    const [data, setData] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Removed /api/v1 prefix as it's already in baseURL
                const res = await api.get('/moderator/opportunities');
                // Map API response to UI model
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mappedData = res.data.opportunities.map((item: any) => ({
                    ...item,
                    category: item.category_name, // Map category_name to category for display
                    is_live: !item.expired,       // Map expired to is_live
                }));
                setData(mappedData);
            } catch (error) {
                console.error('Fetch error:', error);
                message.error('Failed to load opportunities');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [message]);

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/moderator/opportunities/${id}`);
            message.success('Opportunity deleted successfully');
            setData((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error('Delete error:', error);
            message.error('Failed to delete opportunity');
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
            dataIndex: 'category_name', // Updated to match API
            key: 'category',
            render: (category: string) => {
                let color = 'geekblue';
                if (category === 'Scholarship') color = 'gold';
                if (category === 'Internship') color = 'blue';
                if (category === 'Workshop') color = 'green';
                if (category === 'Competition') color = 'purple';
                return <Tag color={color}>{category ? category.toUpperCase() : 'OTHER'}</Tag>;
            },
        },
        {
            title: 'Deadline',
            dataIndex: 'deadline',
            key: 'deadline',
            render: (date: string) => date ? new Date(date).toLocaleDateString() : 'No Deadline',
        },
        {
            title: 'Status',
            dataIndex: 'expired', // Updated to match API
            key: 'status',
            render: (expired: boolean) => (
                <Tag color={!expired ? 'success' : 'error'}>
                    {!expired ? 'LIVE' : 'EXPIRED'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: Opportunity) => (
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
