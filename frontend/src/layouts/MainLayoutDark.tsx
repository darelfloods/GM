import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    ChartBar,
    Heart,
    FileText,
    MapPin,
    Buildings,
    Users,
    Gear,
    SignOut,
    List,
    MagnifyingGlass,
    Bell,
    UserCircle,
    Moon,
    Sun,
} from 'phosphor-react';
import './MainLayoutDark.css';

const MainLayoutDark: React.FC = () => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isSuperAdmin = user?.role === 'super_admin';

    const menuItems = [
        {
            path: '/dashboard',
            icon: ChartBar,
            label: 'Dashboard',
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
            label: 'Actes',
            roles: ['super_admin', 'admin_mairie', 'agent', 'consultation'],
        },
        {
            path: '/villes',
            icon: MapPin,
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
            icon: Buildings,
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
            icon: Gear,
            label: 'Paramètres',
            roles: ['super_admin', 'admin_mairie'],
        },
    ];

    const filteredMenu = menuItems.filter((item) =>
        item.roles.includes(user?.role || '')
    );

    return (
        <div className="layout-dark">
            {/* Sidebar */}
            <aside className="sidebar-dark">
                {/* Logo */}
                <div className="sidebar-brand">
                    <div className="brand-avatar">
                        {user?.fullName?.charAt(0) || 'M'}
                    </div>
                    <span className="brand-name">GM</span>
                </div>

                {/* Search */}
                <div className="sidebar-search">
                    <MagnifyingGlass size={16} weight="regular" />
                    <input type="text" placeholder="Search..." />
                    <kbd>⌘ K</kbd>
                </div>

                {/* Menu */}
                <div className="sidebar-menu">
                    <span className="menu-label">Menu</span>
                    <nav className="menu-nav">
                        {filteredMenu.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `menu-link ${isActive ? 'active' : ''}`
                                }
                            >
                                <item.icon size={18} weight="regular" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Footer */}
                <div className="sidebar-footer">
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        title={isDark ? 'Mode clair' : 'Mode sombre'}
                    >
                        {isDark ? (
                            <Sun size={18} weight="regular" />
                        ) : (
                            <Moon size={18} weight="regular" />
                        )}
                    </button>
                    <button className="footer-btn" title="Paramètres">
                        <Gear size={18} weight="regular" />
                    </button>
                    <button
                        className="footer-btn logout"
                        onClick={handleLogout}
                        title="Déconnexion"
                    >
                        <SignOut size={18} weight="regular" />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-dark">
                {/* Header */}
                <header className="header-dark">
                    <div className="header-left">
                        <button className="mobile-menu">
                            <List size={20} weight="regular" />
                        </button>
                        <div className="breadcrumb">
                            <span className="breadcrumb-item">Dashboard</span>
                        </div>
                    </div>
                    <div className="header-right">
                        <button className="header-btn">
                            <Bell size={20} weight="regular" />
                            <span className="badge">3</span>
                        </button>
                        <div className="user-menu">
                            <UserCircle size={28} weight="fill" />
                            <div className="user-info">
                                <span className="user-name">{user?.fullName}</span>
                                <span className="user-email">{user?.email}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="content-dark">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayoutDark;
