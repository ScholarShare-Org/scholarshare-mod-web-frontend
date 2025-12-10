'use client';
import React from 'react';
import { Layout, Button } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { useUser } from '@/context/UserContext';

const { Header } = Layout;

interface DashboardHeaderProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export default function DashboardHeader({ collapsed, setCollapsed }: DashboardHeaderProps) {
    const { user, loading, logout } = useUser();

    return (
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,0.08)' }}>
            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '16px', width: 64, height: 64 }}
                className="!hidden md:!inline-block"
            />
            <div className="flex items-center gap-4 ml-auto">
                {loading ? (
                    <div className="flex flex-col items-end justify-center h-full">
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                ) : (
                    <div className="flex flex-col text-right">
                        {/* Hide 'Welcome' on mobile, show on medium screens+ */}
                        <span className="hidden md:inline text-xs text-gray-500">Welcome,</span>
                        <span className="font-bold text-sm truncate max-w-[120px] md:max-w-none text-gray-800">
                            {user?.name || "Moderator"}
                        </span>
                    </div>
                )}
                <Button icon={<LogoutOutlined />} onClick={logout} danger>Logout</Button>
            </div>
        </Header>
    );
}
