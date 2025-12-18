import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';
import {
    User,
    Lock,
    Bell,
    Palette,
    Globe,
    Shield,
    FloppyDisk,
    Eye,
    EyeSlash,
    CheckCircle,
    Moon,
    Sun,
} from 'phosphor-react';
import { useTheme } from '../../contexts/ThemeContext';
import './Parametres.css';

const Parametres: React.FC = () => {
    const { user, updateUser } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

    // États du formulaire profil
    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        telephone: user?.telephone || '',
    });
    const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // États du formulaire mot de passe
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Préférences
    const [notifications, setNotifications] = useState({
        email: true,
        browser: true,
    });

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData({ ...profileData, [name]: value });
        if (profileErrors[name]) {
            setProfileErrors({ ...profileErrors, [name]: '' });
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};

        if (!profileData.fullName.trim()) errors.fullName = 'Le nom complet est requis';
        if (!profileData.email.trim()) {
            errors.email = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
            errors.email = 'Email invalide';
        }

        if (Object.keys(errors).length > 0) {
            setProfileErrors(errors);
            return;
        }

        setIsUpdatingProfile(true);
        try {
            await authApi.updateProfile(profileData);
            if (updateUser) {
                updateUser({ ...user!, fullName: profileData.fullName, email: profileData.email, telephone: profileData.telephone });
            }
            alert('Profil mis à jour avec succès');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
        if (passwordErrors[name]) {
            setPasswordErrors({ ...passwordErrors, [name]: '' });
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};

        if (!passwordData.currentPassword) errors.currentPassword = 'Le mot de passe actuel est requis';
        if (!passwordData.newPassword) {
            errors.newPassword = 'Le nouveau mot de passe est requis';
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await authApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
            alert('Mot de passe modifié avec succès');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
    };

    return (
        <div className="settings-container">
            {/* Sidebar */}
            <aside className="settings-sidebar">
                <div className="sidebar-header">
                    <h1>Paramètres</h1>
                    <p>Gérez votre compte</p>
                </div>

                <nav className="settings-nav">
                    <button
                        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <div className="nav-icon">
                            <User size={20} weight={activeTab === 'profile' ? 'fill' : 'regular'} />
                        </div>
                        <div className="nav-text">
                            <span className="nav-label">Profil</span>
                            <span className="nav-desc">Informations personnelles</span>
                        </div>
                    </button>

                    <button
                        className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <div className="nav-icon">
                            <Lock size={20} weight={activeTab === 'security' ? 'fill' : 'regular'} />
                        </div>
                        <div className="nav-text">
                            <span className="nav-label">Sécurité</span>
                            <span className="nav-desc">Mot de passe</span>
                        </div>
                    </button>

                    <button
                        className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                        onClick={() => setActiveTab('preferences')}
                    >
                        <div className="nav-icon">
                            <Palette size={20} weight={activeTab === 'preferences' ? 'fill' : 'regular'} />
                        </div>
                        <div className="nav-text">
                            <span className="nav-label">Préférences</span>
                            <span className="nav-desc">Thème et notifications</span>
                        </div>
                    </button>
                </nav>

                <div className="sidebar-user">
                    <div className="user-avatar">
                        {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <strong>{user?.fullName}</strong>
                        <span>{user?.email}</span>
                        <span className="user-badge">{user?.role}</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="settings-main">
                {/* PROFIL */}
                {activeTab === 'profile' && (
                    <div className="content-wrapper">
                        <header className="content-header">
                            <h2>Informations du profil</h2>
                            <p>Mettez à jour vos informations personnelles</p>
                        </header>

                        <form onSubmit={handleProfileSubmit} className="settings-form">
                            <div className="form-section">
                                <div className="input-group">
                                    <label>Nom complet <span className="required">*</span></label>
                                    <div className="input-with-icon">
                                        <User size={18} className="input-icon" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={profileData.fullName}
                                            onChange={handleProfileChange}
                                            placeholder="Votre nom complet"
                                            className={profileErrors.fullName ? 'error' : ''}
                                        />
                                    </div>
                                    {profileErrors.fullName && <span className="error-msg">{profileErrors.fullName}</span>}
                                </div>

                                <div className="input-group">
                                    <label>Adresse email <span className="required">*</span></label>
                                    <div className="input-with-icon">
                                        <Globe size={18} className="input-icon" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleProfileChange}
                                            placeholder="votre@email.com"
                                            className={profileErrors.email ? 'error' : ''}
                                        />
                                    </div>
                                    {profileErrors.email && <span className="error-msg">{profileErrors.email}</span>}
                                </div>

                                <div className="input-group">
                                    <label>Téléphone</label>
                                    <div className="input-with-icon">
                                        <Bell size={18} className="input-icon" />
                                        <input
                                            type="tel"
                                            name="telephone"
                                            value={profileData.telephone}
                                            onChange={handleProfileChange}
                                            placeholder="+237 6XX XX XX XX"
                                        />
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="info-card-header">
                                        <Shield size={20} weight="duotone" />
                                        <span>Informations du compte</span>
                                    </div>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-label">Rôle</span>
                                            <span className="info-value">{user?.role}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Mairie</span>
                                            <span className="info-value">{user?.mairie?.nom || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" disabled={isUpdatingProfile}>
                                {isUpdatingProfile ? (
                                    <>
                                        <div className="spinner"></div>
                                        <span>Enregistrement...</span>
                                    </>
                                ) : (
                                    <>
                                        <FloppyDisk size={20} weight="bold" />
                                        <span>Enregistrer les modifications</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* SÉCURITÉ */}
                {activeTab === 'security' && (
                    <div className="content-wrapper">
                        <header className="content-header">
                            <h2>Sécurité du compte</h2>
                            <p>Gérez votre mot de passe et la sécurité</p>
                        </header>

                        <form onSubmit={handlePasswordSubmit} className="settings-form">
                            <div className="form-section single-column">
                                <div className="input-group">
                                    <label>Mot de passe actuel <span className="required">*</span></label>
                                    <div className="input-with-icon">
                                        <Lock size={18} className="input-icon" />
                                        <input
                                            type={showPasswords.current ? 'text' : 'password'}
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="••••••••"
                                            className={passwordErrors.currentPassword ? 'error' : ''}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-btn"
                                            onClick={() => togglePasswordVisibility('current')}
                                        >
                                            {showPasswords.current ? <EyeSlash size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordErrors.currentPassword && <span className="error-msg">{passwordErrors.currentPassword}</span>}
                                </div>

                                <div className="input-group">
                                    <label>Nouveau mot de passe <span className="required">*</span></label>
                                    <div className="input-with-icon">
                                        <Lock size={18} className="input-icon" />
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="••••••••"
                                            className={passwordErrors.newPassword ? 'error' : ''}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-btn"
                                            onClick={() => togglePasswordVisibility('new')}
                                        >
                                            {showPasswords.new ? <EyeSlash size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordErrors.newPassword && <span className="error-msg">{passwordErrors.newPassword}</span>}
                                </div>

                                <div className="input-group">
                                    <label>Confirmer le mot de passe <span className="required">*</span></label>
                                    <div className="input-with-icon">
                                        <Lock size={18} className="input-icon" />
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="••••••••"
                                            className={passwordErrors.confirmPassword ? 'error' : ''}
                                        />
                                        <button
                                            type="button"
                                            className="toggle-btn"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                        >
                                            {showPasswords.confirm ? <EyeSlash size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordErrors.confirmPassword && <span className="error-msg">{passwordErrors.confirmPassword}</span>}
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" disabled={isUpdatingPassword}>
                                {isUpdatingPassword ? (
                                    <>
                                        <div className="spinner"></div>
                                        <span>Modification...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock size={20} weight="bold" />
                                        <span>Modifier le mot de passe</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* PRÉFÉRENCES */}
                {activeTab === 'preferences' && (
                    <div className="content-wrapper">
                        <header className="content-header">
                            <h2>Préférences</h2>
                            <p>Personnalisez votre expérience</p>
                        </header>

                        <div className="preferences-grid">
                            <div className="pref-card">
                                <div className="pref-header">
                                    <div className="pref-icon">
                                        <Palette size={24} weight="duotone" />
                                    </div>
                                    <div>
                                        <h3>Thème de l'interface</h3>
                                        <p>Choisissez entre le mode clair et sombre</p>
                                    </div>
                                </div>
                                <div className="theme-toggle">
                                    <button
                                        className={!isDark ? 'active' : ''}
                                        onClick={() => !isDark || toggleTheme()}
                                    >
                                        <Sun size={18} weight="fill" />
                                        <span>Clair</span>
                                    </button>
                                    <button
                                        className={isDark ? 'active' : ''}
                                        onClick={() => isDark || toggleTheme()}
                                    >
                                        <Moon size={18} weight="fill" />
                                        <span>Sombre</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pref-card">
                                <div className="pref-header">
                                    <div className="pref-icon">
                                        <Bell size={24} weight="duotone" />
                                    </div>
                                    <div>
                                        <h3>Notifications email</h3>
                                        <p>Recevoir des notifications par email</p>
                                    </div>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={notifications.email}
                                        onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="pref-card">
                                <div className="pref-header">
                                    <div className="pref-icon">
                                        <Globe size={24} weight="duotone" />
                                    </div>
                                    <div>
                                        <h3>Notifications navigateur</h3>
                                        <p>Recevoir des notifications dans le navigateur</p>
                                    </div>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={notifications.browser}
                                        onChange={(e) => setNotifications({ ...notifications, browser: e.target.checked })}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Parametres;
