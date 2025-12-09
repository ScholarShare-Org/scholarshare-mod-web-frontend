'use client';
import React, { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Typography, Table, Tag, Button, Empty, Skeleton, Space } from 'antd';
import {
    RiseOutlined,
    TeamOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    PlusOutlined,
    EyeOutlined,
    RightOutlined,
    AlertOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import api from '@/lib/api';
import { Opportunity } from '@/types';

const { Title, Text } = Typography;

export default function DashboardHome() {
    const { user, loading: userLoading } = useUser();
    const [recentPosts, setRecentPosts] = useState<Opportunity[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);

    useEffect(() => {
        const fetchRecentPosts = async () => {
            try {
                // Fetch only 5 items for the overview
                const res = await api.get('/moderator/opportunities?page=1&page_size=5');
                const mappedData = res.data.opportunities.map((item: any) => ({
                    ...item,
                    category: item.category_name,
                    is_live: !item.expired,
                }));
                setRecentPosts(mappedData);
            } catch (error) {
                console.error("Failed to fetch recent posts:", error);
            } finally {
                setPostsLoading(false);
            }
        };

        fetchRecentPosts();
    }, []);

    // --- RENDER HELPERS ---

    const renderStatusBadge = (record: Opportunity) => {
        const isExpired = (record.deadline && new Date(record.deadline) < new Date()) || (record as any).expired;

        let status = { label: 'To be Verified', color: 'warning' };
        if (isExpired) {
            status = { label: 'Expired', color: 'error' };
        } else if ((record as any).is_verified) {
            status = { label: 'Live', color: 'success' };
        }

        return <Tag color={status.color}>{status.label}</Tag>;
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <Text strong className="line-clamp-1 max-w-[200px]">{text}</Text>,
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            responsive: ['md'],
            render: (date: string) => date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-',
        },
        {
            title: 'Status',
            key: 'status',
            render: (_: any, record: Opportunity) => renderStatusBadge(record),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Opportunity) => (
                <Link href={`/opportunities/${record.id}`}>
                    <Button type="text" icon={<EyeOutlined />} size="small" />
                </Link>
            ),
        }
    ];

    // --- LOADING SKELETON ---
    if (userLoading || postsLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-6"></div>
                <Row gutter={[16, 16]}>
                    {[1, 2, 3, 4].map(i => (
                        <Col xs={24} sm={12} lg={6} key={i}>
                            <Skeleton.Input active block style={{ height: 120 }} />
                        </Col>
                    ))}
                </Row>
                <div className="mt-8">
                    <Skeleton active paragraph={{ rows: 6 }} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Title level={2} style={{ margin: 0 }}>
                        Welcome back, {user?.name?.split(' ')[0] || 'Moderator'} 👋
                    </Title>
                    <Text type="secondary">Here's what's happening with your opportunities today.</Text>
                </div>
                <Link href="/opportunities/create">
                    <Button type="primary" size="large" icon={<PlusOutlined />}>
                        Create Opportunity
                    </Button>
                </Link>
            </div>

            {/* Section A: Vital Signs (Stats Grid) */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="shadow-sm h-full border-l-4 border-yellow-400">
                        <Statistic
                            title="Pending Actions"
                            value={user?.stats?.pending_posts || 0}
                            prefix={<ClockCircleOutlined className="text-yellow-500" />}
                            styles={{ content: { color: '#d48806' } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="shadow-sm h-full border-l-4 border-green-500">
                        <Statistic
                            title="Live Opportunities"
                            value={user?.stats?.verified_posts || 0}
                            prefix={<CheckCircleOutlined className="text-green-500" />}
                            styles={{ content: { color: '#3f8600' } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="shadow-sm h-full">
                        <Statistic
                            title="Total Contribution"
                            value={user?.stats?.total_posts || 0}
                            prefix={<FileTextOutlined className="text-blue-500" />}
                            styles={{ content: { color: '#096dd9' } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" className="shadow-sm h-full">
                        <Statistic
                            title="Total Engagement"
                            value={user?.stats?.total_engagement || 0}
                            prefix={<TeamOutlined className="text-purple-500" />}
                            suffix="views"
                            styles={{ content: { color: '#722ed1' } }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* Section B: Recent Activity */}
                <Col xs={24} lg={16}>
                    <Card
                        title="Recent Opportunities"
                        variant="borderless"
                        className="shadow-sm h-full"
                        extra={<Link href="/opportunities" className="text-blue-500 hover:underline flex items-center gap-1">View All <RightOutlined className="text-xs" /></Link>}
                    >
                        {recentPosts.length > 0 ? (
                            <Table
                                columns={columns as any}
                                dataSource={recentPosts}
                                rowKey="id"
                                pagination={false}
                                size="small"
                                className="overflow-x-auto"
                            />
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="No recent activity found"
                            >
                                <Link href="/opportunities/create">
                                    <Button type="primary" ghost>Create your first post</Button>
                                </Link>
                            </Empty>
                        )}
                    </Card>
                </Col>

                {/* Section C: Quick Actions & Tips */}
                <Col xs={24} lg={8}>
                    <div className="space-y-6">
                        <Card title="Quick Actions" variant="borderless" className="shadow-sm">
                            <Link href="/opportunities/create" className="contents">
                                <Button
                                    block
                                    type="dashed"
                                    className="h-20 group flex items-center justify-center gap-3 border-2 border-blue-200 text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-all rounded-xl px-4"
                                >
                                    <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-blue-100 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <PlusOutlined className="text-lg" />
                                    </div>
                                    <span className="text-base font-semibold">Create New Post</span>
                                </Button>
                            </Link>
                        </Card>

                        <Card title="Moderator Tips" variant="borderless" className="shadow-sm bg-blue-50">
                            <ul className="list-disc pl-4 space-y-2 text-gray-600">
                                <li>Ensure scholarship eligibility criteria are clear.</li>
                                <li>Verify deadlines are in the future before approving.</li>
                                <li>Use high-quality images to boost engagement.</li>
                            </ul>
                        </Card>
                    </div>
                </Col>
            </Row>
        </div>
    );
}
