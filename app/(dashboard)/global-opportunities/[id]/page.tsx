'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography, Spin, Button, App } from 'antd';
import api from '@/lib/api';
import { getFriendlyErrorMessage } from '@/lib/error-utils';
import { Opportunity } from '@/types';
import OpportunityDetailsView from '@/components/OpportunityDetailsView';

const { Title, Text } = Typography;

export default function GlobalOpportunityDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { message } = App.useApp();
    const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOpportunity = async () => {
            if (!id) return;
            try {
                setLoading(true);
                // Fetch from the specific global opportunity endpoint using the ID.
                const res = await api.get(`/moderator/global-opportunities/${id}`);
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

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <Spin size="large" />
                <Text type="secondary">Loading Global Opportunity Details...</Text>
            </div>
        );
    }

    if (!opportunity) {
        return (
            <div className="text-center mt-10">
                <Title level={4}>Opportunity Not Found</Title>
                <Button onClick={() => router.push('/global-opportunities')}>Back to Global Posts</Button>
            </div>
        );
    }

    return (
        <OpportunityDetailsView
            opportunity={opportunity}
            isReadOnly={true}
        />
    );
}
