'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Spin, Button, App, Modal } from 'antd'; // Removed unused imports
import {
    ExclamationCircleFilled
} from '@ant-design/icons';
import api from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/error-utils';
import { Opportunity } from '@/types';
import OpportunityDetailsView from '@/components/OpportunityDetailsView';

const { Title, Text } = Typography;
const { confirm } = Modal;

export default function OpportunityDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { message } = App.useApp();
    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const fetchOpportunity = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const res = await api.get(`/moderator/opportunities/${id}`);
                setOpportunity(res.data);
            } catch (error) {
                console.error('Fetch error:', error);
                const msg = getFriendlyErrorMessage(error);
                message.error(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchOpportunity();
    }, [id, message]);

    const handleDelete = () => {
        confirm({
            title: 'Delete this opportunity?',
            icon: <ExclamationCircleFilled />,
            content: 'Are you sure? This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    setDeleteLoading(true);
                    await api.delete(`/moderator/opportunities/${id}`);
                    message.success('Opportunity deleted successfully');
                    router.push('/opportunities');
                } catch (error) {
                    console.error('Delete error:', error);
                    message.error(getFriendlyErrorMessage(error));
                    setDeleteLoading(false); // Only reset if failed, otherwise we redirect
                }
            },
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <Spin size="large" />
                <Text type="secondary">Loading Opportunity Details...</Text>
            </div>
        );
    }

    if (!opportunity) {
        return (
            <div className="text-center mt-10">
                <Title level={4}>Opportunity Not Found</Title>
                <Button onClick={() => router.push('/opportunities')}>Back to List</Button>
            </div>
        );
    }

    return (
        <OpportunityDetailsView
            opportunity={opportunity}
            isReadOnly={false}
            onDelete={handleDelete}
            deleteLoading={deleteLoading}
        />
    );
}
