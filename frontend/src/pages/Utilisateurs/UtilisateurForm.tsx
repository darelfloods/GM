import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usersApi, mairiesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, FloppyDisk, X } from 'phosphor-react';
import './UtilisateurForm.css';

interface Mairie {
    id: number;
    nom: string;
}

const UtilisateurForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const isEditing = Boolean(id);
    const isSuperAdmin = currentUser?.role === 'super_admin';

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'agent',
        mairieId: currentUser?.mairieId || '',
        isActive: true,
    });

    const [mairies, setMairies] = useState<Mairie[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(isEditing);

    useEffect(() => {
        // Toujours charger les mairies pour afficher la liste
        fetchMairies();
        
        if (isEditing) {
            fetchUser();
        }
    }, [id]);

    const fetchMairies = async () => {
        try {
            // Utiliser le paramètre 'all' pour récupérer toutes les mairies sans pagination
            const response = await mairiesApi.getAll({ all: true });
            console.log('Response mairies:', response.data); // Debug
            
            // Gérer différentes structures de réponse
            let mairiesData = [];
            if (response.data?.data) {
                // Si la réponse a une structure { success: true, data: [...] }
                mairiesData = response.data.data;
            } else if (Array.isArray(response.data)) {
                // Si la réponse est directement un tableau
                mairiesData = response.data;
            } else {
                mairiesData = [];
            }
            
            console.log('Mairies chargées:', mairiesData); // Debug
            setMairies(Array.isArray(mairiesData) ? mairiesData : []);
        } catch (error) {
            console.error('Erreur lors du chargement des mairies:', error);
            setMairies([]);
        }
    };

    const fetchUser = async () => {
        try {
            setIsLoadingData(true);
            const response = await usersApi.getById(Number(id));
            const userData = response.data?.data || response.data;
            setFormData({
                fullName: userData.fullName || userData.full_name || '',
                email: userData.email || '',
                password: '',
                confirmPassword: '',
                role: userData.role || 'agent',
                mairieId: userData.mairieId || userData.mairie_id || '',
                isActive: userData.isActive !== undefined ? userData.isActive : userData.is_active !== undefined ? userData.is_active : true,
            });
        } catch (error) {
            console.error('Erreur lors du chargement de l\'utilisateur:', error);
            alert('Erreur lors du chargement des données');
            navigate('/utilisateurs');
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });

        // Clear error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Le nom complet est requis';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email invalide';
        }

        if (!isEditing) {
            if (!formData.password) {
                newErrors.password = 'Le mot de passe est requis';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
            }
        } else {
            // En mode édition, vérifier seulement si un mot de passe est saisi
            if (formData.password && formData.password.length < 6) {
                newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
            }

            if (formData.password && formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
            }
        }

        if (!formData.role) {
            newErrors.role = 'Le rôle est requis';
        }

        if (!isSuperAdmin && !formData.mairieId) {
            newErrors.mairieId = 'La mairie est requise';
        }

        if (isSuperAdmin && formData.role !== 'super_admin' && !formData.mairieId) {
            newErrors.mairieId = 'La mairie est requise pour ce rôle';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const payload: any = {
                fullName: formData.fullName,
                email: formData.email,
                role: formData.role,
                isActive: formData.isActive,
            };

            // Ajouter le mot de passe seulement s'il est renseigné
            if (formData.password) {
                payload.password = formData.password;
            }

            // Ajouter la mairie si nécessaire
            if (formData.role !== 'super_admin') {
                payload.mairieId = Number(formData.mairieId);
            }

            if (isEditing) {
                await usersApi.update(Number(id), payload);
                alert('Utilisateur modifié avec succès');
            } else {
                await usersApi.create(payload);
                alert('Utilisateur créé avec succès');
            }

            navigate('/utilisateurs');
        } catch (error: any) {
            console.error('Erreur lors de la sauvegarde:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la sauvegarde';
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className="utilisateur-form-page">
            {/* Header */}
            <div className="form-header">
                <button className="btn-back" onClick={() => navigate('/utilisateurs')}>
                    <ArrowLeft size={20} weight="regular" />
                    <span>Retour</span>
                </button>
                <h1 className="form-title">
                    {isEditing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="user-form">
                <div className="form-card">
                    <h2 className="section-title">Informations personnelles</h2>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="fullName">
                                Nom complet <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={errors.fullName ? 'error' : ''}
                                placeholder="Ex: Jean Dupont"
                            />
                            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                Email <span className="required">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'error' : ''}
                                placeholder="jean.dupont@example.com"
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="password">
                                Mot de passe {!isEditing && <span className="required">*</span>}
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={errors.password ? 'error' : ''}
                                placeholder={isEditing ? 'Laisser vide pour ne pas modifier' : 'Minimum 6 caractères'}
                            />
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">
                                Confirmer le mot de passe {!isEditing && <span className="required">*</span>}
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={errors.confirmPassword ? 'error' : ''}
                                placeholder="Confirmer le mot de passe"
                            />
                            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                        </div>
                    </div>
                </div>

                <div className="form-card">
                    <h2 className="section-title">Rôle et permissions</h2>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="role">
                                Rôle <span className="required">*</span>
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className={errors.role ? 'error' : ''}
                            >
                                {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                                <option value="admin_mairie">Admin Mairie</option>
                                <option value="agent">Agent</option>
                                <option value="consultation">Consultation</option>
                            </select>
                            {errors.role && <span className="error-message">{errors.role}</span>}
                        </div>

                        {formData.role !== 'super_admin' && (
                            <div className="form-group">
                                <label htmlFor="mairieId">
                                    Mairie <span className="required">*</span>
                                </label>
                                <select
                                    id="mairieId"
                                    name="mairieId"
                                    value={formData.mairieId}
                                    onChange={handleChange}
                                    className={errors.mairieId ? 'error' : ''}
                                    disabled={!isSuperAdmin}
                                >
                                    <option value="">Sélectionner une mairie</option>
                                    {mairies.map((mairie) => (
                                        <option key={mairie.id} value={mairie.id}>
                                            {mairie.nom}
                                        </option>
                                    ))}
                                </select>
                                {errors.mairieId && <span className="error-message">{errors.mairieId}</span>}
                                {mairies.length === 0 && (
                                    <span className="help-text" style={{ color: 'var(--accent-orange)' }}>
                                        Aucune mairie disponible. Veuillez en créer une d'abord.
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                            />
                            <span>Compte actif</span>
                        </label>
                        <p className="help-text">
                            Les utilisateurs inactifs ne peuvent pas se connecter
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => navigate('/utilisateurs')}
                        disabled={isLoading}
                    >
                        <X size={20} weight="regular" />
                        <span>Annuler</span>
                    </button>
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                        <FloppyDisk size={20} weight="regular" />
                        <span>{isLoading ? 'Enregistrement...' : 'Enregistrer'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UtilisateurForm;
