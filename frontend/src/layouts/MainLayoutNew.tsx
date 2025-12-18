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
    Bell,
    Search,
    User as UserIcon,
    ChevronRight,
} from 'lucide-react';
import './MainLayoutNew.css';

const MainLayoutNew: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
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
            label: 'Actes',
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
        <div className="layout-modern">
            {/* Sidebar */}
            <aside className="sidebar-modern">
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="logo-container">
                        <div className="logo-icon-modern">
                            <Heart size={24} strokeWidth={2.5} />
                        </div>
                        <div className="logo-text-modern">
                            <span className="logo-title">Gestion</span>
                            <span className="logo-subtitle">Mariage</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <span className="nav-section-title">Menu Principal</span>
                        <ul className="nav-list">
                            {filteredMenu.slice(0, 3).map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `nav-item ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        <item.icon size={20} strokeWidth={2} />
                                        <span>{item.label}</span>
                                        <ChevronRight size={16} className="nav-arrow" />
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {isSuperAdmin && (
                        <div className="nav-section">
                            <span className="nav-section-title">Administration</span>
                            <ul className="nav-list">
                                {filteredMenu.slice(3).map((item) => (
                                    <li key={item.path}>
                                        <NavLink
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `nav-item ${isActive ? 'active' : ''}`
                                            }
                                        >
                                            <item.icon size={20} strokeWidth={2} />
                                            <span>{item.label}</span>
                                            <ChevronRight size={16} className="nav-arrow" />
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {isAdmin && !isSuperAdmin && (
                        <div className="nav-section">
                            <span className="nav-section-title">Gestion</span>
                            <ul className="nav-list">
                                {filteredMenu.slice(3).map((item) => (
                                    <li key={item.path}>
                                        <NavLink
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `nav-item ${isActive ? 'active' : ''}`
                                            }
                                        >
                                            <item.icon size={20} strokeWidth={2} />
                                            <span>{item.label}</span>
                                            <ChevronRight size={16} className="nav-arrow" />
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </nav>

                {/* User Profile */}
                <div className="sidebar-footer">
                    <div className="user-profile">
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
                                {user?.role === 'super_admin' && 'Super Admin'}
                                {user?.role === 'admin_mairie' && 'Admin Mairie'}
                                {user?.role === 'agent' && 'Agent'}
                                {user?.role === 'consultation' && 'Consultation'}
                            </span>
                        </div>
                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                            title="Déconnexion"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-content-modern">
                {/* Header */}
                <header className="header-modern">
                    <div className="header-left">
                        <button className="menu-toggle">
                            <Menu size={24} />
                        </button>
                        <div className="search-bar">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="search-input"
                            />
                        </div>
                    </div>
                    <div className="header-right">
                        <button className="header-icon-btn">
                            <Bell size={20} />
                            <span className="notification-badge">3</span>
                        </button>
                        <div className="header-divider"></div>
                        <button
                            className="user-menu-trigger"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            <div className="user-avatar-small">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.fullName} />
                                ) : (
                                    <UserIcon size={16} />
                                )}
                            </div>
                            <span className="user-name-header">{user?.fullName}</span>
                        </button>
                        {userMenuOpen && (
                            <div className="user-dropdown">
                                <NavLink to="/profil" className="dropdown-item">
                                    <UserIcon size={16} />
                                    <span>Mon profil</span>
                                </NavLink>
                                <NavLink to="/parametres" className="dropdown-item">
                                    <Settings size={16} />
                                    <span>Paramètres</span>
                                </NavLink>
                                <div className="dropdown-divider"></div>
                                <button onClick={handleLogout} className="dropdown-item logout">
                                    <LogOut size={16} />
                                    <span>Déconnexion</span>
                                </button>
                            </div>
                        )}
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

export default MainLayoutNew;
