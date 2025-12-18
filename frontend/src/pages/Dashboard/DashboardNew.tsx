import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { DashboardData } from '../../types';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {
    Building2,
    Users,
    Heart,
    FileText,
    TrendingUp,
    TrendingDown,
    Calendar,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import './DashboardNew.css';

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    trend?: {
        value: number | string;
        isPositive: boolean;
    };
    color: 'blue' | 'green' | 'purple' | 'pink' | 'orange' | 'teal';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color }) => {
    const colorClasses = {
        blue: 'stat-card-blue',
        green: 'stat-card-green',
        purple: 'stat-card-purple',
        pink: 'stat-card-pink',
        orange: 'stat-card-orange',
        teal: 'stat-card-teal',
    };

    return (
        <div className={cn('stat-card', colorClasses[color])}>
            <div className="stat-card-header">
                <div className="stat-card-icon">
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={cn('stat-card-trend', trend.isPositive ? 'positive' : 'negative')}>
                        {trend.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span>{typeof trend.value === 'number' ? `${trend.value}%` : trend.value}</span>
                    </div>
                )}
            </div>
            <div className="stat-card-body">
                <h3 className="stat-card-title">{title}</h3>
                <p className="stat-card-value">{formatNumber(value)}</p>
            </div>
        </div>
    );
};

const DashboardNew: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await dashboardApi.getStats();
            setData(response.data.data);
        } catch (error) {
            console.error('Erreur lors du chargement du dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container-modern">
                <div className="loading-spinner-modern"></div>
                <p className="loading-text">Chargement du tableau de bord...</p>
            </div>
        );
    }

    const isSuperAdmin = user?.role === 'super_admin';
    const stats = data?.statistiques;

    // Données pour les graphiques
    const mariagesParMoisData = data?.mariagesParMois?.map((item: any) => ({
        name: item.mois,
        mariages: item.total,
        actes: Math.floor(item.total * 0.85), // Simulation
    })) || [];

    const performanceData = [
        { name: 'Lun', value: 45 },
        { name: 'Mar', value: 52 },
        { name: 'Mer', value: 38 },
        { name: 'Jeu', value: 65 },
        { name: 'Ven', value: 58 },
        { name: 'Sam', value: 72 },
        { name: 'Dim', value: 48 },
    ];

    const subscriberGrowthData = [
        { name: 'Jan', value: 120 },
        { name: 'Fév', value: 150 },
        { name: 'Mar', value: 180 },
        { name: 'Avr', value: 220 },
        { name: 'Mai', value: 280 },
        { name: 'Juin', value: 350 },
    ];

    return (
        <div className="dashboard-modern">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Tableau de bord</h1>
                    <p className="dashboard-subtitle">
                        Bienvenue, {user?.fullName} • {new Date().toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
                <div className="dashboard-actions">
                    <select 
                        className="period-selector"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value as any)}
                    >
                        <option value="week">Cette semaine</option>
                        <option value="month">Ce mois</option>
                        <option value="year">Cette année</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {isSuperAdmin ? (
                    <>
                        <StatCard
                            title="Total Mairies"
                            value={stats?.totalMairies || 0}
                            icon={Building2}
                            color="blue"
                            trend={{ value: 12, isPositive: true }}
                        />
                        <StatCard
                            title="Utilisateurs"
                            value={stats?.totalUsers || 0}
                            icon={Users}
                            color="purple"
                            trend={{ value: 8, isPositive: true }}
                        />
                        <StatCard
                            title="Mariages ce mois"
                            value={stats?.mariagesMois || 0}
                            icon={Heart}
                            color="pink"
                            trend={{ value: 15, isPositive: true }}
                        />
                        <StatCard
                            title="Actes générés"
                            value={stats?.totalActes || 0}
                            icon={FileText}
                            color="teal"
                            trend={{ value: 23, isPositive: true }}
                        />
                    </>
                ) : (
                    <>
                        <StatCard
                            title="Mariages ce mois"
                            value={stats?.mariagesMois || 0}
                            icon={Heart}
                            color="pink"
                            trend={{ value: 15, isPositive: true }}
                        />
                        <StatCard
                            title="Actes générés"
                            value={stats?.totalActes || 0}
                            icon={FileText}
                            color="teal"
                            trend={{ value: 23, isPositive: true }}
                        />
                        <StatCard
                            title="En attente"
                            value={stats?.mariagesEnAttente || 0}
                            icon={Calendar}
                            color="orange"
                            trend={{ value: 5, isPositive: false }}
                        />
                        <StatCard
                            title="Validés"
                            value={stats?.mariagesValides || 0}
                            icon={Activity}
                            color="green"
                            trend={{ value: 18, isPositive: true }}
                        />
                    </>
                )}
            </div>

            {/* Charts Grid - 3 graphiques seulement */}
            <div className="charts-grid">
                {/* Mariages par mois - Area Chart */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <h3 className="chart-card-title">Évolution des mariages</h3>
                            <p className="chart-card-subtitle">Nombre de mariages par mois</p>
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <span className="legend-dot" style={{ backgroundColor: '#6366f1' }}></span>
                                <span>Mariages</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
                                <span>Actes</span>
                            </div>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mariagesParMoisData}>
                                <defs>
                                    <linearGradient id="colorMariages" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorActes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#252930" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#6b7280"
                                    style={{ fontSize: '11px' }}
                                />
                                <YAxis 
                                    stroke="#6b7280"
                                    style={{ fontSize: '11px' }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#18181b', 
                                        border: '1px solid #27272a',
                                        borderRadius: '8px',
                                        color: '#f4f4f5'
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="mariages" 
                                    stroke="#6366f1" 
                                    fillOpacity={1} 
                                    fill="url(#colorMariages)"
                                    strokeWidth={2}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="actes" 
                                    stroke="#10b981" 
                                    fillOpacity={1} 
                                    fill="url(#colorActes)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Performance - Bar Chart */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <div>
                            <h3 className="chart-card-title">Performance hebdomadaire</h3>
                            <p className="chart-card-subtitle">Activité des 7 derniers jours</p>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#252930" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#6b7280"
                                    style={{ fontSize: '11px' }}
                                />
                                <YAxis 
                                    stroke="#6b7280"
                                    style={{ fontSize: '11px' }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#18181b', 
                                        border: '1px solid #27272a',
                                        borderRadius: '8px',
                                        color: '#f4f4f5'
                                    }}
                                />
                                <Bar 
                                    dataKey="value" 
                                    fill="#6366f1"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subscriber Growth - Area Chart */}
                <div className="chart-card chart-card-wide">
                    <div className="chart-card-header">
                        <div>
                            <h3 className="chart-card-title">Croissance des inscriptions</h3>
                            <p className="chart-card-subtitle">Nouveaux utilisateurs par mois</p>
                        </div>
                        <div className="chart-stats">
                            <div className="chart-stat">
                                <span className="chart-stat-label">Total</span>
                                <span className="chart-stat-value">1,200</span>
                            </div>
                            <div className="chart-stat">
                                <span className="chart-stat-label">Croissance</span>
                                <span className="chart-stat-value text-green">+25%</span>
                            </div>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={subscriberGrowthData}>
                                <defs>
                                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#252930" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#6b7280"
                                    style={{ fontSize: '11px' }}
                                />
                                <YAxis 
                                    stroke="#6b7280"
                                    style={{ fontSize: '11px' }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#18181b', 
                                        border: '1px solid #27272a',
                                        borderRadius: '8px',
                                        color: '#f4f4f5'
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#10b981" 
                                    fillOpacity={1} 
                                    fill="url(#colorGrowth)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardNew;
