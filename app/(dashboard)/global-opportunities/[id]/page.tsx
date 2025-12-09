'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Spin, Card, Tag, Button, App, Divider, Descriptions, Image, Space, Avatar } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, LinkOutlined, SafetyCertificateOutlined, UserOutlined, GlobalOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/error-utils';
import { Opportunity } from '@/types';

const { Title, Paragraph, Text } = Typography;

export default function GlobalOpportunityDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { message } = App.useApp();
    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOpportunity = async () => {
            if (!id) return;
            try {
                setLoading(true);
                // Fetch from the specific global opportunity endpoint using the ID.
                // Note: This endpoint (/moderator/global-opportunities/:id) must be implemented on the backend.
                const res = await api.get(`/moderator/global-opportunities/${id}`);
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

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <Spin size="large" />
                <Text type="secondary">Loading Global Opportunity Details...</Text>
            </div>
        );
    }

    if (!opportunity) {
        return (
            <div className="text-center mt-10">
                <Title level={4}>Opportunity Not Found</Title>
                <Button onClick={() => router.push('/global-opportunities')}>Back to Global Posts</Button>
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
            <div className="mb-6 flex justify-between items-center">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push('/global-opportunities')}
                    size='large'
                >
                    Back to Global Posts
                </Button>
                <div className="flex items-center gap-2">
                    <Tag color="cyan" icon={<GlobalOutlined />}>Global View</Tag>
                </div>
            </div>

            <Card variant="borderless" className="shadow-md rounded-xl overflow-hidden">
                {/* Hero Section / User Info */}
                <div className="bg-gray-50 border-b p-6 mb-6 -mx-6 -mt-6 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                            <Text type="secondary">Posted by <span className="font-semibold text-gray-800">{opportunity.creator_name || 'A Moderator'}</span></Text>
                            <div className="h-4 w-px bg-gray-300" />
                            <Text type="secondary">Posted on {opportunity.created_at ? new Date(opportunity.created_at).toLocaleDateString() : 'Unknown Date'}</Text>
                        </div>
                        <Title level={2} style={{ margin: 0 }}>{opportunity.title}</Title>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Tag color={status.color} className="text-base px-3 py-1 m-0" variant="filled">
                            {status.label.toUpperCase()}
                        </Tag>
                        {opportunity.total_engagement !== undefined && (
                            <Text type="secondary" className="text-xs">
                                👁 {opportunity.total_engagement} Views
                            </Text>
                        )}
                    </div>
                </div>

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
                                    <Descriptions.Item label="Application Deadline">
                                        <Space className={isExpired ? 'text-red-500' : 'text-gray-700'}>
                                            <CalendarOutlined />
                                            <span className="font-semibold">
                                                {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString(undefined, {
                                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                                }) : 'No Deadline'}
                                            </span>
                                        </Space>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>

                            {opportunity.image_url && (
                                <div className="mb-6">
                                    <Text strong className="block mb-2 text-gray-500 text-xs uppercase">Cover Image</Text>
                                    <Image
                                        src={opportunity.image_url}
                                        alt={opportunity.title}
                                        className="rounded-lg object-cover w-full shadow-sm border border-gray-100"
                                        fallback="/placeholder-opportunity.png"
                                    />
                                </div>
                            )}

                            <Button
                                type="primary"
                                size="large"
                                icon={<LinkOutlined />}
                                block
                                href={opportunity.source}
                                target="_blank"
                                disabled={!opportunity.source}
                                className="mb-4"
                            >
                                Visit Official Application
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
