'use client';
import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Popconfirm, App, Space, Tooltip, Typography, Input, Select, DatePicker, Card, Row, Col } from 'antd';
import { DeleteOutlined, PlusOutlined, EyeOutlined, SearchOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import Link from 'next/link';
import api from '@/lib/api';
import { Opportunity } from '@/types';

const { Title } = Typography;

export default function OpportunitiesPage() {
    const { message } = App.useApp();
    const [data, setData] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedDeadline, setSelectedDeadline] = useState<Dayjs | null>(null);

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
            render: (date: string) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'No Deadline',
        },
        {
            title: 'Status',
            key: 'status',
            render: (_: unknown, record: Opportunity) => {
                const isExpired = (record.deadline && new Date(record.deadline) < new Date()) || record.expired;
                let status = { label: 'To be Verified', color: 'warning' };

                if (isExpired) {
                    status = { label: 'Expired', color: 'error' };
                } else if (record.is_verified) {
                    status = { label: 'Live', color: 'success' };
                }

                return (
                    <Tag color={status.color}>
                        {status.label.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: Opportunity) => (
                <Space size="middle">
                    <Link href={`/opportunities/${record.id}`}>
                        <Button type="default" icon={<EyeOutlined />}>
                            Preview Opportunity
                        </Button>
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

    // Derived State: Unique Categories
    const categories = Array.from(new Set(data.map(item => item.category_name).filter(Boolean)));

    // Derived State: Filtered Data
    const filteredData = data.filter(item => {
        // 1. Search Text (Name/Title)
        const matchesSearch = item.title.toLowerCase().includes(searchText.toLowerCase());

        // 2. Category
        const matchesCategory = selectedCategory ? item.category_name === selectedCategory : true;

        // 3. Status
        let matchesStatus = true;

        const isExpired = (item.deadline && new Date(item.deadline) < new Date()) || item.expired;

        if (selectedStatus === 'live') {
            matchesStatus = !isExpired && !!item.is_verified;
        } else if (selectedStatus === 'expired') {
            matchesStatus = !!isExpired;
        } else if (selectedStatus === 'pending') {
            matchesStatus = !isExpired && !item.is_verified;
        }

        // 4. Deadline
        let matchesDeadline = true;
        if (selectedDeadline && item.deadline) {
            // Compare dates (ignoring time)
            matchesDeadline = dayjs(item.deadline).isSame(selectedDeadline, 'day');
        } else if (selectedDeadline && !item.deadline) {
            matchesDeadline = false; // Filter set but no deadline on item
        }

        return matchesSearch && matchesCategory && matchesStatus && matchesDeadline;
    });

    const resetFilters = () => {
        setSearchText('');
        setSelectedCategory(null);
        setSelectedStatus(null);
        setSelectedDeadline(null);
    };

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

            {/* Filter Bar */}
            <Card className="mb-6 shadow-sm" variant="borderless">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={6}>
                        <Input
                            placeholder="Search by name..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={12} md={5}>
                        <Select
                            placeholder="Category"
                            style={{ width: '100%' }}
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            allowClear
                        >
                            {categories.map(cat => (
                                <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={12} md={4}>
                        <Select
                            placeholder="Status"
                            style={{ width: '100%' }}
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            allowClear
                        >
                            <Select.Option value="live">Live</Select.Option>
                            <Select.Option value="expired">Expired</Select.Option>
                            <Select.Option value="pending">To be Verified</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={5}>
                        <DatePicker
                            placeholder="Filter by Deadline"
                            style={{ width: '100%' }}
                            value={selectedDeadline}
                            onChange={setSelectedDeadline}
                        />
                    </Col>
                    <Col xs={24} md={4}>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={resetFilters}
                            block
                        >
                            Reset
                        </Button>
                    </Col>
                </Row>
            </Card>

            {loading ? (
                <Card loading variant="borderless" className="text-center py-12">
                    <Typography.Text type="secondary">Loading opportunities...</Typography.Text>
                </Card>
            ) : filteredData.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                    <FilterOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                    <Title level={4} type="secondary">No opportunities found</Title>
                    <p className="text-gray-500 mb-4">Try adjusting your search or filters to find what you're looking for.</p>
                    <Button onClick={resetFilters} type="primary" ghost>Clear Filters</Button>
                </div>
            )}
        </div>
    );
}
