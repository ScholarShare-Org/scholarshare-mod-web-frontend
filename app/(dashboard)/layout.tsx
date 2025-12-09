/* eslint-disable */
'use client';
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
    AppstoreOutlined,
    PlusCircleOutlined,
    UnorderedListOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';

const { Header, Sider, Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                // We use the same endpoint as the profile page
                const res = await api.get('/moderator/profile');
                setUserName(res.data.name);
            } catch (err) {
                console.error("Failed to fetch user name for header:", err);
                // Fallback is handled in render
            } finally {
                setLoadingUser(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        router.push('/login');
    };

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
                <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,0.08)' }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />
                    <div className="flex items-center gap-4">
                        {loadingUser ? (
                            <div className="flex flex-col items-end justify-center h-full">
                                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        ) : (
                            <div className="flex flex-col text-right">
                                {/* Hide 'Welcome' on mobile, show on medium screens+ */}
                                <span className="hidden md:inline text-xs text-gray-500">Welcome,</span>
                                <span className="font-bold text-sm truncate max-w-[120px] md:max-w-none text-gray-800">
                                    {userName || "Moderator"}
                                </span>
                            </div>
                        )}
                        <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>Logout</Button>
                    </div>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff', borderRadius: '8px', overflowY: 'auto' }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
