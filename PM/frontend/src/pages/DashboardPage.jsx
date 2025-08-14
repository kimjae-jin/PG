import React, { useMemo } from 'react';
import { Users, FileText, GanttChartSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import useApi from '../hooks/useApi';

const DashboardPage = () => {
    const { data: technicians, loading: loadingTechs } = useApi('/technicians');
    const { data: bids, loading: loadingBids } = useApi('/bids');
    const { data: contracts, loading: loadingContracts } = useApi('/contracts');
    
    const bidsByStatus = useMemo(() => {
        if (!bids) return [];
        const statusCounts = bids.reduce((acc, bid) => {
            acc[bid.status] = (acc[bid.status] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(statusCounts).map(([name, value]) => ({ name, bids: value }));
    }, [bids]);

    const loading = loadingTechs || loadingBids || loadingContracts;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Technicians" value={loading ? '...' : technicians.length} icon={<Users />} />
                <StatCard title="Active Bids" value={loading ? '...' : bids.filter(b => ['Planning', 'Evaluating', 'Submitted'].includes(b.status)).length} icon={<FileText />} />
                <StatCard title="Contracts In Progress" value={loading ? '...' : contracts.filter(c => c.status === 'In Progress').length} icon={<GanttChartSquare />} />
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-surface p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold text-text-primary mb-4">Bid Status Overview</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            {loading ? <p className="text-text-secondary">Loading chart data...</p> : (
                            <BarChart data={bidsByStatus} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
                                <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                                <Bar dataKey="bids" fill="#3B82F6" />
                            </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
