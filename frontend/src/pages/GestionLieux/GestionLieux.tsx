import React, { useState, useEffect } from 'react';
import { villesApi, arrondissementsApi, mairiesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Ville, Arrondissement, Mairie } from '../../types';
import {
    Map,
    MapPin,
    Building2,
    Plus,
    Edit,
    Trash2,
    X,
    Search,
    ChevronRight,
} from 'lucide-react';
import './GestionLieux.css';

type TabType = 'villes' | 'arrondissements' | 'mairies';

const GestionLieux: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('villes');
    const [villes, setVilles] = useState<Ville[]>([]);
    const [arrondissements, setArrondissements] = useState<Arrondissement[]>([]);
    const [mairies, setMairies] = useState<Mairie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    // Filters
    const [selectedVille, setSelectedVille] = useState<number | ''>('');
    const [selectedArrondissement, setSelectedArrondissement] = useState<number | ''>('');

    const isSuperAdmin = user?.role === 'super_admin';

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'villes') {
                const response = await villesApi.getAll({ all: true });
                setVilles(response.data.data);
            } else if (activeTab === 'arrondissements') {
                const [arrResponse, villesResponse] = await Promise.all([
                    arrondissementsApi.getAll({ all: true }),
                    villesApi.getAll({ all: true }),
                ]);
                setArrondissements(arrResponse.data.data);
                setVilles(villesResponse.data.data);
            } else {
                const [mairiesResponse, arrResponse, villesResponse] = await Promise.all([
                    mairiesApi.getAll({ all: true }),
                    arrondissementsApi.getAll({ all: true }),
                    villesApi.getAll({ all: true }),
                ]);
                setMairies(mairiesResponse.data.data);
                setArrondissements(arrResponse.data.data);
                setVilles(villesResponse.data.data);
            }
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingItem(null);
        setFormData(
            activeTab === 'villes'
                ? { nom: '', code: '', region: '' }
                : activeTab === 'arrondissements'
                    ? { nom: '', code: '', villeId: '' }
                    : { nom: '', code: '', arrondissementId: '', adresse: '', telephone: '', email: '', prefixeActe: '' }
        );
        setShowModal(true);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setFormData({ ...item });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

        try {
            if (activeTab === 'villes') {
                await villesApi.delete(id);
            } else if (activeTab === 'arrondissements') {
                await arrondissementsApi.delete(id);
            } else {
                await mairiesApi.delete(id);
            }
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (activeTab === 'villes') {
                if (editingItem) {
                    await villesApi.update(editingItem.id, formData);
                } else {
                    await villesApi.create(formData);
                }
            } else if (activeTab === 'arrondissements') {
                if (editingItem) {
                    await arrondissementsApi.update(editingItem.id, formData);
                } else {
                    await arrondissementsApi.create(formData);
                }
            } else {
                if (editingItem) {
                    await mairiesApi.update(editingItem.id, formData);
                } else {
                    await mairiesApi.create(formData);
                }
            }
            setShowModal(false);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
        }
    };

    const filteredItems = () => {
        let items: any[] = [];

        if (activeTab === 'villes') {
            items = villes;
        } else if (activeTab === 'arrondissements') {
            items = arrondissements.filter(a =>
                !selectedVille || a.villeId === selectedVille
            );
        } else {
            items = mairies.filter(m => {
                if (selectedArrondissement) return m.arrondissementId === selectedArrondissement;
                if (selectedVille) return m.arrondissement?.villeId === selectedVille;
                return true;
            });
        }

        if (searchQuery) {
            items = items.filter(item =>
                item.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.code?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return items;
    };

    const tabs = [
        { id: 'villes' as TabType, label: 'Villes', icon: Map, count: villes.length },
        { id: 'arrondissements' as TabType, label: 'Arrondissements', icon: MapPin, count: arrondissements.length },
        { id: 'mairies' as TabType, label: 'Mairies', icon: Building2, count: mairies.length },
    ];

    return (
        <div className="gestion-lieux">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Gestion des lieux</h1>
                    <p>Gérez les villes, arrondissements et mairies</p>
                </div>
                {isSuperAdmin && (
                    <button className="btn btn-primary" onClick={handleCreate}>
                        <Plus size={18} />
                        Ajouter
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                        <span className="tab-count">{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {activeTab !== 'villes' && (
                    <select
                        className="form-control"
                        value={selectedVille}
                        onChange={(e) => setSelectedVille(e.target.value ? Number(e.target.value) : '')}
                    >
                        <option value="">Toutes les villes</option>
                        {villes.map((v) => (
                            <option key={v.id} value={v.id}>{v.nom}</option>
                        ))}
                    </select>
                )}

                {activeTab === 'mairies' && (
                    <select
                        className="form-control"
                        value={selectedArrondissement}
                        onChange={(e) => setSelectedArrondissement(e.target.value ? Number(e.target.value) : '')}
                    >
                        <option value="">Tous les arrondissements</option>
                        {arrondissements
                            .filter(a => !selectedVille || a.villeId === selectedVille)
                            .map((a) => (
                                <option key={a.id} value={a.id}>{a.nom}</option>
                            ))}
                    </select>
                )}
            </div>

            {/* Content */}
            <div className="card">
                {isLoading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Code</th>
                                    {activeTab === 'villes' && <th>Région</th>}
                                    {activeTab === 'arrondissements' && <th>Ville</th>}
                                    {activeTab === 'mairies' && (
                                        <>
                                            <th>Arrondissement</th>
                                            <th>Téléphone</th>
                                        </>
                                    )}
                                    <th>Statut</th>
                                    {isSuperAdmin && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems().map((item) => (
                                    <tr key={item.id}>
                                        <td className="font-medium">{item.nom}</td>
                                        <td>{item.code || '-'}</td>
                                        {activeTab === 'villes' && <td>{item.region || '-'}</td>}
                                        {activeTab === 'arrondissements' && (
                                            <td>
                                                <span className="location-path">
                                                    {item.ville?.nom || '-'}
                                                </span>
                                            </td>
                                        )}
                                        {activeTab === 'mairies' && (
                                            <>
                                                <td>
                                                    <span className="location-path">
                                                        {item.arrondissement?.ville?.nom}
                                                        <ChevronRight size={14} />
                                                        {item.arrondissement?.nom}
                                                    </span>
                                                </td>
                                                <td>{item.telephone || '-'}</td>
                                            </>
                                        )}
                                        <td>
                                            <span className={`badge ${item.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                {item.isActive ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        {isSuperAdmin && (
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-icon btn-outline"
                                                        onClick={() => handleEdit(item)}
                                                        title="Modifier"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="btn btn-icon btn-outline"
                                                        onClick={() => handleDelete(item.id)}
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {filteredItems().length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="text-center text-secondary">
                                            Aucun élément trouvé
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingItem ? 'Modifier' : 'Ajouter'} {
                                    activeTab === 'villes' ? 'une ville' :
                                        activeTab === 'arrondissements' ? 'un arrondissement' : 'une mairie'
                                }
                            </h3>
                            <button className="btn btn-icon" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Nom *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.nom || ''}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.code || ''}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    />
                                </div>

                                {activeTab === 'villes' && (
                                    <div className="form-group">
                                        <label className="form-label">Région</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.region || ''}
                                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                        />
                                    </div>
                                )}

                                {activeTab === 'arrondissements' && (
                                    <div className="form-group">
                                        <label className="form-label">Ville *</label>
                                        <select
                                            className="form-control form-select"
                                            value={formData.villeId || ''}
                                            onChange={(e) => setFormData({ ...formData, villeId: Number(e.target.value) })}
                                            required
                                        >
                                            <option value="">Sélectionner une ville</option>
                                            {villes.map((v) => (
                                                <option key={v.id} value={v.id}>{v.nom}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {activeTab === 'mairies' && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Arrondissement *</label>
                                            <select
                                                className="form-control form-select"
                                                value={formData.arrondissementId || ''}
                                                onChange={(e) => setFormData({ ...formData, arrondissementId: Number(e.target.value) })}
                                                required
                                            >
                                                <option value="">Sélectionner un arrondissement</option>
                                                {arrondissements.map((a) => (
                                                    <option key={a.id} value={a.id}>{a.ville?.nom} - {a.nom}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label className="form-label">Téléphone</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.telephone || ''}
                                                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={formData.email || ''}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Adresse</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.adresse || ''}
                                                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Préfixe des actes</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.prefixeActe || ''}
                                                onChange={(e) => setFormData({ ...formData, prefixeActe: e.target.value })}
                                                placeholder="Ex: DLA1"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingItem ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionLieux;
