'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input, Button, Select, DatePicker, Upload, Typography, Row, Col, App, Tag as AntTag } from 'antd';
import { UploadOutlined, RocketOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/error-utils';
import { OpportunityFormValues, Tag } from '@/types';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Category {
    id: number;
    name: string;
    post_count: number;
    tags: Tag[];
}

// Card section component for consistent styling
const FormSection = ({ icon, title, subtitle, children }: {
    icon: string;
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) => (
    <div className="form-section-card">
        <div style={{ marginBottom: 20 }}>
            <Title level={5} style={{ margin: 0, color: '#262626' }}>
                {icon} {title}
            </Title>
            <p style={{ color: '#8c8c8c', fontSize: 13, margin: '4px 0 0 0' }}>
                {subtitle}
            </p>
        </div>
        {children}
    </div>
);

export default function CreateOpportunityPage() {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [keyInsights, setKeyInsights] = useState<string[]>([]);
    const [insightInput, setInsightInput] = useState('');
    const [insightsTouched, setInsightsTouched] = useState(false);
    const [requiredDocs, setRequiredDocs] = useState<string[]>([]);
    const [docInput, setDocInput] = useState('');
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [tagsTouched, setTagsTouched] = useState(false);
    const [form] = Form.useForm();
    const router = useRouter();

    // Watch category selection for tag filtering
    const selectedCategory = Form.useWatch('category', form);

    // Get tags from selected category
    const filteredTags = useMemo(() => {
        if (!selectedCategory) return [];
        const category = categories.find(cat => cat.id === selectedCategory);
        return category?.tags || [];
    }, [selectedCategory, categories]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchCategories = async () => {
            try {
                const res = await api.get('/moderator/categories');
                const categoriesData = res.data.categories || res.data || [];
                setCategories(categoriesData);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                message.error('Failed to load categories');
            }
        };

        fetchCategories();
    }, [message, router]);

    useEffect(() => {
        if (selectedCategory) {
            setSelectedTagIds([]);
            setTagsTouched(false);
        }
    }, [selectedCategory]);

    const toggleTag = (tagId: number) => {
        setSelectedTagIds(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const clearAllTags = () => {
        setSelectedTagIds([]);
    };

    const handleAddInsight = () => {
        const trimmedInsight = insightInput.trim();
        if (trimmedInsight && !keyInsights.includes(trimmedInsight)) {
            setKeyInsights([...keyInsights, trimmedInsight]);
            setInsightInput('');
        }
    };

    const handleRemoveInsight = (insightToRemove: string) => {
        setKeyInsights(keyInsights.filter(insight => insight !== insightToRemove));
    };

    // Handle adding a required document
    const handleAddDoc = () => {
        const trimmedDoc = docInput.trim();
        if (trimmedDoc && !requiredDocs.includes(trimmedDoc)) {
            setRequiredDocs([...requiredDocs, trimmedDoc]);
            setDocInput('');
        }
    };

    // Handle removing a required document
    const handleRemoveDoc = (docToRemove: string) => {
        setRequiredDocs(requiredDocs.filter(doc => doc !== docToRemove));
    };

    const onFinish = async (values: OpportunityFormValues) => {
        setInsightsTouched(true);
        setTagsTouched(true);

        if (keyInsights.length === 0) {
            message.error('Please add at least one key insight');
            return;
        }

        if (selectedTagIds.length === 0) {
            message.error('Please select at least one tag');
            return;
        }

        setLoading(true);
        let opportunityId: number | undefined;

        try {
            const payload = {
                title: values.title,
                description: values.description,
                eligibility: values.eligibility_criteria || '',
                category_id: Number(values.category),
                type: 'scholarship',
                source_url: values.source_url,
                provider: values.provider,
                reward: values.reward,
                location: values.location,
                key_insights: keyInsights,
                required_documents: requiredDocs,
                deadline: values.deadline ? values.deadline.toISOString() : null,
                tag_ids: selectedTagIds,
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
            return;
        }

        // 2. Upload Image if exists
        if (imageFile && opportunityId) {
            try {
                const formData = new FormData();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const fileToSend = (imageFile as any).originFileObj || imageFile;
                formData.append('file', fileToSend);

                const uploadUrl = `/moderator/opportunities/${opportunityId}/image`;
                console.log('Uploading to:', uploadUrl);

                await api.post(uploadUrl, formData, {
                    headers: {
                        'Content-Type': undefined,
                    },
                });

                message.success('Opportunity Created Successfully!');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                console.error('Upload error:', error);
                const messageText = getFriendlyErrorMessage(error);

                if (error.response?.status === 422) {
                    console.error('Validation Details:', error.response.data);
                }

                message.error(`Image Upload Failed: ${messageText}`);
                message.warning('Opportunity created but image upload failed.');
            }
        } else {
            message.success('Opportunity Created Successfully!');
        }

        form.resetFields();
        setImageFile(null);
        setKeyInsights([]);
        setInsightInput('');
        setRequiredDocs([]);
        setDocInput('');
        setSelectedTagIds([]);
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
        <div className="max-w-4xl mx-auto px-4">
            {/* Header */}
            <div className="page-header">
                <Title level={2} className="page-header-title">Create New Opportunity</Title>
                <p className="page-header-subtitle">
                    Post a new scholarship, internship, or workshop to help students discover opportunities.
                </p>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional">

                {/* Section 1: Basic Information */}
                <FormSection
                    icon="📋"
                    title="Basic Information"
                    subtitle="Essential details about the opportunity"
                >
                    <Row gutter={24}>
                        <Col xs={24} md={16}>
                            <Form.Item name="title" label="Opportunity Title" rules={[{ required: true, min: 5 }]}>
                                <Input placeholder="e.g. Google Generation Scholarship 2025" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                                <Select placeholder="Select Category" size="large">
                                    {categories.map(cat => (
                                        <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Tags - Bubble Selection UI */}
                    <Form.Item
                        label={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <span>Tags <span style={{ color: '#ff4d4f' }}>*</span></span>
                                {selectedTagIds.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearAllTags}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#1890ff',
                                            cursor: 'pointer',
                                            fontSize: 12,
                                            padding: 0,
                                            fontWeight: 500
                                        }}
                                    >
                                        Clear all ({selectedTagIds.length})
                                    </button>
                                )}
                            </div>
                        }
                        help={tagsTouched && selectedTagIds.length === 0 ? "Please select at least one tag" : undefined}
                        validateStatus={tagsTouched && selectedTagIds.length === 0 ? "error" : undefined}
                    >
                        {!selectedCategory ? (
                            <div className="empty-state py-4 px-4 bg-gray-50 border-dashed border border-gray-200 rounded-lg text-center">
                                <p className="text-gray-400 text-sm m-0">
                                    👆 Select a category first to see available tags
                                </p>
                            </div>
                        ) : filteredTags.length === 0 ? (
                            <div className="empty-state py-4 px-4 bg-gray-50 border-dashed border border-gray-200 rounded-lg text-center">
                                <p className="text-gray-400 text-sm m-0">
                                    No tags available for this category
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {filteredTags.map(tag => {
                                    const isSelected = selectedTagIds.includes(tag.id);
                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag.id)}
                                            style={{
                                                borderRadius: 20,
                                                padding: '8px 18px',
                                                fontSize: 14,
                                                border: '1.5px solid',
                                                borderColor: isSelected ? '#1890ff' : '#e8e8e8',
                                                backgroundColor: isSelected ? '#1890ff' : '#fff',
                                                color: isSelected ? '#fff' : '#595959',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                fontWeight: isSelected ? 500 : 400,
                                                boxShadow: isSelected ? '0 2px 8px rgba(24, 144, 255, 0.3)' : 'none',
                                            }}
                                            className="hover:border-blue-400 hover:text-blue-500"
                                        >
                                            {isSelected && '✓ '}{tag.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </Form.Item>

                    <Row gutter={24}>
                        <Col xs={24} md={8}>
                            <Form.Item name="provider" label="Provider" rules={[{ required: true, message: 'Provider is required' }]}>
                                <Input placeholder="e.g. Google, AICTE" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="reward" label="Reward" rules={[{ required: true, message: 'Reward is required' }]}>
                                <Input placeholder="e.g. ₹50,000" size="large" prefix="🎁" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="location" label="Location" rules={[{ required: true, message: 'Location is required' }]}>
                                <Input placeholder="e.g. Remote" size="large" prefix="📍" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item name="deadline" label="Application Deadline" rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="source_url" label="Official Application Link" rules={[{ required: true, type: 'url' }]}>
                                <Input placeholder="https://..." size="large" prefix="🔗" />
                            </Form.Item>
                        </Col>
                    </Row>
                </FormSection>

                {/* Section 2: Description & Details */}
                <FormSection
                    icon="📝"
                    title="Description & Details"
                    subtitle="Tell students what this opportunity is about"
                >
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, min: 20 }]}
                    >
                        <TextArea rows={5} placeholder="Describe the opportunity, benefits, timeline, what students will gain..." />
                    </Form.Item>

                    <Form.Item
                        name="eligibility_criteria"
                        label="Eligibility Criteria"
                        rules={[{ required: true, min: 10 }]}
                    >
                        <TextArea rows={3} placeholder="• Must be a 3rd year student&#10;• Minimum 7.0 CGPA&#10;• Open to all branches" />
                    </Form.Item>
                </FormSection>

                {/* Section 3: Required Documents */}
                <FormSection
                    icon="📄"
                    title="Required Documents"
                    subtitle="Documents students need to prepare for application"
                >
                    <Form.Item>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                            <Input
                                placeholder="e.g. Resume/CV, Recommendation Letter"
                                value={docInput}
                                onChange={(e) => setDocInput(e.target.value)}
                                onPressEnter={(e) => {
                                    e.preventDefault();
                                    handleAddDoc();
                                }}
                                style={{ flex: 1 }}
                                size="large"
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddDoc}
                                size="large"
                                className="btn-gradient"
                            >
                                Add
                            </Button>
                        </div>

                        {requiredDocs.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {requiredDocs.map((doc, index) => (
                                    <AntTag
                                        key={index}
                                        closable
                                        onClose={() => handleRemoveDoc(doc)}
                                        style={{
                                            padding: '6px 14px',
                                            fontSize: 14,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            borderRadius: 20,
                                            background: '#f6ffed',
                                            border: '1px solid #b7eb8f'
                                        }}
                                    >
                                        📄 {doc}
                                    </AntTag>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state py-4 px-4 bg-gray-50 border-dashed border border-gray-200 rounded-lg text-center">
                                <p className="text-gray-400 text-sm m-0">
                                    No documents added yet. Add items like &quot;Resume&quot;, &quot;Transcript&quot;, or &quot;Cover Letter&quot;
                                </p>
                            </div>
                        )}
                    </Form.Item>
                </FormSection>

                {/* Section 4: Key Insights */}
                <FormSection
                    icon="💡"
                    title="Key Insights"
                    subtitle="Quick highlights that make this opportunity stand out"
                >
                    <Form.Item
                        required
                        help={insightsTouched && keyInsights.length === 0 ? "Add at least one key insight" : undefined}
                        validateStatus={insightsTouched && keyInsights.length === 0 ? "error" : undefined}
                    >
                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                            <Input
                                placeholder="e.g. No application fee required"
                                value={insightInput}
                                onChange={(e) => setInsightInput(e.target.value)}
                                onPressEnter={(e) => {
                                    e.preventDefault();
                                    handleAddInsight();
                                }}
                                style={{ flex: 1 }}
                                size="large"
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddInsight}
                                size="large"
                                className="btn-gradient"
                            >
                                Add
                            </Button>
                        </div>

                        {keyInsights.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {keyInsights.map((insight, index) => (
                                    <AntTag
                                        key={index}
                                        closable
                                        onClose={() => handleRemoveInsight(insight)}
                                        style={{
                                            padding: '6px 14px',
                                            fontSize: 14,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            borderRadius: 20,
                                            background: '#f0f5ff',
                                            border: '1px solid #adc6ff'
                                        }}
                                    >
                                        ✨ {insight}
                                    </AntTag>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state py-4 px-4 bg-gray-50 border-dashed border border-gray-200 rounded-lg text-center">
                                <p className="text-gray-400 text-sm m-0">
                                    No insights added yet. Add quick highlights like &quot;No application fee&quot; or &quot;Remote friendly&quot;
                                </p>
                            </div>
                        )}
                    </Form.Item>
                </FormSection>

                {/* Section 5: Cover Image */}
                <FormSection
                    icon="🖼️"
                    title="Cover Image"
                    subtitle="Optional - Add an attractive poster or banner"
                >
                    <Form.Item>
                        <Upload.Dragger
                            maxCount={1}
                            listType="picture"
                            customRequest={handleImageUpload}
                            showUploadList={{ showRemoveIcon: true }}
                            onRemove={() => setImageFile(null)}
                            style={{
                                borderRadius: 8,
                                border: '2px dashed #e8e8e8',
                                background: '#fafafa'
                            }}
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                            </p>
                            <p style={{ color: '#595959', marginBottom: 4 }}>
                                Click or drag image to upload
                            </p>
                            <p style={{ color: '#8c8c8c', fontSize: 13 }}>
                                Recommended: 1200x630px for best display
                            </p>
                        </Upload.Dragger>
                    </Form.Item>
                </FormSection>

                {/* Submit Button */}
                <Form.Item style={{ marginBottom: 40 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<RocketOutlined />}
                        size="large"
                        loading={loading}
                        block
                        className="btn-gradient"
                        style={{
                            height: 52,
                            fontSize: 16,
                            fontWeight: 500
                        }}
                    >
                        Publish Opportunity
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
