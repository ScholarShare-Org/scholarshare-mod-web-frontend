import { Card, Statistic, Row, Col } from 'antd';
import { RiseOutlined, TeamOutlined, FileTextOutlined } from '@ant-design/icons';

export default function DashboardHome() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Overview</h1>
            <Row gutter={16}>
                <Col span={8}>
                    <Card variant="borderless" className="shadow-sm">
                        <Statistic
                            title="Active Opportunities"
                            value={42}
                            prefix={<FileTextOutlined className="text-blue-500 mr-2" />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless" className="shadow-sm">
                        <Statistic
                            title="Total Student Clicks"
                            value={1204}
                            prefix={<RiseOutlined className="text-green-500 mr-2" />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless" className="shadow-sm">
                        <Statistic
                            title="Moderator Actions"
                            value={15}
                            prefix={<TeamOutlined className="text-purple-500 mr-2" />}
                        />
                    </Card>
                </Col>
            </Row>

            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                {/* Placeholder for recent activity table */}
                <Card>
                    <p className="text-gray-400 text-center py-8">Recent activity will appear here...</p>
                </Card>
            </div>
        </div>
    );
}
