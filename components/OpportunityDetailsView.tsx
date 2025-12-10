'use client';
import React from 'react';
import { Typography, Card, Tag, Button, Statistic, Row, Col, Space, Image, Descriptions, Breadcrumb } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    CalendarOutlined,
    LinkOutlined,
    SafetyCertificateOutlined,
    LikeOutlined,
    BookOutlined,
    DislikeOutlined,
    RocketOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { Opportunity } from '@/types';

const { Title, Paragraph, Text } = Typography;

interface OpportunityDetailsViewProps {
    opportunity: Opportunity;
    isReadOnly?: boolean;
    onDelete?: () => void;
    deleteLoading?: boolean;
    onEdit?: () => void;
}

export default function OpportunityDetailsView({
    opportunity,
    isReadOnly = false,
    onDelete,
    deleteLoading,
    onEdit
}: OpportunityDetailsViewProps) {

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
                        { title: <Link href={isReadOnly ? "/global-opportunities" : "/opportunities"}>{isReadOnly ? "Global Opportunities" : "My Opportunities"}</Link> },
                        { title: opportunity.title },
                    ]}
                />
            </div>

            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Title level={2} style={{ margin: 0 }}>{opportunity.title}</Title>
                    <Tag color={status.color} className="text-sm px-2 py-0.5 m-0 font-semibold uppercase">
                        {status.label}
                    </Tag>
                    {isReadOnly && opportunity.creator_name && (
                        <Tag color="cyan" className="text-sm px-2 py-0.5 m-0 ml-2">
                            👤 Posted by {opportunity.creator_name}
                        </Tag>
                    )}
                </div>
                {!isReadOnly && (
                    <div className="flex items-center gap-3">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={onDelete}
                            loading={deleteLoading}
                        >
                            Delete
                        </Button>
                    </div>
                )}
                {isReadOnly && (
                    <div className="flex items-center gap-2">
                        <Tag color="cyan" icon={<GlobalOutlined />}>Global View</Tag>
                    </div>
                )}
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
                                <div className="mt-4 flex flex-col gap-4">
                                    <div className="flex flex-wrap justify-between items-center gap-1">
                                        <span className="text-gray-500">Category:</span>
                                        <Tag color="geekblue" variant="filled">{String(categoryName).toUpperCase()}</Tag>
                                    </div>
                                    <div className="flex flex-wrap justify-between items-center gap-1">
                                        <span className="text-gray-500">Type:</span>
                                        <Text>{opportunity.type || 'N/A'}</Text>
                                    </div>
                                    <div className="flex flex-wrap justify-between items-center gap-1">
                                        <span className="text-gray-500">Application Deadline:</span>
                                        <Space className={isExpired ? 'text-red-500' : 'text-gray-700'}>
                                            <CalendarOutlined />
                                            <span className="font-semibold">
                                                {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString(undefined, {
                                                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                                }) : 'No Deadline'}
                                            </span>
                                        </Space>
                                    </div>
                                </div>
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

