import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mariagesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Mariage } from '../../types';
import {
    Plus,
    Search,
    Filter,
    Calendar,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    FileText,
} from 'lucide-react';
import './Mariages.css';

const Mariages: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [mariages, setMariages] = useState<Mariage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const canEdit = user?.role !== 'consultation';
    const canValidate = user?.role === 'super_admin' || user?.role === 'admin_mairie';

    useEffect(() => {
        fetchMariages();
    }, [currentPage, statusFilter]);

    const fetchMariages = async () => {
        setIsLoading(true);
        try {
            const params: any = {
                page: currentPage,
                limit: 10,
            };
            if (searchQuery) params.search = searchQuery;
            if (statusFilter) params.statut = statusFilter;

            const response = await mariagesApi.getAll(params);
            setMariages(response.data.data.data || response.data.data);
            if (response.data.data.meta) {
                setTotalPages(response.data.data.meta.lastPage);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des mariages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchMariages();
    };

    const handleValidate = async (id: number) => {
        if (!window.confirm('Voulez-vous valider ce mariage ?')) return;
        try {
            await mariagesApi.validate(id);
            fetchMariages();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erreur lors de la validation');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce mariage ?')) return;
        try {
            await mariagesApi.delete(id);
            fetchMariages();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const getStatusBadge = (statut: string) => {
        switch (statut) {
            case 'valide':
                return <span className="badge badge-success">Validé</span>;
            case 'brouillon':
                return <span className="badge badge-warning">Brouillon</span>;
            case 'annule':
                return <span className="badge badge-danger">Annulé</span>;
            default:
                return <span className="badge">{statut}</span>;
        }
    };

    return (
        <div className="mariages-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Mariages</h1>
                    <p>Gestion des enregistrements de mariages</p>
                </div>
                {canEdit && (
                    <Link to="/mariages/nouveau" className="btn btn-primary">
                        <Plus size={18} />
                        Nouveau mariage
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="filters-card">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom des époux..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Rechercher
                    </button>
                </form>

                <div className="filters-group">
                    <Filter size={18} />
                    <select
                        className="form-control"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">Tous les statuts</option>
                        <option value="brouillon">Brouillon</option>
                        <option value="valide">Validé</option>
                        <option value="annule">Annulé</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                {isLoading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Époux</th>
                                        <th>Épouse</th>
                                        <th>Date du mariage</th>
                                        <th>Mairie</th>
                                        <th>Statut</th>
                                        <th>Acte</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mariages.map((mariage) => (
                                        <tr key={mariage.id}>
                                            <td>
                                                <div className="person-cell">
                                                    <span className="person-name">
                                                        {mariage.epouxPrenom} {mariage.epouxNom}
                                                    </span>
                                                    <span className="person-info">
                                                        Né le {new Date(mariage.epouxDateNaissance).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="person-cell">
                                                    <span className="person-name">
                                                        {mariage.epousePrenom} {mariage.epouseNom}
                                                    </span>
                                                    <span className="person-info">
                                                        Née le {new Date(mariage.epouseDateNaissance).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="date-cell">
                                                    <Calendar size={14} />
                                                    {new Date(mariage.dateMariage).toLocaleDateString('fr-FR')}
                                                </div>
                                            </td>
                                            <td>{mariage.mairie?.nom || '-'}</td>
                                            <td>{getStatusBadge(mariage.statut)}</td>
                                            <td>
                                                {mariage.acte ? (
                                                    <span className="badge badge-info">
                                                        {mariage.acte.numeroActe}
                                                    </span>
                                                ) : (
                                                    <span className="text-secondary">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-icon btn-outline"
                                                        onClick={() => navigate(`/mariages/${mariage.id}`)}
                                                        title="Voir"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {canEdit && mariage.statut === 'brouillon' && (
                                                        <button
                                                            className="btn btn-icon btn-outline"
                                                            onClick={() => navigate(`/mariages/${mariage.id}/modifier`)}
                                                            title="Modifier"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                    )}
                                                    {canValidate && mariage.statut === 'brouillon' && (
                                                        <button
                                                            className="btn btn-icon btn-outline"
                                                            onClick={() => handleValidate(mariage.id)}
                                                            title="Valider"
                                                            style={{ color: 'var(--accent-green)' }}
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    )}
                                                    {mariage.statut === 'valide' && !mariage.acte && canEdit && (
                                                        <button
                                                            className="btn btn-icon btn-outline"
                                                            onClick={() => navigate(`/actes/generer/${mariage.id}`)}
                                                            title="Générer l'acte"
                                                            style={{ color: 'var(--accent-blue)' }}
                                                        >
                                                            <FileText size={16} />
                                                        </button>
                                                    )}
                                                    {canValidate && mariage.statut === 'brouillon' && !mariage.acte && (
                                                        <button
                                                            className="btn btn-icon btn-outline"
                                                            onClick={() => handleDelete(mariage.id)}
                                                            title="Supprimer"
                                                            style={{ color: 'var(--accent-red)' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {mariages.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center text-secondary">
                                                Aucun mariage trouvé
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn btn-outline btn-sm"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    Précédent
                                </button>
                                <span className="page-info">
                                    Page {currentPage} sur {totalPages}
                                </span>
                                <button
                                    className="btn btn-outline btn-sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    Suivant
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Mariages;
