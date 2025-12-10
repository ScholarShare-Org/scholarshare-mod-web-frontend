'use client';
import React from 'react';
import { Card, Avatar, Skeleton, Empty, Tag } from 'antd';
import { RightOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { LeaderboardResponse, LeaderboardEntry } from '@/types';

interface LeaderboardSummaryProps {
    data: LeaderboardResponse | null;
    loading: boolean;
    currentUserId?: number;
}

export default function LeaderboardSummary({ data, loading, currentUserId }: LeaderboardSummaryProps) {
    const topThree = data?.leaderboard.slice(0, 3) || [];
    const myEntry = data?.leaderboard.find(e => e.mod_id === currentUserId);
    const inTopThree = topThree.some(e => e.mod_id === currentUserId);

    const renderMedal = (rank: number) => {
        if (rank === 1) return <span className="text-2xl">🥇</span>;
        if (rank === 2) return <span className="text-2xl">🥈</span>;
        if (rank === 3) return <span className="text-2xl">🥉</span>;
        return <span className="font-bold text-gray-500 w-8 text-center">{`#${rank}`}</span>;
    };

    return (
        <Card
            title="Top Moderators (This Month)"
            variant="borderless"
            className="shadow-sm h-full"
            extra={<Link href="/leaderboard" className="text-blue-500 hover:underline flex items-center gap-1">View All <RightOutlined className="text-xs" /></Link>}
        >
            {loading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
            ) : topThree.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {topThree.map((entry) => (
                        <div
                            key={entry.mod_id}
                            className={`flex items-center gap-3 p-2 rounded-lg ${entry.rank === 1 ? 'bg-gradient-to-r from-yellow-50 to-white border border-yellow-100' : ''}`}
                        >
                            <div className="w-8 flex justify-center">{renderMedal(entry.rank)}</div>
                            <Link href={`/moderator/view/${entry.mod_id}`}>
                                <Avatar size="small" src={`https://api.dicebear.com/7.x/initials/svg?seed=${entry.name}`} icon={<UserOutlined />} className="cursor-pointer hover:opacity-80 transition-opacity" />
                            </Link>
                            <div className="flex-1 min-w-0">
                                <Link href={`/moderator/view/${entry.mod_id}`} className="hover:underline text-gray-800">
                                    <div className="font-semibold truncate">
                                        {entry.name}
                                        {entry.mod_id === currentUserId && <Tag color="blue" className="ml-2 text-[10px] m-0 border-0">YOU</Tag>}
                                    </div>
                                </Link>
                            </div>
                            <div className="font-bold text-blue-600">{entry.total_engagement} pts</div>
                        </div>
                    ))}

                    {/* Footer for non-top-3 user */}
                    {currentUserId && !inTopThree && data && (
                        <div className="mt-2 text-center text-sm text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                            You are ranked <span className="font-bold text-blue-600">#{data.current_mod_rank}</span> this month.
                        </div>
                    )}
                </div>
            ) : (
                <Empty description="No rankings for this month yet. Start posting!" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
        </Card>
    );
}
