'use client';
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, Upload, Typography, Row, Col, App } from 'antd';
import { UploadOutlined, RocketOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/error-utils';
import { OpportunityFormValues } from '@/types';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Category {
    id: number;
    name: string;
}

export default function CreateOpportunityPage() {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [form] = Form.useForm();
    const router = useRouter();

    useEffect(() => {
        // Fix Authentication: Ensure token exists
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchCategories = async () => {
            try {
                const res = await api.get('/moderator/categories');
                // The API returns a raw array for this endpoint based on OpenAPI spec
                const categoriesData = Array.isArray(res.data) ? res.data : (res.data.items || res.data.categories || []);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                message.error('Failed to load categories');
            }
        };
        fetchCategories();
    }, [message, router]);

    const onFinish = async (values: OpportunityFormValues) => {
        setLoading(true);
        let opportunityId: number | undefined;

        try {
            // 1. Create Opportunity
            const payload = {
                title: values.title,
                description: `${values.short_description}\n\n${values.full_description}`, // Combined short + full description
                eligibility: values.eligibility_criteria || '',
                category_id: Number(values.category), // Ensure it is sent as a Number
                type: 'scholarship', // Default or add field for type
                source: values.source_url,
                deadline: values.deadline ? values.deadline.toISOString() : null,
                image_url: "", // Send empty string initially as requested
            };

            const res = await api.post('/moderator/opportunities', payload);
            console.log('Step 1 Response:', res.data);
            opportunityId = res.data.opportunity_id;

            if (!opportunityId) {
                throw new Error("Failed to retrieve Opportunity ID. Server response format mismatch.");
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Create error:', error);
            const messageText = getFriendlyErrorMessage(error);
            message.error(messageText);

            if (error.response?.status === 403) {
                localStorage.removeItem('access_token');
                router.push('/login');
            }
            setLoading(false);
            return; // Stop if creation failed
        }

        // 2. Upload Image if exists and creation was successful
        if (imageFile && opportunityId) {
            try {
                const formData = new FormData();
                // Ant Design might wrap the file, check for originFileObj
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const fileToSend = (imageFile as any).originFileObj || imageFile;
                formData.append('file', fileToSend);

                // Use Axios for upload
                const uploadUrl = `/moderator/opportunities/${opportunityId}/image`;
                console.log('Uploading to:', uploadUrl);

                await api.post(uploadUrl, formData, {
                    headers: {
                        'Content-Type': undefined, // Let browser set multipart/form-data with boundary
                    },
                });

                message.success('Opportunity Created Successfully!');
            } catch (error: any) {
                console.error('Upload error:', error);
                const messageText = getFriendlyErrorMessage(error);

                // If it's a validation error (422), we might want to log the details for debugging
                if (error.response?.status === 422) {
                    console.error('Validation Details:', error.response.data);
                }

                // Show the friendly error message
                message.error(`Image Upload Failed: ${messageText}`);
                // Still considering it a partial success as the opportunity was created
                message.warning('Opportunity created but image upload failed.');
            }
        } else {
            message.success('Opportunity Created Successfully!');
        }

        form.resetFields();
        setImageFile(null);
        setLoading(false);
        router.push('/opportunities');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleImageUpload = (options: any) => {
        const { file, onSuccess } = options;
        setImageFile(file);
        onSuccess("ok");
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
                        <Form.Item name="title" label="Opportunity Title" rules={[{ required: true, min: 5 }]}>
                            <Input placeholder="e.g. Google Generation Scholarship 2025" size="large" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                            <Select placeholder="Select Category" size="large">
                                {categories.map(cat => (
                                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="short_description" label="Short Description (Card View)" rules={[{ required: true, min: 10, max: 350 }]}>
                    <TextArea rows={2} showCount maxLength={350} placeholder="Brief summary visible on the card..." />
                </Form.Item>

                <Form.Item name="full_description" label="Full Details & Benefits" rules={[{ required: true, min: 20 }]}>
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

                <Form.Item name="eligibility_criteria" label="Eligibility Criteria" rules={[{ required: true, min: 10 }]}>
                    <TextArea rows={3} placeholder="- Must be a 3rd year student..." />
                </Form.Item>

                <Form.Item label="Cover Image / Poster">
                    <Upload
                        maxCount={1}
                        listType="picture"
                        customRequest={handleImageUpload}
                        showUploadList={{ showRemoveIcon: true }}
                        onRemove={() => setImageFile(null)}
                    >
                        <Button icon={<UploadOutlined />}>Click to Upload</Button>
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
