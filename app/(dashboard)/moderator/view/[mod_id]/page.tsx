'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Card, Avatar, Row, Col, Statistic, Tag, Button, Spin, App, Breadcrumb } from 'antd';
import {
    UserOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    RiseOutlined,
    StarOutlined,
    ArrowLeftOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import api from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/error-utils';
import { ModeratorProfile, RecentPost } from '@/types';
import Link from 'next/link';
import { format } from 'date-fns';

const { Title, Text } = Typography;

export default function ModeratorProfilePage() {
    const { mod_id } = useParams();
    const router = useRouter();
    const { message } = App.useApp();
    const [profile, setProfile] = useState<ModeratorProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!mod_id) return;
            try {
                setLoading(true);
                const res = await api.get(`/moderator/moderators/${mod_id}`);
                setProfile(res.data);
            } catch (error) {
                console.error('Fetch error:', error);
                const msg = getFriendlyErrorMessage(error);
                message.error(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [mod_id, message]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <Spin size="large" />
                <Text type="secondary">Loading Moderator Profile...</Text>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center mt-10">
                <Title level={4}>Moderator Not Found</Title>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formattedJoinedDate = profile.joined_at
        ? format(new Date(profile.joined_at), 'MMMM yyyy')
        : 'Unknown';

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-4">
                <Breadcrumb
                    items={[
                        { title: <Link href="/">Dashboard</Link> },
                        { title: <Link href="/leaderboard">Leaderboard</Link> },
                        { title: profile.name },
                    ]}
                />
            </div>

            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
                className="mb-6"
            >
                Back
            </Button>

            {/* Hero / Identity Card */}
            <Card variant="borderless" className="mb-8 shadow-sm bg-white">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <Avatar
                        size={100}
                        style={{ backgroundColor: '#1890ff', fontSize: '32px' }}
                    >
                        {getInitials(profile.name)}
                    </Avatar>
                    <div className="flex-1 text-center md:text-left">
                        <Title level={2} style={{ margin: 0, marginBottom: 8 }}>{profile.name}</Title>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <Tag color="gold" className="text-base px-3 py-1 font-semibold rounded-full border-0">
                                🏆 Rank #{profile.rank}
                            </Tag>
                            <Text type="secondary" className="flex items-center gap-1">
                                <CalendarOutlined /> Member since {formattedJoinedDate}
                            </Text>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Stats Grid */}
            <div className="mb-8">
                <Title level={4} className="mb-4">Performance Overview</Title>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Card variant="borderless" className="shadow-sm hover:shadow-md transition-shadow">
                            <Statistic
                                title="Total Contributions"
                                value={profile.stats.total_posts}
                                prefix={<FileTextOutlined className="text-blue-500" />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card variant="borderless" className="shadow-sm hover:shadow-md transition-shadow">
                            <Statistic
                                title="Verified Posts"
                                value={profile.stats.verified_posts}
                                prefix={<CheckCircleOutlined className="text-green-500" />}
                                suffix={<span className="text-xs text-gray-400">/ {profile.stats.total_posts}</span>}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card variant="borderless" className="shadow-sm hover:shadow-md transition-shadow">
                            <Statistic
                                title="Total Impact"
                                value={profile.stats.total_engagement}
                                prefix={<RiseOutlined className="text-purple-500" />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card variant="borderless" className="shadow-sm hover:shadow-md transition-shadow">
                            <Statistic
                                title="Quality Score"
                                value={profile.stats.avg_engagement_per_post}
                                precision={1}
                                prefix={<StarOutlined className="text-yellow-500" />}
                                suffix={<span className="text-xs text-gray-400">avg. engagement</span>}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Recent Verified Posts */}
            <div>
                <Title level={4} className="mb-4">Recent Verified Posts</Title>
                {!profile.recent_posts || profile.recent_posts.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 border border-dashed border-gray-200 rounded-lg">
                        No recent posts found.
                    </div>
                ) : (
                    <Row gutter={[16, 16]}>
                        {profile.recent_posts.map((item: RecentPost) => (
                            <Col xs={24} sm={12} md={8} lg={8} xl={8} xxl={8} key={item.id}>
                                <Link href={`/global-opportunities/${item.id}`}>
                                    <Card
                                        hoverable
                                        variant="borderless"
                                        className="shadow-sm h-full"
                                        cover={
                                            <div className="h-40 overflow-hidden bg-gray-100 relative">
                                                <img
                                                    alt={item.title}
                                                    src={item.image_url || "/placeholder-opportunity.png"}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = "/placeholder-opportunity.png";
                                                    }}
                                                />
                                            </div>
                                        }
                                    >
                                        <Card.Meta
                                            title={<span className="text-blue-600 hover:underline">{item.title}</span>}
                                            description={
                                                <div className="flex flex-col gap-1 mt-2">
                                                    <div className="flex justify-between items-center">
                                                        <Tag color="geekblue">{item.category_name || 'General'}</Tag>
                                                        <span className="text-xs text-gray-400">
                                                            {item.created_at ? format(new Date(item.created_at), 'MMM d, yyyy') : ''}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
                                                        <RiseOutlined /> {item.engagement || 0} Engagement
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </Card>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
}
