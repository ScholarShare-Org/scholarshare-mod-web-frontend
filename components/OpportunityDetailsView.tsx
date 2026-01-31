'use client';
import React from 'react';
import { Typography, Card, Tag, Button, Statistic, Row, Col, Space, Image, Breadcrumb } from 'antd';
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
    GlobalOutlined,
    EnvironmentOutlined,
    GiftOutlined,
    BulbOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { Opportunity } from '@/types';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';

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

    // Deadline countdown
    const getDeadlineInfo = () => {
        if (!opportunity.deadline) return { text: 'No deadline', color: '#8c8c8c', isUrgent: false };
        const deadlineDate = new Date(opportunity.deadline);
        const daysLeft = differenceInDays(deadlineDate, new Date());

        if (isExpired) {
            return { text: 'Expired', color: '#ff4d4f', isUrgent: false };
        } else if (daysLeft <= 3) {
            return { text: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`, color: '#ff4d4f', isUrgent: true };
        } else if (daysLeft <= 7) {
            return { text: `${daysLeft} days left`, color: '#fa8c16', isUrgent: true };
        } else {
            return { text: `${daysLeft} days left`, color: '#52c41a', isUrgent: false };
        }
    };

    const deadlineInfo = getDeadlineInfo();
    const sourceUrl = opportunity.source_url || opportunity.source;

    return (
        <div className="opportunity-details-container" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <style jsx global>{`
                .opportunity-details-container {
                    padding: 0 12px;
                }
                @media (min-width: 576px) {
                    .opportunity-details-container {
                        padding: 0 24px;
                    }
                }
                .opportunity-header {
                    padding: 16px;
                }
                @media (min-width: 576px) {
                    .opportunity-header {
                        padding: 24px;
                    }
                }
                .opportunity-grid {
                    grid-template-columns: 1fr !important;
                }
                @media (min-width: 992px) {
                    .opportunity-grid {
                        grid-template-columns: 2fr 1fr !important;
                    }
                }
                .header-badges-row {
                    flex-direction: column;
                    align-items: flex-start;
                }
                @media (min-width: 768px) {
                    .header-badges-row {
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: flex-start;
                    }
                }
                .opportunity-title {
                    font-size: 20px !important;
                }
                @media (min-width: 576px) {
                    .opportunity-title {
                        font-size: 24px !important;
                    }
                }
                @media (min-width: 768px) {
                    .opportunity-title {
                        font-size: 28px !important;
                    }
                }
            `}</style>
            {/* Breadcrumb */}
            <div style={{ marginBottom: 16 }}>
                <Breadcrumb
                    items={[
                        { title: <Link href="/">Dashboard</Link> },
                        { title: <Link href={isReadOnly ? "/global-opportunities" : "/opportunities"}>{isReadOnly ? "Global Opportunities" : "My Opportunities"}</Link> },
                        { title: opportunity.title },
                    ]}
                />
            </div>

            {/* Header Section */}
            <div className="opportunity-header" style={{
                marginBottom: 24,
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                borderRadius: 16,
                border: '1px solid #667eea20'
            }}>
                <div className="header-badges-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    {/* Left: Status badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        <Tag color={status.color} style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                            {status.label}
                        </Tag>
                        <Tag color="geekblue">{String(categoryName).toUpperCase()}</Tag>
                        {isReadOnly && opportunity.creator_name && (
                            <Tag color="cyan">👤 Posted by {opportunity.creator_name}</Tag>
                        )}
                    </div>

                    {/* Right: Tags */}
                    {opportunity.tags && opportunity.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {opportunity.tags.map((tag) => (
                                <Tag
                                    key={typeof tag === 'object' ? tag.id : tag}
                                    style={{
                                        borderRadius: 20,
                                        padding: '4px 14px',
                                        background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
                                        border: '1px solid #667eea40',
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: '#5b4caf'
                                    }}
                                >
                                    🏷️ {typeof tag === 'object' ? tag.name : tag}
                                </Tag>
                            ))}
                        </div>
                    )}
                </div>

                <Title level={2} className="opportunity-title" style={{ margin: '0 0 8px 0' }}>{opportunity.title}</Title>

                {/* Subtitle: Provider */}
                {opportunity.provider && (
                    <div style={{ fontSize: 16, color: '#595959', marginBottom: 12 }}>
                        Provided by <strong style={{ color: '#262626' }}>{opportunity.provider}</strong>
                    </div>
                )}

                {/* Meta Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, color: '#8c8c8c', fontSize: 14 }}>
                    {opportunity.location && (
                        <Space>
                            <EnvironmentOutlined />
                            <span>{opportunity.location}</span>
                        </Space>
                    )}
                    {opportunity.created_at && (
                        <Space>
                            <ClockCircleOutlined />
                            <span>Posted {formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}</span>
                        </Space>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                        <Card variant="borderless" style={{ background: '#f6ffed', borderBottom: '2px solid #b7eb8f' }}>
                            <Statistic
                                title={<span style={{ color: '#389e0d', fontWeight: 500 }}>Applied</span>}
                                value={opportunity.total_applied || 0}
                                prefix={<RocketOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
                                styles={{ content: { color: '#389e0d', fontWeight: 'bold' } }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card variant="borderless" style={{ background: '#e6f7ff', borderBottom: '2px solid #91d5ff' }}>
                            <Statistic
                                title={<span style={{ color: '#096dd9', fontWeight: 500 }}>Interested</span>}
                                value={opportunity.total_interested || 0}
                                prefix={<LikeOutlined style={{ color: '#1890ff', marginRight: 8 }} />}
                                styles={{ content: { color: '#096dd9', fontWeight: 'bold' } }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card variant="borderless" style={{ background: '#fffbe6', borderBottom: '2px solid #ffe58f' }}>
                            <Statistic
                                title={<span style={{ color: '#d48806', fontWeight: 500 }}>Saved</span>}
                                value={opportunity.total_saved || 0}
                                prefix={<BookOutlined style={{ color: '#faad14', marginRight: 8 }} />}
                                styles={{ content: { color: '#d48806', fontWeight: 'bold' } }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card variant="borderless" style={{ background: '#f5f5f5', borderBottom: '2px solid #d9d9d9' }}>
                            <Statistic
                                title={<span style={{ color: '#595959', fontWeight: 500 }}>Not Interested</span>}
                                value={opportunity.total_not_interested || 0}
                                prefix={<DislikeOutlined style={{ color: '#8c8c8c', marginRight: 8 }} />}
                                styles={{ content: { color: '#595959', fontWeight: 'bold' } }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* 2-Column Layout */}
            <div>
                <div className="opportunity-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>

                    {/* Main Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* Key Insights */}
                        {opportunity.key_insights && opportunity.key_insights.length > 0 && (
                            <div style={{
                                background: 'linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%)',
                                padding: 24,
                                borderRadius: 12,
                                border: '1px solid #91caff'
                            }}>
                                <Title level={5} style={{ margin: '0 0 16px 0', color: '#0958d9', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <BulbOutlined /> Key Insights
                                </Title>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                    {opportunity.key_insights.map((insight, index) => (
                                        <li key={index} style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 10,
                                            marginBottom: 10,
                                            color: '#1677ff'
                                        }}>
                                            <CheckCircleOutlined style={{ marginTop: 4, flexShrink: 0 }} />
                                            <span style={{ color: '#262626' }}>{insight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Description */}
                        <Card variant="borderless" style={{ borderRadius: 12 }}>
                            <Title level={5} style={{ marginTop: 0 }}>About This Opportunity</Title>
                            <Paragraph style={{
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.8,
                                color: '#595959',
                                fontSize: 15
                            }}>
                                {opportunity.description || 'No description available.'}
                            </Paragraph>
                        </Card>

                        {/* Eligibility */}
                        {opportunity.eligibility && (
                            <Card variant="borderless" style={{
                                borderRadius: 12,
                                background: '#f6ffed',
                                border: '1px solid #b7eb8f'
                            }}>
                                <Title level={5} style={{ marginTop: 0, color: '#389e0d', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <SafetyCertificateOutlined /> Eligibility Criteria
                                </Title>
                                <Paragraph style={{
                                    whiteSpace: 'pre-wrap',
                                    marginBottom: 0,
                                    color: '#595959',
                                    lineHeight: 1.8
                                }}>
                                    {opportunity.eligibility}
                                </Paragraph>
                            </Card>
                        )}

                        {/* Required Documents */}
                        {opportunity.required_documents && opportunity.required_documents.length > 0 && (
                            <Card variant="borderless" style={{
                                borderRadius: 12,
                                background: '#fff7e6',
                                border: '1px solid #ffd591'
                            }}>
                                <Title level={5} style={{ marginTop: 0, color: '#d46b08', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FileTextOutlined /> Required Documents
                                </Title>
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                    {opportunity.required_documents.map((doc, index) => (
                                        <li key={index} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            marginBottom: 8,
                                            color: '#595959',
                                            padding: '8px 12px',
                                            background: '#fff',
                                            borderRadius: 8
                                        }}>
                                            <span style={{ fontSize: 16 }}>📄</span>
                                            <span>{doc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div>
                        <div style={{ position: 'sticky', top: 24 }}>
                            {/* Small Image */}
                            {opportunity.image_url && (
                                <div style={{
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    marginBottom: 16
                                }}>
                                    <Image
                                        src={opportunity.image_url}
                                        alt={opportunity.title}
                                        width="100%"
                                        style={{ aspectRatio: '4/3', objectFit: 'cover', maxHeight: 180 }}
                                        fallback="/placeholder-opportunity.png"
                                        preview={{ mask: 'View Image' }}
                                    />
                                </div>
                            )}

                            {/* Quick Facts Card */}
                            <Card
                                variant="borderless"
                                style={{
                                    borderRadius: 16,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    marginBottom: 16
                                }}
                            >
                                {/* Reward */}
                                <div style={{ marginBottom: 20 }}>
                                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>
                                        Reward / Benefit
                                    </Text>
                                    <div style={{
                                        fontSize: 24,
                                        fontWeight: 700,
                                        color: '#52c41a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        marginTop: 4
                                    }}>
                                        <GiftOutlined />
                                        {opportunity.reward || 'Not specified'}
                                    </div>
                                </div>

                                {/* Deadline */}
                                <div style={{
                                    marginBottom: 20,
                                    padding: 16,
                                    background: deadlineInfo.isUrgent ? '#fff2f0' : '#f6f6f6',
                                    borderRadius: 12,
                                    border: deadlineInfo.isUrgent ? '1px solid #ffccc7' : '1px solid #f0f0f0'
                                }}>
                                    <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>
                                        Application Deadline
                                    </Text>
                                    <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>
                                        <CalendarOutlined style={{ marginRight: 8 }} />
                                        {opportunity.deadline
                                            ? format(new Date(opportunity.deadline), 'MMM dd, yyyy')
                                            : 'No deadline'}
                                    </div>
                                    <div style={{
                                        marginTop: 8,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: deadlineInfo.color
                                    }}>
                                        {deadlineInfo.text}
                                    </div>
                                </div>

                                {/* Apply Button */}
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<LinkOutlined />}
                                    block
                                    href={sourceUrl}
                                    target="_blank"
                                    disabled={!sourceUrl}
                                    style={{
                                        height: 48,
                                        fontSize: 16,
                                        fontWeight: 500,
                                        background: sourceUrl ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined,
                                        border: 'none',
                                        marginBottom: 12
                                    }}
                                >
                                    Visit Application Page
                                </Button>

                                {/* Actions */}
                                {!isReadOnly && (
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={onDelete}
                                            loading={deleteLoading}
                                            block
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                )}

                                {isReadOnly && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#8c8c8c' }}>
                                        <GlobalOutlined />
                                        <span>Global View</span>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
