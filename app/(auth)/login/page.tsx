'use client';
import React from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const { Title } = Typography;

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // Replace with actual API call: const res = await api.post('/auth/mod/login', values);
            // Mocking success for MVP setup:
            console.log('Login values:', values);
            localStorage.setItem('access_token', 'mock_token_123');
            message.success('Login successful');
            router.push('/');
        } catch (error) {
            message.error('Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div className="text-center mb-6">
                    <Title level={3} style={{ color: '#1890ff' }}>ScholarShare</Title>
                    <p className="text-gray-500">Moderator Portal Access</p>
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
