import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mariagesApi, mairiesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Mairie } from '../../types';
import { ArrowLeft, Save, User, Users, Calendar, FileText, Building2 } from 'lucide-react';
import './MariageForm.css';

const MariageForm: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [mairies, setMairies] = useState<Mairie[]>([]);
    const [activeSection, setActiveSection] = useState('epoux');

    const [formData, setFormData] = useState({
        epouxNom: '', epouxPrenom: '', epouxDateNaissance: '', epouxLieuNaissance: '',
        epouxNationalite: 'Camerounaise', epouxProfession: '', epouxAdresse: '',
        epouxNomPere: '', epouxNomMere: '',
        epouseNom: '', epousePrenom: '', epouseDateNaissance: '', epouseLieuNaissance: '',
        epouseNationalite: 'Camerounaise', epouseProfession: '', epouseAdresse: '',
        epouseNomPere: '', epouseNomMere: '',
        dateMariage: '', heureMariage: '', lieuMariage: '',
        regimeMatrimonial: 'Communauté réduite aux acquêts',
        temoin1Nom: '', temoin1Prenom: '', temoin2Nom: '', temoin2Prenom: '',
        officierNom: '', officierFonction: 'Officier d\'état civil',
        observations: '', mairieId: user?.mairieId || '',
    });

    useEffect(() => {
        if (user?.role === 'super_admin') fetchMairies();
        if (isEditing) fetchMariage();
    }, [id]);

    const fetchMairies = async () => {
        try {
            const response = await mairiesApi.getAll({ all: true });
            setMairies(response.data.data);
        } catch (error) {
            console.error('Erreur chargement mairies:', error);
        }
    };

    const fetchMariage = async () => {
        setIsLoading(true);
        try {
            const response = await mariagesApi.getById(Number(id));
            const m = response.data.data;
            setFormData({
                epouxNom: m.epouxNom, epouxPrenom: m.epouxPrenom,
                epouxDateNaissance: m.epouxDateNaissance?.split('T')[0] || '',
                epouxLieuNaissance: m.epouxLieuNaissance,
                epouxNationalite: m.epouxNationalite || '', epouxProfession: m.epouxProfession || '',
                epouxAdresse: m.epouxAdresse || '', epouxNomPere: m.epouxNomPere || '',
                epouxNomMere: m.epouxNomMere || '',
                epouseNom: m.epouseNom, epousePrenom: m.epousePrenom,
                epouseDateNaissance: m.epouseDateNaissance?.split('T')[0] || '',
                epouseLieuNaissance: m.epouseLieuNaissance,
                epouseNationalite: m.epouseNationalite || '', epouseProfession: m.epouseProfession || '',
                epouseAdresse: m.epouseAdresse || '', epouseNomPere: m.epouseNomPere || '',
                epouseNomMere: m.epouseNomMere || '',
                dateMariage: m.dateMariage?.split('T')[0] || '', heureMariage: m.heureMariage || '',
                lieuMariage: m.lieuMariage || '', regimeMatrimonial: m.regimeMatrimonial || '',
                temoin1Nom: m.temoin1Nom || '', temoin1Prenom: m.temoin1Prenom || '',
                temoin2Nom: m.temoin2Nom || '', temoin2Prenom: m.temoin2Prenom || '',
                officierNom: m.officierNom || '', officierFonction: m.officierFonction || '',
                observations: m.observations || '', mairieId: m.mairieId,
            });
        } catch (error) {
            navigate('/mariages');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isEditing) {
                await mariagesApi.update(Number(id), formData);
            } else {
                await mariagesApi.create(formData);
            }
            navigate('/mariages');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const sections = [
        { id: 'epoux', label: 'Époux', icon: User },
        { id: 'epouse', label: 'Épouse', icon: User },
        { id: 'mariage', label: 'Mariage', icon: Calendar },
        { id: 'temoins', label: 'Témoins', icon: Users },
    ];

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="form-page">
            {/* Header */}
            <div className="form-page-header">
                <button className="back-btn" onClick={() => navigate('/mariages')}>
                    <ArrowLeft size={20} />
                </button>
                <div className="header-info">
                    <h1>{isEditing ? 'Modifier le mariage' : 'Nouveau mariage'}</h1>
                    <p>Remplissez les informations des époux et du mariage</p>
                </div>
            </div>

            <div className="form-layout">
                {/* Sidebar Navigation */}
                <aside className="form-sidebar">
                    <nav className="form-nav">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                type="button"
                                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(section.id)}
                            >
                                <section.icon size={18} />
                                <span>{section.label}</span>
                            </button>
                        ))}
                    </nav>

                    {user?.role === 'super_admin' && (
                        <div className="sidebar-mairie">
                            <div className="mairie-label">
                                <Building2 size={16} />
                                Mairie
                            </div>
                            <select
                                name="mairieId"
                                className="mairie-select"
                                value={formData.mairieId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Sélectionner...</option>
                                {mairies.map((m) => (
                                    <option key={m.id} value={m.id}>{m.nom}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </aside>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="form-content">
                    {/* Section Époux */}
                    <section className={`form-section ${activeSection === 'epoux' ? 'active' : ''}`}>
                        <div className="section-header">
                            <div className="section-icon blue"><User size={20} /></div>
                            <div>
                                <h2>Informations de l'époux</h2>
                                <p>Données d'état civil de l'époux</p>
                            </div>
                        </div>

                        <div className="form-card">
                            <div className="field-group">
                                <h3 className="group-title">Identité</h3>
                                <div className="fields-row">
                                    <div className="field">
                                        <label>Nom de famille <span className="required">*</span></label>
                                        <input type="text" name="epouxNom" value={formData.epouxNom} onChange={handleChange} required placeholder="Ex: NGUEMA" />
                                    </div>
                                    <div className="field">
                                        <label>Prénom(s) <span className="required">*</span></label>
                                        <input type="text" name="epouxPrenom" value={formData.epouxPrenom} onChange={handleChange} required placeholder="Ex: Jean Pierre" />
                                    </div>
                                </div>
                                <div className="fields-row">
                                    <div className="field">
                                        <label>Date de naissance <span className="required">*</span></label>
                                        <input type="date" name="epouxDateNaissance" value={formData.epouxDateNaissance} onChange={handleChange} required />
                                    </div>
                                    <div className="field">
                                        <label>Lieu de naissance <span className="required">*</span></label>
                                        <input type="text" name="epouxLieuNaissance" value={formData.epouxLieuNaissance} onChange={handleChange} required placeholder="Ex: Douala" />
                                    </div>
                                </div>
                                <div className="fields-row">
                                    <div className="field">
                                        <label>Nationalité</label>
                                        <input type="text" name="epouxNationalite" value={formData.epouxNationalite} onChange={handleChange} />
                                    </div>
                                    <div className="field">
                                        <label>Profession</label>
                                        <input type="text" name="epouxProfession" value={formData.epouxProfession} onChange={handleChange} placeholder="Ex: Ingénieur" />
                                    </div>
                                </div>
                            </div>

                            <div className="field-group">
                                <h3 className="group-title">Coordonnées & Filiation</h3>
                                <div className="field full-width">
                                    <label>Adresse de résidence</label>
                                    <input type="text" name="epouxAdresse" value={formData.epouxAdresse} onChange={handleChange} placeholder="Ex: Quartier Akwa, Douala" />
                                </div>
                                <div className="fields-row">
                                    <div className="field">
                                        <label>Nom du père</label>
                                        <input type="text" name="epouxNomPere" value={formData.epouxNomPere} onChange={handleChange} placeholder="Nom complet du père" />
                                    </div>
                                    <div className="field">
                                        <label>Nom de la mère</label>
                                        <input type="text" name="epouxNomMere" value={formData.epouxNomMere} onChange={handleChange} placeholder="Nom complet de la mère" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="section-nav">
                            <button type="button" className="btn-next" onClick={() => setActiveSection('epouse')}>
                                Continuer vers Épouse →
                            </button>
                        </div>
                    </section>

                    {/* Section Épouse */}
                    <section className={`form-section ${activeSection === 'epouse' ? 'active' : ''}`}>
                        <div className="section-header">
                            <div className="section-icon rose"><User size={20} /></div>
                            <div>
                                <h2>Informations de l'épouse</h2>
                                <p>Données d'état civil de l'épouse</p>
                            </div>
                        </div>

                        <div className="form-card">
                            <div className="field-group">
                                <h3 className="group-title">Identité</h3>
                                <div className="fields-row">
                                    <div className="field">
                                        <label>Nom de famille <span className="required">*</span></label>
                                        <input type="text" name="epouseNom" value={formData.epouseNom} onChange={handleChange} required placeholder="Ex: MBARGA" />
                                    </div>
                                    <div className="field">
                                        <label>Prénom(s) <span className="required">*</span></label>
                                        <input type="text" name="epousePrenom" value={formData.epousePrenom} onChange={handleChange} required placeholder="Ex: Marie Claire" />
                                    </div>
                                </div>
                                <div className="fields-row">
                                    <div className="field">
                                        <label>Date de naissance <span className="required">*</span></label>
                                        <input type="date" name="epouseDateNaissance" value={formData.epouseDateNaissance} onChange={handleChange} required />
                                    </div>
                                    <div className="field">
                                        <label>Lieu de naissance <span className="required">*</span></label>
                                        <input type="text" name="epouseLieuNaissance" value={formData.epouseLieuNaissance} onChange={handleChange} required placeholder="Ex: Yaoundé" />
                                    </div>
                                </div>
                                <div className="fields-row">
                                    <div className="field">
                                        <label>Nationalité</label>
                                        <input type="text" name="epouseNationalite" value={formData.epouseNationalite} onChange={handleChange} />
                                    </div>
                                    <div className="field">
                                        <label>Profession</label>
                                        <input type="text" name="epouseProfession" value={formData.epouseProfession} onChange={handleChange} placeholder="Ex: Médecin" />
                                    </div>
                                </div>
                            </div>

                            <div className="field-group">
                                <h3 className="group-title">Coordonnées & Filiation</h3>
                                <div className="field full-width">
                                    <label>Adresse de résidence</label>
                                    <input type="text" name="epouseAdresse" value={formData.epouseAdresse} onChange={handleChange} placeholder="Ex: Quartier Bastos, Yaoundé" />
                                </div>
                                <div className="fields-row">
                                    <div className="field">
                                        <label>Nom du père</label>
                                        <input type="text" name="epouseNomPere" value={formData.epouseNomPere} onChange={handleChange} />
                                    </div>
                                    <div className="field">
                                        <label>Nom de la mère</label>
                                        <input type="text" name="epouseNomMere" value={formData.epouseNomMere} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="section-nav">
                            <button type="button" className="btn-prev" onClick={() => setActiveSection('epoux')}>
                                ← Retour
                            </button>
                            <button type="button" className="btn-next" onClick={() => setActiveSection('mariage')}>
                                Continuer vers Mariage →
                            </button>
                        </div>
                    </section>

                    {/* Section Mariage */}
                    <section className={`form-section ${activeSection === 'mariage' ? 'active' : ''}`}>
                        <div className="section-header">
                            <div className="section-icon teal"><Calendar size={20} /></div>
                            <div>
                                <h2>Détails du mariage</h2>
                                <p>Date, lieu et régime matrimonial</p>
                            </div>
                        </div>

                        <div className="form-card">
                            <div className="field-group">
                                <h3 className="group-title">Date et Lieu</h3>
                                <div className="fields-row three-cols">
                                    <div className="field">
                                        <label>Date du mariage <span className="required">*</span></label>
                                        <input type="date" name="dateMariage" value={formData.dateMariage} onChange={handleChange} required />
                                    </div>
                                    <div className="field">
                                        <label>Heure</label>
                                        <input type="time" name="heureMariage" value={formData.heureMariage} onChange={handleChange} />
                                    </div>
                                    <div className="field">
                                        <label>Lieu de célébration</label>
                                        <input type="text" name="lieuMariage" value={formData.lieuMariage} onChange={handleChange} placeholder="Ex: Mairie de Douala 1er" />
                                    </div>
                                </div>
                            </div>

                            <div className="field-group">
                                <h3 className="group-title">Régime Matrimonial</h3>
                                <div className="field full-width">
                                    <label>Régime choisi par les époux</label>
                                    <select name="regimeMatrimonial" value={formData.regimeMatrimonial} onChange={handleChange}>
                                        <option value="Communauté réduite aux acquêts">Communauté réduite aux acquêts</option>
                                        <option value="Séparation de biens">Séparation de biens</option>
                                        <option value="Communauté universelle">Communauté universelle</option>
                                        <option value="Participation aux acquêts">Participation aux acquêts</option>
                                    </select>
                                </div>
                            </div>

                            <div className="field-group">
                                <h3 className="group-title">Observations</h3>
                                <div className="field full-width">
                                    <label>Notes additionnelles</label>
                                    <textarea
                                        name="observations"
                                        value={formData.observations}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Mentions particulières ou observations..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="section-nav">
                            <button type="button" className="btn-prev" onClick={() => setActiveSection('epouse')}>
                                ← Retour
                            </button>
                            <button type="button" className="btn-next" onClick={() => setActiveSection('temoins')}>
                                Continuer vers Témoins →
                            </button>
                        </div>
                    </section>

                    {/* Section Témoins */}
                    <section className={`form-section ${activeSection === 'temoins' ? 'active' : ''}`}>
                        <div className="section-header">
                            <div className="section-icon purple"><Users size={20} /></div>
                            <div>
                                <h2>Témoins et Officier</h2>
                                <p>Personnes présentes lors de la cérémonie</p>
                            </div>
                        </div>

                        <div className="form-card">
                            <div className="field-group">
                                <h3 className="group-title">Premier Témoin</h3>
                                <div className="fields-row">
                                    <div className="field">
                                        <label>Nom</label>
                                        <input type="text" name="temoin1Nom" value={formData.temoin1Nom} onChange={handleChange} placeholder="Nom du témoin" />
                                    </div>
                                    <div className="field">
                                        <label>Prénom</label>
                                        <input type="text" name="temoin1Prenom" value={formData.temoin1Prenom} onChange={handleChange} placeholder="Prénom du témoin" />
                                    </div>
                                </div>
                            </div>

                            <div className="field-group">
                                <h3 className="group-title">Second Témoin</h3>
                                <div className="fields-row">
                                    <div className="field">
                                        <label>Nom</label>
                                        <input type="text" name="temoin2Nom" value={formData.temoin2Nom} onChange={handleChange} placeholder="Nom du témoin" />
                                    </div>
                                    <div className="field">
                                        <label>Prénom</label>
                                        <input type="text" name="temoin2Prenom" value={formData.temoin2Prenom} onChange={handleChange} placeholder="Prénom du témoin" />
                                    </div>
                                </div>
                            </div>

                            <div className="field-group">
                                <h3 className="group-title">Officier d'État Civil</h3>
                                <div className="fields-row">
                                    <div className="field">
                                        <label>Nom de l'officier</label>
                                        <input type="text" name="officierNom" value={formData.officierNom} onChange={handleChange} placeholder="Nom de l'officier" />
                                    </div>
                                    <div className="field">
                                        <label>Fonction</label>
                                        <input type="text" name="officierFonction" value={formData.officierFonction} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => navigate('/mariages')}>
                                Annuler
                            </button>
                            <button type="submit" className="btn-save" disabled={isSaving}>
                                <Save size={18} />
                                {isSaving ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Enregistrer le mariage'}
                            </button>
                        </div>
                    </section>
                </form>
            </div>
        </div>
    );
};

export default MariageForm;
