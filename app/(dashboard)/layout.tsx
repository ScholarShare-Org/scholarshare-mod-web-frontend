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
    UserOutlined
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
    const menuItems = [
        { key: '/', icon: <AppstoreOutlined />, label: <Link href="/">Dashboard</Link> },
        { key: '/opportunities/create', icon: <PlusCircleOutlined />, label: <Link href="/opportunities/create">Create New</Link> },
        { key: '/opportunities', icon: <UnorderedListOutlined />, label: <Link href="/opportunities">All Posts</Link> },
        { key: '/profile', icon: <UserOutlined />, label: <Link href="/profile">Profile</Link> },
    ];

    if (!mounted) return null; // Prevent hydration mismatch on sidebar

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed} width={240} theme="dark">
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
            <Layout>
                <DashboardHeader collapsed={collapsed} setCollapsed={setCollapsed} />
                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff', borderRadius: '8px', overflowY: 'auto' }}>
                    {children}
                </Content>
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
