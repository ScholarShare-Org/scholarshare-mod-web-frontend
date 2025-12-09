'use client';
import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Tooltip, Typography, Input, Select, Card, Row, Col, App, Avatar, DatePicker } from 'antd';
import { EyeOutlined, SearchOutlined, ReloadOutlined, FilterOutlined, GlobalOutlined, UserOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import Link from 'next/link';
import api from '@/lib/api';
import { Opportunity } from '@/types';

const { Title } = Typography;

interface Category {
    id: number;
    name: string;
}

export default function GlobalOpportunitiesPage() {
    const { message } = App.useApp();
    const [data, setData] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedDeadline, setSelectedDeadline] = useState<Dayjs | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/moderator/categories');
                const categoriesData = Array.isArray(res.data) ? res.data : (res.data.items || res.data.categories || []);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Data (Client-side filtering approach with safe limit)
    const fetchData = async () => {
        try {
            setLoading(true);

            // We fetch a reasonable max limit (e.g. 50) to allow client-side filtering 
            // without triggering backend 422 limitations.
            const params = {
                page: 1,
                page_size: 50,
                status_filter: 'all',
            };

            const res = await api.get('/moderator/global-opportunities', { params });
            const { opportunities } = res.data;

            // Map API response
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedData = (opportunities || []).map((item: any) => ({
                ...item,
                category: item.category_name,
                is_live: !item.expired,
                creator_name: item.creator_name,
            }));

            setData(mappedData);

        } catch (error) {
            console.error('Fetch error:', error);
            // message.error('Failed to load opportunities');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resetFilters = () => {
        setSearchText('');
        setSelectedCategory(null);
        setSelectedStatus(null);
        setSelectedDeadline(null);
    };

    // Client-Side Filter Logic
    const filteredData = data.filter(item => {
        // 1. Search
        const matchesSearch = item.title.toLowerCase().includes(searchText.toLowerCase());

        // 2. Category
        let matchesCategory = true;
        if (selectedCategory) {
            const catObj = categories.find(c => c.id === selectedCategory);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((item as any).category_id) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                matchesCategory = (item as any).category_id === selectedCategory;
            } else if (catObj && item.category_name) {
                matchesCategory = item.category_name === catObj.name;
            }
        }

        // 3. Status
        let matchesStatus = true;
        const isExpired = (item.deadline && new Date(item.deadline) < new Date()) || item.expired;

        if (selectedStatus === 'verified') { // Live
            matchesStatus = !isExpired && !!item.is_verified;
        } else if (selectedStatus === 'expired') {
            matchesStatus = !!isExpired;
        } else if (selectedStatus === 'pending') {
            matchesStatus = !isExpired && !item.is_verified;
        }

        // 4. Deadline
        let matchesDeadline = true;
        if (selectedDeadline) {
            if (item.deadline) {
                matchesDeadline = dayjs(item.deadline).isSame(selectedDeadline, 'day');
            } else {
                matchesDeadline = false;
            }
        }

        return matchesSearch && matchesCategory && matchesStatus && matchesDeadline;
    });

    const columns = [
        {
            title: 'Opportunity Info',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: Opportunity) => (
                <div className="flex flex-col">
                    <span className="font-bold text-base">{text}</span>
                    <Tag className="w-fit mt-1" style={{ fontSize: '10px' }} variant="filled">
                        {record.category_name || 'Uncategorized'}
                    </Tag>
                </div>
            ),
        },
        {
            title: 'Posted By',
            dataIndex: 'creator_name',
            key: 'creator_name',
            render: (name: string) => (
                <Space>
                    <Avatar icon={<UserOutlined />} size="small" style={{ backgroundColor: '#1890ff' }} />
                    <span className="font-medium text-gray-700">{name || 'Unknown'}</span>
                </Space>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            render: (_: unknown, record: Opportunity) => {
                const isExpired = (record.deadline && new Date(record.deadline) < new Date()) || record.expired;
                let status = { label: 'Pending', color: 'default' };

                if (isExpired) {
                    status = { label: 'Expired', color: 'error' };
                } else if (record.is_verified) {
                    status = { label: 'Live', color: 'success' };
                } else {
                    status = { label: 'Pending', color: 'warning' };
                }

                return (
                    <Tag color={status.color} variant="filled">
                        {status.label.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'Dates',
            key: 'dates',
            sorter: (a: Opportunity, b: Opportunity) => {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            },
            render: (_: unknown, record: Opportunity) => (
                <div className="flex flex-col text-sm">
                    <span className="font-medium">
                        {record.deadline ? dayjs(record.deadline).format('MMM D, YYYY') : 'No Deadline'}
                    </span>
                    <Tooltip title={`Created: ${dayjs(record.created_at).format('MMM D, YYYY HH:mm')}`}>
                        <span className="text-gray-400 text-xs">
                            Posted {dayjs(record.created_at).format('MMM D')}
                        </span>
                    </Tooltip>
                </div>
            ),
        },
        {
            title: 'Engagement',
            dataIndex: 'total_engagement',
            key: 'engagement',
            render: (count: number) => (
                <Space>
                    <span className="font-semibold text-blue-600">{count || 0}</span>
                    <span className="text-gray-400 text-xs">views</span>
                </Space>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: Opportunity) => (
                <Link href={`/global-opportunities/${record.id}`}>
                    <Button type="default" icon={<EyeOutlined />}>
                        View Details
                    </Button>
                </Link>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <Title level={2} style={{ margin: 0 }}>Global Opportunities</Title>
            </div>

            {/* Filter Bar */}
            <Card className="mb-6 shadow-sm" variant="borderless">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={6}>
                        <Input
                            placeholder="Search by title..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
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
                            loading={categories.length === 0}
                        >
                            {categories.map(cat => (
                                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
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
                            <Select.Option value="all">All Statuses</Select.Option>
                            <Select.Option value="verified">Verified (Live)</Select.Option>
                            <Select.Option value="pending">Pending</Select.Option>
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

            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`
                }}
            />
        </div>
    );
}
