'use client';
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { LoginValues } from '@/types';

const { Title, Text } = Typography;

export default function LoginPage() {
    const { message } = App.useApp();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: LoginValues) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', values);
            const { access_token } = res.data;

            localStorage.setItem('access_token', access_token);
            message.success('Login successful');
            router.push('/');
        } catch (error) {
            console.error('Login error:', error);
            message.error('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="mb-1">
                        <img
                            src="/LOGO_ICON-transparent.png"
                            alt="ScholarShare Logo"
                            className="w-16 h-16 object-contain"
                        />
                    </div>
                    <Title level={3} style={{ color: '#001529', margin: 0, fontWeight: 700 }}>ScholarShare</Title>
                    <p className="text-gray-500 mt-1 text-base">Moderator Portal Access</p>
                </div>
                <Form name="login" onFinish={onFinish} layout="vertical" size="large">
                    <Form.Item name="email" rules={[{ required: true, message: 'Please input your Email!' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: 'Please input your Password!' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
