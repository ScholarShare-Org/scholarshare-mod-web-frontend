'use client';
import React, { useState, useEffect } from 'react';
import { Card, Table, Avatar, Typography, Segmented, Row, Col, Badge, Skeleton, Tag, Empty } from 'antd';
import { CrownFilled, FireFilled, RiseOutlined, UserOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import { useUser } from '@/context/UserContext';
import { LeaderboardEntry, LeaderboardResponse } from '@/types';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function LeaderboardPage() {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<string>('all_time'); // 'this_week', 'this_month', 'all_time'
    const [data, setData] = useState<LeaderboardResponse | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                // Adjust query param based on period filter if needed by backend API design
                // Assuming API takes 'period' query param
                const res = await api.get(`/moderator/leaderboard?period=${period}`);
                setData(res.data);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [period]);

    // Derived: Top 3 for Podium
    const topThree = data?.leaderboard.slice(0, 3) || [];
    // Derived: The rest for the table (or we can show all in table too, redundant but common)
    // Let's show ALL in table, but valid podium visualization first.

    const columns = [
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            render: (rank: number) => {
                let icon = null;
                if (rank === 1) icon = '🥇';
                if (rank === 2) icon = '🥈';
                if (rank === 3) icon = '🥉';
                return <span className="font-bold text-lg">{icon || `#${rank}`}</span>;
            }
        },
        {
            title: 'Moderator',
            key: 'name',
            render: (_: any, record: LeaderboardEntry) => (
                <div className="flex items-center gap-3">
                    <Link href={`/moderator/view/${record.mod_id}`}>
                        <Avatar src={`https://api.dicebear.com/7.x/initials/svg?seed=${record.name}`} icon={<UserOutlined />} className="cursor-pointer hover:opacity-80 transition-opacity" />
                    </Link>
                    <div className="flex flex-col">
                        <Link href={`/moderator/view/${record.mod_id}`} className="hover:underline text-gray-900">
                            <span className="font-semibold">{record.name} {record.mod_id === user?.user_id && <Tag color="blue" className="ml-2 text-xs">YOU</Tag>}</span>
                        </Link>
                        {record.category_name && <span className="text-xs text-gray-500">{record.category_name}</span>}
                    </div>
                </div>
            )
        },
        {
            title: 'Contributions',
            dataIndex: 'total_posts',
            key: 'total_posts',
            align: 'center' as const,
            render: (val: number) => <span className="text-gray-600">{val} Posts</span>
        },
        {
            title: 'Engagement Score',
            dataIndex: 'total_engagement',
            key: 'total_engagement',
            align: 'center' as const,
            sorter: (a: LeaderboardEntry, b: LeaderboardEntry) => a.total_engagement - b.total_engagement,
            render: (val: number) => <span className="font-bold text-blue-600 text-base">{val}</span>
        },
        {
            title: 'Efficiency',
            dataIndex: 'avg_engagement',
            key: 'avg_engagement',
            align: 'center' as const,
            responsive: ['md'],
            render: (val: number) => <span>{val.toFixed(1)} / post</span>
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <Title level={2} style={{ margin: 0 }}>🏆 Leaderboard</Title>
                    <Text type="secondary">Compete with top moderators and track your impact.</Text>
                </div>
                <Segmented
                    options={[
                        { label: 'This Week', value: 'this_week', icon: <FireFilled className="text-orange-500" /> },
                        { label: 'This Month', value: 'this_month' },
                        { label: 'All Time', value: 'all_time', icon: <CrownFilled className="text-yellow-500" /> },
                    ]}
                    value={period}
                    onChange={(val) => setPeriod(val as string)}
                    size="large"
                />
            </div>

            {/* My Rank Summary */}
            {data && user && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center text-blue-800 font-medium">
                    You are currently ranked <span className="font-bold text-lg">#{data.current_mod_rank}</span> out of {data.total_moderators} moderators.
                </div>
            )}

            {/* Loading State */}
            {loading && !data && <Skeleton active />}

            {/* Podium (Only if we have data) */}
            {!loading && topThree.length > 0 && (
                <div className="flex justify-center items-end gap-4 py-8 mb-8 relative">
                    {/* Rank 2 (Silver) */}
                    {topThree[1] && (
                        <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="relative">
                                <Link href={`/moderator/view/${topThree[1].mod_id}`}>
                                    <Avatar size={64} className="border-4 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors" src={`https://api.dicebear.com/7.x/initials/svg?seed=${topThree[1].name}`} />
                                </Link>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-white text-xs px-2 py-0.5 rounded-full font-bold">#2</div>
                            </div>
                            <div className="mt-4 text-center">
                                <Link href={`/moderator/view/${topThree[1].mod_id}`} className="hover:underline text-gray-900">
                                    <div className="font-bold">{topThree[1].name}</div>
                                </Link>
                                <div className="text-blue-600 font-bold">{topThree[1].total_engagement} pts</div>
                            </div>
                            <div className="h-24 w-24 bg-gradient-to-t from-gray-100 to-white mt-2 rounded-t-lg shadow-sm"></div>
                        </div>
                    )}

                    {/* Rank 1 (Gold) */}
                    {topThree[0] && (
                        <div className="flex flex-col items-center z-10 animate-slide-up">
                            <div className="relative mb-2">
                                <CrownFilled className="text-4xl text-yellow-400 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce" />
                                <Link href={`/moderator/view/${topThree[0].mod_id}`}>
                                    <Avatar size={96} className="border-4 border-yellow-400 cursor-pointer hover:border-yellow-500 transition-colors" src={`https://api.dicebear.com/7.x/initials/svg?seed=${topThree[0].name}`} />
                                </Link>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-white text-xs px-3 py-0.5 rounded-full font-bold">#1</div>
                            </div>
                            <div className="mt-2 text-center">
                                <Link href={`/moderator/view/${topThree[0].mod_id}`} className="hover:underline text-gray-900">
                                    <div className="font-bold text-lg">{topThree[0].name}</div>
                                </Link>
                                <div className="text-blue-600 text-xl font-bold">{topThree[0].total_engagement} pts</div>
                            </div>
                            <div className="h-32 w-32 bg-gradient-to-t from-yellow-50 to-white mt-2 rounded-t-lg shadow-sm"></div>
                        </div>
                    )}

                    {/* Rank 3 (Bronze) */}
                    {topThree[2] && (
                        <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="relative">
                                <Link href={`/moderator/view/${topThree[2].mod_id}`}>
                                    <Avatar size={64} className="border-4 border-orange-300 cursor-pointer hover:border-orange-400 transition-colors" src={`https://api.dicebear.com/7.x/initials/svg?seed=${topThree[2].name}`} />
                                </Link>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-300 text-white text-xs px-2 py-0.5 rounded-full font-bold">#3</div>
                            </div>
                            <div className="mt-4 text-center">
                                <Link href={`/moderator/view/${topThree[2].mod_id}`} className="hover:underline text-gray-900">
                                    <div className="font-bold">{topThree[2].name}</div>
                                </Link>
                                <div className="text-blue-600 font-bold">{topThree[2].total_engagement} pts</div>
                            </div>
                            <div className="h-16 w-24 bg-gradient-to-t from-orange-50 to-white mt-2 rounded-t-lg shadow-sm"></div>
                        </div>
                    )}
                </div>
            )}

            {/* Full List Table */}
            <Card variant="borderless" className="shadow-sm">
                {!loading && data?.leaderboard.length === 0 ? (
                    <Empty description="Be the first to appear on the leaderboard!" />
                ) : (
                    <Table
                        columns={columns as any}
                        dataSource={data?.leaderboard || []}
                        rowKey="mod_id"
                        pagination={false}
                        loading={loading}
                        rowClassName={(record) => record.mod_id === user?.user_id ? 'bg-blue-50' : ''}
                    />
                )}
            </Card>
        </div>
    );
}
