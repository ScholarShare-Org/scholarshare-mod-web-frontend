/* eslint-disable */
'use client';
import React, { useState, useEffect } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import { UserProvider } from '@/context/UserContext';
import { Layout, Menu } from 'antd';
import {
    AppstoreOutlined,
    PlusCircleOutlined,
    UnorderedListOutlined,
    UserOutlined,
    TrophyOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Sider, Content } = Layout;

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Menu items config
    const navItems = [
        { key: '/', icon: <AppstoreOutlined />, label: 'Dashboard', path: '/' },
        { key: '/opportunities/create', icon: <PlusCircleOutlined />, label: 'Create New', path: '/opportunities/create' },
        { key: '/opportunities', icon: <UnorderedListOutlined />, label: 'My Posts', path: '/opportunities' },
        { key: '/global-opportunities', icon: <GlobalOutlined />, label: 'Global Posts', path: '/global-opportunities' },
        { key: '/leaderboard', icon: <TrophyOutlined />, label: 'Leaderboard', path: '/leaderboard' },
        { key: '/profile', icon: <UserOutlined />, label: 'Profile', path: '/profile' },
    ];

    const menuItems = navItems.map(item => ({
        key: item.path,
        icon: item.icon,
        label: <Link href={item.path}>{item.label}</Link>
    }));

    if (!mounted) return null; // Prevent hydration mismatch on sidebar

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={240}
                theme="dark"
                className="!hidden md:!block"
            >
                <div className="h-16 flex items-center justify-center text-white font-bold text-xl border-b border-gray-700">
                    {collapsed ? 'SS' : 'ScholarShare'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[pathname]}
                    items={menuItems}
                    style={{ marginTop: '10px' }}
                />
            </Sider>
            <Layout className="bg-gray-100 min-h-screen">
                <DashboardHeader collapsed={collapsed} setCollapsed={setCollapsed} />
                <Content
                    className="m-4 p-6 bg-white rounded-lg overflow-y-auto min-h-[280px] mb-24 md:mb-6"
                >
                    {children}
                </Content>

                {/* Mobile Bottom Navigation */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[1000] flex justify-around items-center py-2 pb-safe-area shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));

                        return (
                            <Link
                                href={item.path}
                                key={item.key}
                                className={`flex flex-col items-center justify-center w-full py-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
                            >
                                <span className="text-xl mb-0.5">{item.icon}</span>
                                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </Layout>
        </Layout>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </UserProvider>
    );
}
