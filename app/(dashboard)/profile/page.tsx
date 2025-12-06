'use client';
import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Avatar, Button, Descriptions, Badge, Statistic, App, Input, Space } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, LogoutOutlined, CheckCircleOutlined, ClockCircleOutlined, FormOutlined } from '@ant-design/icons';
// import api from '@/lib/api'; // Keeping import for future use
import { ModeratorProfile } from '@/types';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

// 1. Mock Data Simulation
const MOCK_PROFILE: ModeratorProfile = {
    id: 1,
    full_name: "Moderator Name",
    email: "moderator@scholarshare.com",
    phone_number: "+91 98765 43210",
    role: "Senior Moderator",
    institution: "Computer Science Dept", // Using this for Department
    employee_id: "MOD-001",
    image_url: undefined, // Use this to test the "Initials" fallback
    stats: {
        opportunities_created: 12,
        opportunities_verified: 45,
        pending_actions: 3
    }
};

export default function ProfilePage() {
    const { message } = App.useApp();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ModeratorProfile | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        institution: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            // TODO: Replace with api.get('/moderator/me') when backend is ready
            // const res = await api.get('/auth/me');

            // Simulate API delay
            setTimeout(() => {
                setProfile(MOCK_PROFILE);
                setFormData({
                    full_name: MOCK_PROFILE.full_name,
                    email: MOCK_PROFILE.email,
                    phone_number: MOCK_PROFILE.phone_number || '',
                    institution: MOCK_PROFILE.institution || '',
                });
                setLoading(false);
            }, 1000);
        };

        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);

        // TODO: Replace with api.put('/moderator/me', ...)

        // Simulate API delay for save
        setTimeout(() => {
            setProfile({
                ...profile,
                full_name: formData.full_name,
                // Email is read-only usually, but updating local state for consistnecy if we want
                phone_number: formData.phone_number,
                institution: formData.institution,
            });
            setEditMode(false);
            setSaving(false);
            message.success('Profile updated successfully (Mock)');
        }, 500);
    };

    const handleLogout = () => {
        // TODO: Replace with real logout logic
        console.log("User logged out");
        localStorage.removeItem('access_token');
        router.push('/login');
    };

    if (loading) {
        return <Card loading variant="borderless" style={{ marginTop: 20 }} />;
    }

    if (!profile) {
        return <div>Failed to load profile.</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <Title level={2} style={{ margin: 0 }}>Moderator Profile</Title>
                <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
                    Logout
                </Button>
            </div>

            <Row gutter={[24, 24]}>
                {/* Section A: Identity Card */}
                <Col xs={24} md={8}>
                    <Card className="text-center h-full shadow-sm" variant="borderless">
                        <div className="flex flex-col items-center justify-center py-6">
                            <Avatar
                                size={120}
                                src={profile.image_url}
                                icon={<UserOutlined />}
                                className="mb-4 bg-blue-100 text-blue-500"
                            >
                                {/* Fallback initials if no image */}
                                {!profile.image_url && profile.full_name ? profile.full_name.charAt(0).toUpperCase() : null}
                            </Avatar>
                            <Title level={3} style={{ marginBottom: 4 }}>{profile.full_name}</Title>
                            <div className="flex flex-col gap-2">
                                <Badge count="Moderator" style={{ backgroundColor: '#108ee9' }} />
                                <div className="mt-2">
                                    <Badge status="success" text="Active" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Section B: Personal Details */}
                <Col xs={24} md={16}>
                    <Card
                        title="Personal Details"
                        extra={
                            !editMode ? (
                                <Button type="text" icon={<EditOutlined />} onClick={() => setEditMode(true)}>
                                    Edit Profile
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button type="text" icon={<CloseOutlined />} onClick={() => setEditMode(false)} disabled={saving}>
                                        Cancel
                                    </Button>
                                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
                                        Save
                                    </Button>
                                </div>
                            )
                        }
                        className="h-full shadow-sm"
                        variant="borderless"
                    >
                        <Descriptions column={1} layout="horizontal" bordered>
                            <Descriptions.Item label="Full Name">
                                {editMode ? (
                                    <Input
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                ) : (
                                    profile.full_name
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item label="Email">
                                {editMode ? (
                                    <Input
                                        value={formData.email}
                                        disabled
                                        className="text-gray-500 cursor-not-allowed"
                                    />
                                ) : (
                                    profile.email
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item label="Phone Number">
                                {editMode ? (
                                    <Input
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    profile.phone_number || <Text type="secondary">Not set</Text>
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item label="Department">
                                {editMode ? (
                                    <Input
                                        value={formData.institution}
                                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                        placeholder="Enter department"
                                    />
                                ) : (
                                    profile.institution || <Text type="secondary">Not set</Text>
                                )}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                {/* Section C: Impact Stats */}
                <Col span={24}>
                    <Title level={4} className="mb-4 mt-2">Impact Overview</Title>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                            <Card variant="borderless" className="shadow-sm">
                                <Statistic
                                    title="Opportunities Created"
                                    value={profile.stats?.opportunities_created || 0}
                                    prefix={<FormOutlined className="text-blue-500" />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card variant="borderless" className="shadow-sm">
                                <Statistic
                                    title="Opportunities Verified"
                                    value={profile.stats?.opportunities_verified || 0}
                                    prefix={<CheckCircleOutlined className="text-green-500" />}
                                    styles={{ content: { color: '#3f8600' } }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card variant="borderless" className="shadow-sm">
                                <Statistic
                                    title="Pending Actions"
                                    value={profile.stats?.pending_actions || 0}
                                    prefix={<ClockCircleOutlined className="text-orange-500" />}
                                    styles={{ content: { color: '#faad14' } }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    );
}
