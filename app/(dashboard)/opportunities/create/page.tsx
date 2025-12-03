'use client';
import React, { useState } from 'react';
import { Form, Input, Button, Select, DatePicker, Upload, message, Typography, Row, Col, Switch } from 'antd';
import { UploadOutlined, RocketOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function CreateOpportunityPage() {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // Convert AntD Date object to ISO String for backend
            const payload = {
                ...values,
                deadline: values.deadline ? values.deadline.toISOString() : null,
                is_live: true, // Defaulting to live for MVP
            };

            console.log('Submitting Payload:', payload);
            // await api.post('/mod/opportunities', payload);

            message.success('Opportunity Created Successfully!');
            form.resetFields();
        } catch (error) {
            message.error('Failed to create opportunity');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 border-b pb-4">
                <Title level={2}>Create New Opportunity</Title>
                <p className="text-gray-500">Post a new scholarship, internship, or workshop to the student feed.</p>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional">
                <Row gutter={24}>
                    <Col span={16}>
                        <Form.Item name="title" label="Opportunity Title" rules={[{ required: true }]}>
                            <Input placeholder="e.g. Google Generation Scholarship 2025" size="large" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                            <Select placeholder="Select Category" size="large">
                                <Option value="Scholarship">Scholarship</Option>
                                <Option value="Internship">Internship</Option>
                                <Option value="Workshop">Workshop</Option>
                                <Option value="Competition">Competition</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="short_description" label="Short Description (Card View)" rules={[{ required: true, max: 200 }]}>
                    <TextArea rows={2} showCount maxLength={200} placeholder="Brief summary visible on the card..." />
                </Form.Item>

                <Form.Item name="full_description" label="Full Details & Benefits" rules={[{ required: true }]}>
                    <TextArea rows={6} placeholder="Detailed explanation..." />
                </Form.Item>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name="deadline" label="Application Deadline" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} size="large" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="source_url" label="Official Application Link" rules={[{ required: true, type: 'url' }]}>
                            <Input placeholder="https://..." size="large" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="eligibility_criteria" label="Eligibility Criteria">
                    <TextArea rows={3} placeholder="- Must be a 3rd year student..." />
                </Form.Item>

                <Form.Item label="Cover Image / Poster">
                    <Upload maxCount={1} listType="picture">
                        <Button icon={<UploadOutlined />}>Click to Upload (Supabase)</Button>
                    </Upload>
                </Form.Item>

                <Form.Item className="mt-8">
                    <Button type="primary" htmlType="submit" icon={<RocketOutlined />} size="large" loading={loading} block>
                        Publish Opportunity
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
