'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Spin, Card, Tag, Button, App, Divider, Descriptions, Image, Space } from 'antd';
import { ArrowLeftOutlined, EditOutlined, CalendarOutlined, LinkOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/error-utils';
import { Opportunity } from '@/types';

const { Title, Paragraph, Text } = Typography;

export default function OpportunityDetailsPage() {
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
                const res = await api.get(`/moderator/opportunities/${id}`);
                // Start with raw data
                const data = res.data;

                // Normalize data if needed (similar to list view but for single item)
                // Assuming api returns the object directly or wrapped. 
                // Based on list view it might require some mapping if structure is flat vs nested.
                // Let's assume standard object return for now, but will debug if structure differs.

                // Handle potential difference in category field (id vs object vs name)
                // The list view had to map `category_name`, let's see what detail gives.
                // We will set it as is and render safely.

                setOpportunity(data);
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

    // derived state for checks
    // Derived State: Status Logic (Replicated from Manage Opportunities Table)
    const isExpired = (opportunity.deadline && new Date(opportunity.deadline) < new Date()) || opportunity.expired;

    let status = { label: 'To be Verified', color: 'warning' };

    if (isExpired) {
        status = { label: 'Expired', color: 'error' };
    } else if (opportunity.is_verified) {
        status = { label: 'Live', color: 'success' };
    }

    const categoryName = opportunity.category_name || opportunity.category || 'Uncategorized';

    return (
        <div className="max-w-5xl mx-auto p-4">
            {/* Header / Nav */}
            <div className="mb-6 flex justify-between items-center">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push('/opportunities')}
                >
                    Back to Opportunities
                </Button>
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => message.info('Edit functionality coming soon!')}
                >
                    Edit Opportunity
                </Button>
            </div>

            <Card variant="borderless" className="shadow-sm">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Left: Image & Key Info */}
                    <div className="w-full md:w-1/3">
                        <div className="mb-6">
                            <Image
                                src={opportunity.image_url || "/placeholder-opportunity.png"}
                                alt={opportunity.title}
                                className="rounded-lg object-cover w-full"
                                fallback="/placeholder-opportunity.png"
                            />
                            {/* Image Metadata / Caption */}
                            {opportunity.title && (
                                <Text type="secondary" className="block mt-2 text-sm text-center">
                                    Image for: {opportunity.title}
                                </Text>
                            )}
                        </div>

                        <Divider>Quick Info</Divider>
                        <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label="Category">
                                <Tag color="geekblue">{String(categoryName).toUpperCase()}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={status.color}>
                                    {status.label.toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Deadline">
                                <Space>
                                    <CalendarOutlined />
                                    {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : 'No Deadline'}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Source">
                                {opportunity.source ? (
                                    <a href={opportunity.source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                        <LinkOutlined /> Visit Official Link
                                    </a>
                                ) : 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>

                    {/* Right: Main Content */}
                    <div className="w-full md:w-2/3">
                        <Title level={2}>{opportunity.title}</Title>

                        <div className="mb-6">
                            <Text strong className="block mb-2">Short Description</Text>
                            <Paragraph type="secondary" className="text-lg">
                                {opportunity.description ? opportunity.description.split('\n\n')[0] : 'No description available.'}
                            </Paragraph>
                        </div>

                        <Divider />

                        <div className="mb-6">
                            <Title level={4}>Full Details</Title>
                            <Paragraph className="whitespace-pre-wrap">
                                {opportunity.description || 'No additional details provided.'}
                            </Paragraph>
                        </div>

                        {opportunity.eligibility && (
                            <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-100">
                                <Title level={5}><SafetyCertificateOutlined className="mr-2" />Eligibility Criteria</Title>
                                <Paragraph className="whitespace-pre-wrap mb-0">
                                    {opportunity.eligibility}
                                </Paragraph>
                            </div>
                        )}

                    </div>
                </div>
            </Card>
        </div>
    );
}
