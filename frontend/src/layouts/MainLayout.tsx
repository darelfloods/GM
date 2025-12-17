import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Users,
    Building2,
    MapPin,
    Map,
    Heart,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Bell,
    User as UserIcon,
} from 'lucide-react';
import './MainLayout.css';

const MainLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isSuperAdmin = user?.role === 'super_admin';
    const isAdmin = user?.role === 'admin_mairie' || isSuperAdmin;

    const menuItems = [
        {
            path: '/dashboard',
            icon: LayoutDashboard,
            label: 'Tableau de bord',
            roles: ['super_admin', 'admin_mairie', 'agent', 'consultation'],
        },
        {
            path: '/mariages',
            icon: Heart,
            label: 'Mariages',
            roles: ['super_admin', 'admin_mairie', 'agent', 'consultation'],
        },
        {
            path: '/actes',
            icon: FileText,
            label: 'Actes de Mariage',
            roles: ['super_admin', 'admin_mairie', 'agent', 'consultation'],
        },
        {
            path: '/villes',
            icon: Map,
            label: 'Villes',
            roles: ['super_admin'],
        },
        {
            path: '/arrondissements',
            icon: MapPin,
            label: 'Arrondissements',
            roles: ['super_admin'],
        },
        {
            path: '/mairies',
            icon: Building2,
            label: 'Mairies',
            roles: ['super_admin', 'admin_mairie'],
        },
        {
            path: '/utilisateurs',
            icon: Users,
            label: 'Utilisateurs',
            roles: ['super_admin', 'admin_mairie'],
        },
        {
            path: '/parametres',
            icon: Settings,
            label: 'Paramètres',
            roles: ['super_admin', 'admin_mairie'],
        },
    ];

    const filteredMenu = menuItems.filter((item) =>
        item.roles.includes(user?.role || '')
    );

    return (
        <div className="main-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <div className="logo-icon">
                            <Heart size={24} />
                        </div>
                        {sidebarOpen && <span className="logo-text">Gestion Mariage</span>}
                    </div>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        {filteredMenu.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <item.icon size={20} />
                                    {sidebarOpen && <span>{item.label}</span>}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    {user?.mairie && sidebarOpen && (
                        <div className="mairie-info">
                            <Building2 size={16} />
                            <span>{user.mairie.nom}</span>
                        </div>
                    )}
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        {sidebarOpen && <span>Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`main-content ${sidebarOpen ? '' : 'expanded'}`}>
                {/* Header */}
                <header className="main-header">
                    <div className="header-left">
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu size={24} />
                        </button>
                    </div>

                    <div className="header-right">
                        <button className="notification-btn">
                            <Bell size={20} />
                            <span className="notification-badge">3</span>
                        </button>

                        <div className="user-menu">
                            <button
                                className="user-menu-btn"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                <div className="user-avatar">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.fullName} />
                                    ) : (
                                        <UserIcon size={20} />
                                    )}
                                </div>
                                <div className="user-info">
                                    <span className="user-name">{user?.fullName}</span>
                                    <span className="user-role">
                                        {user?.role === 'super_admin'
                                            ? 'Super Admin'
                                            : user?.role === 'admin_mairie'
                                                ? 'Admin Mairie'
                                                : user?.role === 'agent'
                                                    ? 'Agent'
                                                    : 'Consultation'}
                                    </span>
                                </div>
                                <ChevronDown size={16} />
                            </button>

                            {userMenuOpen && (
                                <div className="user-dropdown">
                                    <NavLink to="/profil" onClick={() => setUserMenuOpen(false)}>
                                        <UserIcon size={16} />
                                        Mon profil
                                    </NavLink>
                                    {isAdmin && (
                                        <NavLink
                                            to="/parametres"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <Settings size={16} />
                                            Paramètres
                                        </NavLink>
                                    )}
                                    <hr />
                                    <button onClick={handleLogout}>
                                        <LogOut size={16} />
                                        Déconnexion
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
