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
    Calendar,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Chargement du tableau de bord...</p>
            </div>
        );
    }

    const isSuperAdmin = user?.role === 'super_admin';
    const stats = data?.statistiques;

    const statsCards = isSuperAdmin
        ? [
            {
                title: 'Total Mairies',
                value: stats?.totalMairies || 0,
                icon: Building2,
                color: 'blue',
                trend: { value: stats?.totalMairiesActives || 0, label: 'actives', positive: true },
            },
            {
                title: 'Utilisateurs',
                value: stats?.totalUsers || 0,
                icon: Users,
                color: 'purple',
                trend: { value: stats?.totalUsersActifs || 0, label: 'actifs', positive: true },
            },
            {
                title: 'Mariages ce mois',
                value: stats?.mariagesMois || 0,
                icon: Heart,
                color: 'rose',
                trend: { value: '+12%', label: 'vs mois dernier', positive: true },
            },
            {
                title: 'Actes générés',
                value: stats?.totalActes || 0,
                icon: FileText,
                color: 'teal',
                trend: { value: stats?.mariagesAnnee || 0, label: 'cette année', positive: true },
            },
        ]
        : [
            {
                title: 'Mariages ce mois',
                value: stats?.mariagesMois || 0,
                icon: Heart,
                color: 'blue',
                trend: { value: '+8%', label: 'vs mois dernier', positive: true },
            },
            {
                title: 'En attente',
                value: stats?.mariagesBrouillon || 0,
                icon: Clock,
                color: 'amber',
                trend: { value: 3, label: 'à valider', positive: false },
            },
            {
                title: 'Validés',
                value: stats?.mariagesValides || 0,
                icon: TrendingUp,
                color: 'emerald',
                trend: { value: '+15%', label: 'ce mois', positive: true },
            },
            {
                title: 'Actes générés',
                value: stats?.totalActes || 0,
                icon: FileText,
                color: 'teal',
                trend: { value: 12, label: 'ce mois', positive: true },
            },
        ];

    // Données réalistes avec variations naturelles
    const chartData = [
        { name: 'Jan', mariages: 18, actes: 15 },
        { name: 'Fév', mariages: 24, actes: 22 },
        { name: 'Mar', mariages: 19, actes: 18 },
        { name: 'Avr', mariages: 31, actes: 28 },
        { name: 'Mai', mariages: 42, actes: 39 },
        { name: 'Juin', mariages: 56, actes: 52 },
        { name: 'Juil', mariages: 48, actes: 45 },
        { name: 'Août', mariages: 38, actes: 35 },
        { name: 'Sep', mariages: 29, actes: 27 },
        { name: 'Oct', mariages: 35, actes: 32 },
        { name: 'Nov', mariages: 27, actes: 25 },
        { name: 'Déc', mariages: 44, actes: 41 },
    ];

    // Données pour le graphique de performance (barres)
    const performanceData = [
        { name: 'Oct 26', sent: 36, opens: 22, clicks: 32 },
        { name: 'Nov 4', sent: 48, opens: 35, clicks: 28 },
        { name: 'Nov 13', sent: 42, opens: 30, clicks: 25 },
        { name: 'Nov 22', sent: 55, opens: 40, clicks: 35 },
    ];

    // Données pour le graphique de croissance (ligne avec aire)
    const growthData = [
        { name: 'Oct 28', nouveaux: 125, total: 250 },
        { name: 'Nov 4', nouveaux: 180, total: 280 },
        { name: 'Nov 12', nouveaux: 220, total: 320 },
        { name: 'Nov 22', nouveaux: 391, total: 375 },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="chart-tooltip">
                    <p className="tooltip-label">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: <strong>{entry.value}</strong>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="dashboard">
            {/* Page Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>Tableau de bord</h1>
                    <p>Bienvenue, <strong>{user?.fullName}</strong></p>
                </div>
                <Link to="/mariages/nouveau" className="btn-primary-action">
                    <Plus size={20} />
                    Nouveau mariage
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {statsCards.map((stat, index) => (
                    <div key={index} className={`stat-card stat-${stat.color}`}>
                        <div className="stat-header">
                            <div className={`stat-icon-wrapper icon-${stat.color}`}>
                                <stat.icon size={22} />
                            </div>
                            <div className={`stat-trend ${stat.trend.positive ? 'positive' : 'negative'}`}>
                                {stat.trend.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                <span>{stat.trend.value}</span>
                            </div>
                        </div>
                        <div className="stat-body">
                            <span className="stat-value">{stat.value.toLocaleString()}</span>
                            <span className="stat-title">{stat.title}</span>
                        </div>
                        <div className="stat-footer">
                            <span className="trend-label">{stat.trend.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                {/* Area Chart */}
                <div className="chart-card chart-main">
                    <div className="chart-header">
                        <div>
                            <h3>Évolution des mariages</h3>
                            <p>Tendance sur les 12 derniers mois</p>
                        </div>
                        <select className="chart-filter">
                            <option>2024</option>
                            <option>2023</option>
                        </select>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMariages" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorActes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="mariages"
                                    name="Mariages"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorMariages)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="actes"
                                    name="Actes"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorActes)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="chart-legend">
                        <div className="legend-item">
                            <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
                            Mariages enregistrés
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot" style={{ background: '#10b981' }}></span>
                            Actes générés
                        </div>
                    </div>
                </div>

                {/* Performance Bar Chart */}
                <div className="chart-card chart-side">
                    <div className="chart-header">
                        <div>
                            <h3>Performance</h3>
                            <p>Activité mensuelle</p>
                        </div>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="sent" name="Envoyés" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="opens" name="Ouverts" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="clicks" name="Clics" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="chart-legend">
                        <div className="legend-item">
                            <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
                            Envoyés
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot" style={{ background: '#8b5cf6' }}></span>
                            Ouverts
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot" style={{ background: '#06b6d4' }}></span>
                            Clics
                        </div>
                    </div>
                </div>
            </div>

            {/* Second Row of Charts */}
            <div className="charts-section charts-row-2">
                {/* Growth Area Chart */}
                <div className="chart-card chart-growth">
                    <div className="chart-header">
                        <div>
                            <h3>Croissance des mariages</h3>
                            <p>Évolution sur la période</p>
                        </div>
                        <div className="chart-stats">
                            <span className="stat-highlight">391</span>
                            <span className="stat-sub">nouveaux</span>
                        </div>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    name="Total"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorGrowth)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="chart-legend">
                        <div className="legend-item">
                            <span className="legend-dot" style={{ background: '#10b981' }}></span>
                            391 nouveaux
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot" style={{ background: '#94a3b8' }}></span>
                            8 annulés
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
                            383 croissance nette
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="activity-card">
                <div className="activity-header">
                    <div>
                        <h3>Derniers mariages enregistrés</h3>
                        <p>Activité récente de votre mairie</p>
                    </div>
                    <Link to="/mariages" className="btn-link">
                        Voir tout →
                    </Link>
                </div>
                <div className="activity-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Époux</th>
                                <th>Épouse</th>
                                <th>Date du mariage</th>
                                <th>Statut</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.derniersMariages?.length ? (
                                data.derniersMariages.slice(0, 5).map((mariage) => (
                                    <tr key={mariage.id}>
                                        <td>
                                            <span className="person-name">{mariage.epouxPrenom} {mariage.epouxNom}</span>
                                        </td>
                                        <td>
                                            <span className="person-name">{mariage.epousePrenom} {mariage.epouseNom}</span>
                                        </td>
                                        <td>
                                            <div className="date-cell">
                                                <Calendar size={14} />
                                                {new Date(mariage.dateMariage).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${mariage.statut}`}>
                                                {mariage.statut === 'valide' ? 'Validé' :
                                                    mariage.statut === 'brouillon' ? 'Brouillon' : 'Annulé'}
                                            </span>
                                        </td>
                                        <td>
                                            <Link to={`/mariages/${mariage.id}`} className="action-link">
                                                Voir
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="empty-state">
                                        <div className="empty-content">
                                            <Heart size={32} />
                                            <p>Aucun mariage récent</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
