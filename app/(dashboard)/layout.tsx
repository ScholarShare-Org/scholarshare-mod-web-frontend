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
            <style jsx global>{`
                .sidebar-dark {
                    background: #001529 !important;
                    overflow: hidden;
                }
                .sidebar-menu {
                    padding: 0 8px !important;
                }
                .sidebar-menu .ant-menu-item {
                    margin: 2px 0 !important;
                    padding-left: 16px !important;
                    padding-right: 12px !important;
                    border-radius: 6px !important;
                    transition: background 0.2s ease !important;
                    overflow: hidden;
                }
                .sidebar-menu .ant-menu-item:hover {
                    background: rgba(255, 255, 255, 0.08) !important;
                }
                .sidebar-menu .ant-menu-item-selected {
                    background: #1890ff !important;
                }
                .sidebar-menu .ant-menu-item-selected a,
                .sidebar-menu .ant-menu-item-selected .anticon {
                    color: white !important;
                }
                .bottom-nav-item {
                    transition: all 0.2s ease;
                }
                .bottom-nav-item:active {
                    transform: scale(0.95);
                }
                .bottom-nav-active {
                    color: #1890ff !important;
                }
                .bottom-nav-active::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 24px;
                    height: 3px;
                    background: #1890ff;
                    border-radius: 0 0 4px 4px;
                }
                
                /* Collapsed Sidebar Tweaks */
                .ant-menu-inline-collapsed .ant-menu-item {
                    padding: 0 !important;
                    justify-content: center !important;
                    width: 100% !important;
                    text-align: center !important;
                }
                .ant-menu-inline-collapsed .ant-menu-item .anticon {
                    margin: 0 !important;
                    font-size: 18px !important;
                    line-height: normal !important;
                }
                .ant-menu-inline-collapsed .ant-menu-title-content {
                    display: none !important;
                }
            `}</style>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={260}
                theme="dark"
                className="!hidden md:!block sidebar-dark"
                style={{ boxShadow: '4px 0 15px rgba(0,0,0,0.1)' }}
            >
                {/* Logo */}
                <div className={`h-16 flex items-center justify-center gap-2 border-b border-white/10 mb-2 ${collapsed ? 'mx-0 w-full' : 'mx-3'}`}>
                    <img
                        src="/LOGO_ICON.png"
                        alt="ScholarShare"
                        className="w-9 h-9 object-contain"
                        style={{ borderRadius: '0.5rem' }}
                    />
                    {!collapsed && (
                        <span className="text-white font-bold text-lg tracking-tight">ScholarShare</span>
                    )}
                </div>

                {/* Navigation */}
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[pathname]}
                    items={menuItems}
                    className="sidebar-menu !bg-transparent !border-none"
                    style={{ marginTop: '8px' }}
                />

                {/* Footer */}
                {!collapsed && (
                    <div className="absolute bottom-4 left-0 right-0 px-4">
                        <div className="text-center text-white/40 text-xs">
                            © 2026 ScholarShare
                        </div>
                    </div>
                )}
            </Sider>
            <Layout className="bg-gray-100 min-h-screen">
                <DashboardHeader collapsed={collapsed} setCollapsed={setCollapsed} />
                <Content
                    className="m-4 p-6 bg-white rounded-xl overflow-y-auto min-h-[280px] mb-24 md:mb-6 shadow-sm"
                >
                    {children}
                </Content>

                {/* Mobile Bottom Navigation */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-[1000] flex justify-around items-center py-2 pb-safe-area shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));

                        return (
                            <Link
                                href={item.path}
                                key={item.key}
                                className={`bottom-nav-item relative flex flex-col items-center justify-center w-full py-1.5 ${isActive ? 'bottom-nav-active text-[#667eea]' : 'text-gray-400'}`}
                            >
                                <span className={`text-xl mb-0.5 ${isActive ? 'scale-110' : ''} transition-transform`}>{item.icon}</span>
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
