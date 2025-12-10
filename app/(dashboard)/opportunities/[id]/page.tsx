'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Spin, Card, Tag, Button, App, Divider, Descriptions, Image, Space, Breadcrumb, Statistic, Row, Col, Modal } from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
    CalendarOutlined,
    LinkOutlined,
    SafetyCertificateOutlined,
    LikeOutlined,
    BookOutlined,
    DislikeOutlined,
    RocketOutlined,
    ExclamationCircleFilled
} from '@ant-design/icons';
import api from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/error-utils';
import { Opportunity } from '@/types';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;
const { confirm } = Modal;

export default function OpportunityDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { message } = App.useApp();
    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const fetchOpportunity = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const res = await api.get(`/moderator/opportunities/${id}`);
                setOpportunity(res.data);
            } catch (error) {
                console.error('Fetch error:', error);
                const msg = getFriendlyErrorMessage(error);
                message.error(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchOpportunity();
    }, [id, message]);

    const handleDelete = () => {
        confirm({
            title: 'Delete this opportunity?',
            icon: <ExclamationCircleFilled />,
            content: 'Are you sure? This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    setDeleteLoading(true);
                    await api.delete(`/moderator/opportunities/${id}`);
                    message.success('Opportunity deleted successfully');
                    router.push('/opportunities');
                } catch (error) {
                    console.error('Delete error:', error);
                    message.error(getFriendlyErrorMessage(error));
                    setDeleteLoading(false); // Only reset if failed, otherwise we redirect
                }
            },
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <Spin size="large" />
                <Text type="secondary">Loading Opportunity Details...</Text>
            </div>
        );
    }

    if (!opportunity) {
        return (
            <div className="text-center mt-10">
                <Title level={4}>Opportunity Not Found</Title>
                <Button onClick={() => router.push('/opportunities')}>Back to List</Button>
            </div>
        );
    }

    // Status Logic
    const isExpired = (opportunity.deadline && new Date(opportunity.deadline) < new Date()) || opportunity.expired;
    let status = { label: 'To be Verified', color: 'warning' };

    if (isExpired) {
        status = { label: 'Expired', color: 'error' };
    } else if (opportunity.is_verified) {
        status = { label: 'Live', color: 'success' };
    }

    const categoryName = opportunity.category_name || opportunity.category || 'Uncategorized';

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header / Nav */}
            <div className="mb-4">
                <Breadcrumb
                    items={[
                        { title: <Link href="/">Dashboard</Link> },
                        { title: <Link href="/opportunities">My Opportunities</Link> },
                        { title: opportunity.title },
                    ]}
                />
            </div>

            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Title level={2} style={{ margin: 0 }}>{opportunity.title}</Title>
                    <Tag color={status.color} className="text-sm px-2 py-0.5 m-0 font-semibold uppercase">
                        {status.label}
                    </Tag>
                </div>
                <div className="flex items-center gap-3">

                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDelete}
                        loading={deleteLoading}
                    >
                        Delete
                    </Button>
                </div>
            </div>

            {/* Performance / Stats Section */}
            <div className="mb-8">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Card variant="borderless" className="shadow-sm hover:shadow-md transition-shadow bg-green-50 border-b-2 border-green-200">
                            <Statistic
                                title={<span className="text-green-800 font-medium">Applied</span>}
                                value={opportunity.total_applied || 0}
                                prefix={<RocketOutlined className="text-green-600 mr-2" />}
                                styles={{ content: { color: '#16a34a', fontWeight: 'bold' } }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card variant="borderless" className="shadow-sm hover:shadow-md transition-shadow bg-blue-50 border-b-2 border-blue-200">
                            <Statistic
                                title={<span className="text-blue-800 font-medium">Interested</span>}
                                value={opportunity.total_interested || 0}
                                prefix={<LikeOutlined className="text-blue-600 mr-2" />}
                                styles={{ content: { color: '#2563eb', fontWeight: 'bold' } }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card variant="borderless" className="shadow-sm hover:shadow-md transition-shadow bg-yellow-50 border-b-2 border-yellow-200">
                            <Statistic
                                title={<span className="text-yellow-800 font-medium">Saved</span>}
                                value={opportunity.total_saved || 0}
                                prefix={<BookOutlined className="text-yellow-600 mr-2" />}
                                styles={{ content: { color: '#ca8a04', fontWeight: 'bold' } }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card variant="borderless" className="shadow-sm hover:shadow-md transition-shadow bg-gray-50 border-b-2 border-gray-200">
                            <Statistic
                                title={<span className="text-gray-600 font-medium">Not Interested</span>}
                                value={opportunity.total_not_interested || 0}
                                prefix={<DislikeOutlined className="text-gray-500 mr-2" />}
                                styles={{ content: { color: '#4b5563', fontWeight: 'bold' } }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            <Card variant="borderless" className="shadow-md rounded-xl overflow-hidden">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left: Content */}
                    <div className="w-full md:w-2/3 order-2 md:order-1">



                        <div className="mb-8">
                            <Text strong className="block mb-2 text-gray-500 uppercase text-xs tracking-wider">Short Description</Text>
                            <Paragraph className="text-lg leading-relaxed text-gray-700 bg-blue-50/50 p-4 rounded-lg border-l-4 border-blue-200">
                                {opportunity.description ? opportunity.description.split('\n\n')[0] : 'No description available.'}
                            </Paragraph>
                        </div>

                        <div className="mb-8">
                            <Title level={4}>Full Details</Title>
                            <Paragraph className="whitespace-pre-wrap text-gray-600 leading-relaxed">
                                {opportunity.description || 'No additional details provided.'}
                            </Paragraph>
                        </div>

                        {opportunity.eligibility && (
                            <div className="mb-6 bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
                                <Title level={5} className="text-green-700 flex items-center gap-2">
                                    <SafetyCertificateOutlined /> Eligibility Criteria
                                </Title>
                                <Paragraph className="whitespace-pre-wrap mb-0 text-gray-600">
                                    {opportunity.eligibility}
                                </Paragraph>
                            </div>
                        )}
                    </div>

                    {/* Right: Sidebar Info */}
                    <div className="w-full md:w-1/3 order-1 md:order-2">
                        <div className="sticky top-6">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                                <Title level={5}>Quick Facts</Title>
                                <Descriptions column={1} size="small" className="mt-4">
                                    <Descriptions.Item label="Category">
                                        <Tag color="geekblue" variant="filled">{String(categoryName).toUpperCase()}</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Type">
                                        <Text>{opportunity.type || 'N/A'}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Application Deadline">
                                        <Space className={isExpired ? 'text-red-500' : 'text-gray-700'}>
                                            <CalendarOutlined />
                                            <span className="font-semibold">
                                                {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString(undefined, {
                                                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                                }) : 'No Deadline'}
                                            </span>
                                        </Space>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>

                            <Button
                                type="default"
                                size="large"
                                icon={<LinkOutlined />}
                                block
                                href={opportunity.source}
                                target="_blank"
                                disabled={!opportunity.source}
                                className="mb-4"
                            >
                                Visit Official Link
                            </Button>

                            {/* Hero Image */}
                            <div className="mb-8 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                <Image
                                    src={opportunity.image_url}
                                    alt={opportunity.title}
                                    width="100%"
                                    className="object-cover"
                                    style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                                    fallback="/placeholder-opportunity.png"
                                    preview={{ mask: 'View Full Image' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
