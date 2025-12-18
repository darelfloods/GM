import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersApi, mairiesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
    MagnifyingGlass,
    Plus,
    PencilSimple,
    Trash,
    Eye,
    FunnelSimple,
    Download,
    UserCircle,
} from 'phosphor-react';
import './Utilisateurs.css';

interface User {
    id: number;
    fullName: string;
    email: string;
    role: string;
    isActive: boolean;
    mairieId?: number;
    mairie?: {
        id: number;
        nom: string;
    };
    createdAt: string;
}

interface Mairie {
    id: number;
    nom: string;
}

const Utilisateurs: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [mairies, setMairies] = useState<Mairie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [mairieFilter, setMairieFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 20,
    });

    const isSuperAdmin = currentUser?.role === 'super_admin';

    useEffect(() => {
        fetchUsers();
        if (isSuperAdmin) {
            fetchMairies();
        }
    }, [search, roleFilter, mairieFilter, statusFilter, pagination.currentPage]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const params: any = {
                page: pagination.currentPage,
                limit: pagination.perPage,
            };

            if (search) params.search = search;
            if (roleFilter) params.role = roleFilter;
            if (mairieFilter) params.mairie_id = mairieFilter;
            if (statusFilter) params.is_active = statusFilter;

            const response = await usersApi.getAll(params);
            
            // Vérifier la structure de la réponse
            const responseData = response.data?.data || response.data;
            const usersData = Array.isArray(responseData) ? responseData : responseData?.data || [];
            const meta = responseData?.meta || response.data?.meta;
            
            setUsers(usersData);
            
            if (meta) {
                setPagination({
                    currentPage: meta.current_page || meta.currentPage || 1,
                    lastPage: meta.last_page || meta.lastPage || 1,
                    total: meta.total || 0,
                    perPage: meta.per_page || meta.perPage || 20,
                });
            }
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
            setUsers([]); // Initialiser avec un tableau vide en cas d'erreur
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMairies = async () => {
        try {
            // Utiliser le paramètre 'all' pour récupérer toutes les mairies
            const response = await mairiesApi.getAll({ all: true });
            const mairiesData = response.data?.data || response.data || [];
            setMairies(Array.isArray(mairiesData) ? mairiesData : []);
        } catch (error) {
            console.error('Erreur lors du chargement des mairies:', error);
            setMairies([]);
        }
    };

    const handleDelete = async (userId: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            return;
        }

        try {
            await usersApi.delete(userId);
            fetchUsers();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression de l\'utilisateur');
        }
    };

    const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
        try {
            await usersApi.update(userId, { isActive: !currentStatus });
            fetchUsers();
        } catch (error) {
            console.error('Erreur lors de la modification du statut:', error);
        }
    };

    const getRoleBadge = (role: string) => {
        const badges: Record<string, { label: string; class: string }> = {
            super_admin: { label: 'Super Admin', class: 'badge-super-admin' },
            admin_mairie: { label: 'Admin Mairie', class: 'badge-admin' },
            agent: { label: 'Agent', class: 'badge-agent' },
            consultation: { label: 'Consultation', class: 'badge-consultation' },
        };
        return badges[role] || { label: role, class: 'badge-default' };
    };

    const resetFilters = () => {
        setSearch('');
        setRoleFilter('');
        setMairieFilter('');
        setStatusFilter('');
    };

    if (isLoading && users.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Chargement des utilisateurs...</p>
            </div>
        );
    }

    return (
        <div className="utilisateurs-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Utilisateurs</h1>
                    <p className="page-subtitle">
                        {isSuperAdmin
                            ? 'Gérez tous les utilisateurs du système'
                            : 'Gérez les utilisateurs de votre mairie'}
                    </p>
                </div>
                <Link to="/utilisateurs/nouveau" className="btn-primary">
                    <Plus size={20} weight="bold" />
                    <span>Nouvel utilisateur</span>
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="filters-bar">
                <div className="search-box">
                    <MagnifyingGlass size={18} weight="regular" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <button
                    className={`btn-filter ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <FunnelSimple size={18} weight="regular" />
                    <span>Filtres</span>
                </button>

                <button className="btn-export">
                    <Download size={18} weight="regular" />
                    <span>Exporter</span>
                </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-group">
                        <label>Rôle</label>
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="">Tous les rôles</option>
                            {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                            <option value="admin_mairie">Admin Mairie</option>
                            <option value="agent">Agent</option>
                            <option value="consultation">Consultation</option>
                        </select>
                    </div>

                    {isSuperAdmin && (
                        <div className="filter-group">
                            <label>Mairie</label>
                            <select value={mairieFilter} onChange={(e) => setMairieFilter(e.target.value)}>
                                <option value="">Toutes les mairies</option>
                                {mairies.map((mairie) => (
                                    <option key={mairie.id} value={mairie.id}>
                                        {mairie.nom}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="filter-group">
                        <label>Statut</label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">Tous</option>
                            <option value="true">Actif</option>
                            <option value="false">Inactif</option>
                        </select>
                    </div>

                    <button className="btn-reset" onClick={resetFilters}>
                        Réinitialiser
                    </button>
                </div>
            )}

            {/* Stats */}
            <div className="stats-bar">
                <div className="stat-item">
                    <span className="stat-label">Total</span>
                    <span className="stat-value">{pagination.total}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Actifs</span>
                    <span className="stat-value text-green">
                        {users.filter((u) => u.isActive).length}
                    </span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Inactifs</span>
                    <span className="stat-value text-red">
                        {users.filter((u) => !u.isActive).length}
                    </span>
                </div>
            </div>

            {/* Users Table */}
            <div className="table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Utilisateur</th>
                            <th>Email</th>
                            <th>Rôle</th>
                            {isSuperAdmin && <th>Mairie</th>}
                            <th>Statut</th>
                            <th>Date création</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={isSuperAdmin ? 7 : 6} className="empty-state">
                                    <UserCircle size={48} weight="thin" />
                                    <p>Aucun utilisateur trouvé</p>
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar">
                                                {user.fullName.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="user-name">{user.fullName}</span>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge ${getRoleBadge(user.role).class}`}>
                                            {getRoleBadge(user.role).label}
                                        </span>
                                    </td>
                                    {isSuperAdmin && (
                                        <td>{user.mairie?.nom || '-'}</td>
                                    )}
                                    <td>
                                        <button
                                            className={`status-toggle ${user.isActive ? 'active' : 'inactive'}`}
                                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                                        >
                                            {user.isActive ? 'Actif' : 'Inactif'}
                                        </button>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <Link
                                                to={`/utilisateurs/${user.id}`}
                                                className="btn-action btn-view"
                                                title="Voir"
                                            >
                                                <Eye size={16} weight="regular" />
                                            </Link>
                                            <Link
                                                to={`/utilisateurs/${user.id}/modifier`}
                                                className="btn-action btn-edit"
                                                title="Modifier"
                                            >
                                                <PencilSimple size={16} weight="regular" />
                                            </Link>
                                            <button
                                                className="btn-action btn-delete"
                                                onClick={() => handleDelete(user.id)}
                                                title="Supprimer"
                                            >
                                                <Trash size={16} weight="regular" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.lastPage > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        disabled={pagination.currentPage === 1}
                        onClick={() =>
                            setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })
                        }
                    >
                        Précédent
                    </button>
                    <span className="pagination-info">
                        Page {pagination.currentPage} sur {pagination.lastPage}
                    </span>
                    <button
                        className="pagination-btn"
                        disabled={pagination.currentPage === pagination.lastPage}
                        onClick={() =>
                            setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })
                        }
                    >
                        Suivant
                    </button>
                </div>
            )}
        </div>
    );
};

export default Utilisateurs;
