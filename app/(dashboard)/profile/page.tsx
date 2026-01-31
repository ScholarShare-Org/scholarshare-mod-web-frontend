'use client';
import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Avatar, Badge, Statistic, App, Skeleton, Tag } from 'antd';
import {
    UserOutlined,
    TrophyFilled,
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    TeamOutlined,
    RiseOutlined
} from '@ant-design/icons';
import { useUser } from '@/context/UserContext';
const { Title, Text } = Typography;

export default function ProfilePage() {
    const { message } = App.useApp();
    const { user: profile, loading } = useUser();

    useEffect(() => {
        if (!loading && !profile) {
            // Optional: Handle case where user is null but not loading (e.g., failed to fetch)
            message.error("Could not load latest profile data");
        }
    }, [loading, profile, message]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <Skeleton active avatar paragraph={{ rows: 4 }} />
                <div className="mt-8">
                    <Row gutter={[16, 16]}>
                        {[1, 2, 3, 4].map(i => (
                            <Col xs={24} sm={12} md={6} key={i}>
                                <Skeleton.Input active block style={{ height: 100 }} />
                            </Col>
                        ))}
                    </Row>
                </div>
            </div>
        );
    }

    if (!profile) {
        return <div className="text-center mt-10">Failed to load profile.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="page-header animate-fade-in-up">
                <Title level={2} className="page-header-title">Moderator Profile</Title>
                <p className="page-header-subtitle">View your contribution stats and impact metrics.</p>
            </div>

            {/* Section A: Profile Header Card (Identity & Rank) */}
            <Card variant="borderless" className="gradient-header shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <Avatar
                        size={100}
                        icon={<UserOutlined />}
                        className="avatar-ring bg-blue-100 text-blue-600 text-4xl flex items-center justify-center font-bold"
                    >
                        {/* Initials Logic */}
                        {profile.name ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : <UserOutlined />}
                    </Avatar>

                    <div className="flex-1 text-center md:text-left">
                        <Title level={3} style={{ marginBottom: 4 }}>{profile.name}</Title>
                        <Text type="secondary" className="block mb-3">{profile.email}</Text>

                        <div className="flex flex-wrap gap-3 justify-center md:justify-start items-center">
                            {/* Rank Badge */}
                            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full border border-yellow-200 font-medium">
                                <TrophyFilled />
                                <span>Rank #{profile.rank}</span>
                            </div>

                            {/* Category Tag */}
                            <Tag color={profile.category_name ? "blue" : "default"} className="px-3 py-1 text-sm m-0 rounded-full">
                                {profile.category_name || "General Moderator"}
                            </Tag>

                            {/* Joined Date */}
                            <Text type="secondary" className="text-sm">
                                Member since {formatDate(profile.joined_at)}
                            </Text>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Section B: Activity Stats Grid (The Work) */}
            <div>
                <Title level={4} className="mb-4 text-gray-700">Activity Overview</Title>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6} className="animate-fade-in-up">
                        <Card variant="borderless" className="stat-card h-full">
                            <Statistic
                                title="Total Posts"
                                value={profile.stats.total_posts}
                                prefix={<FileTextOutlined className="text-gray-400" />}
                                styles={{ content: { color: '#595959' } }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6} className="animate-fade-in-up animate-delay-1">
                        <Card variant="borderless" className="stat-card stat-card-accent-green h-full">
                            <Statistic
                                title="Verified"
                                value={profile.stats.verified_posts}
                                prefix={<CheckCircleOutlined className="text-green-500" />}
                                styles={{ content: { color: '#3f8600' } }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6} className="animate-fade-in-up animate-delay-2">
                        <Card variant="borderless" className="stat-card stat-card-accent-yellow h-full">
                            <Statistic
                                title="Pending"
                                value={profile.stats.pending_posts}
                                prefix={<ClockCircleOutlined className="text-yellow-500" />}
                                styles={{ content: { color: '#faad14' } }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6} className="animate-fade-in-up animate-delay-3">
                        <Card variant="borderless" className="stat-card stat-card-accent-red h-full">
                            <Statistic
                                title="Rejected"
                                value={profile.stats.rejected_posts}
                                prefix={<CloseCircleOutlined className="text-red-500" />}
                                styles={{ content: { color: '#cf1322' } }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Section C: Engagement Performance (The Impact) */}
            <div>
                <Title level={4} className="mb-4 text-gray-700">Details & Impact</Title>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Card variant="borderless" className="shadow-sm">
                            <Statistic
                                title="Total Student Engagement"
                                value={profile.stats.total_engagement}
                                prefix={<TeamOutlined className="text-blue-500" />}
                                suffix="users reached"
                            />
                            <div className="mt-2 text-gray-400 text-xs">
                                Total interactions across all verified posts
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card variant="borderless" className="shadow-sm">
                            <Statistic
                                title="Avg. Engagement / Post"
                                value={profile.stats.avg_engagement_per_post}
                                precision={1}
                                prefix={<RiseOutlined className="text-purple-500" />}
                            />
                            <div className="mt-2 text-gray-400 text-xs">
                                Average interaction rate per opportunity
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
}
