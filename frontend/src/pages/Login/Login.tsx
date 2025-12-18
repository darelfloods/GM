import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import './Login.css';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Identifiants incorrects';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Left Side - Image */}
                <div className="login-visual">
                    <img
                        src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&q=80"
                        alt="Mariage"
                        className="login-image"
                    />
                </div>

                {/* Right Side - Form */}
                <div className="login-form-section">
                    <div className="login-form-container">
                        {/* Logo */}
                        <div className="login-logo">
                            <div className="logo-icon">
                                <Sparkles size={28} />
                            </div>
                            <span>Beam</span>
                        </div>

                        {/* Form Card */}
                        <div className="login-card">
                            <div className="login-header">
                                <h1>Connexion</h1>
                                <p>Accédez à votre espace de gestion</p>
                            </div>

                            {error && (
                                <div className="alert alert-error">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="login-form">
                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">
                                        Adresse email
                                    </label>
                                    <div className="input-wrapper">
                                        <Mail size={18} className="input-icon" />
                                        <input
                                            type="email"
                                            id="email"
                                            className="form-input"
                                            placeholder="vous@exemple.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <div className="label-row">
                                        <label htmlFor="password" className="form-label">
                                            Mot de passe
                                        </label>
                                        <Link to="/forgot-password" className="forgot-link">
                                            Mot de passe oublié ?
                                        </Link>
                                    </div>
                                    <div className="input-wrapper">
                                        <Lock size={18} className="input-icon" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            className="form-input"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={isLoading}
                                >
                                    <span className="btn-loading" style={{ display: isLoading ? 'flex' : 'none' }}>
                                        <span className="spinner"></span>
                                        Connexion...
                                    </span>
                                    <span style={{ display: isLoading ? 'none' : 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        Se connecter
                                        <ArrowRight size={18} />
                                    </span>
                                </button>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="login-footer">
                            <p>© 2024 Système de Gestion des Mariages</p>
                            <p>République du Cameroun</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
