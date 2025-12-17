import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import { Heart, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authApi.forgotPassword(email);
            setIsSubmitted(true);
        } catch (err: any) {
            setError(
                err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-container">
                {/* Left Side - Branding */}
                <div className="forgot-branding">
                    <div className="branding-content">
                        <div className="branding-logo">
                            <Heart size={48} />
                        </div>
                        <h1>Gestion des Actes de Mariage</h1>
                        <p>
                            Récupérez l'accès à votre compte en quelques étapes simples.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="forgot-form-container">
                    <div className="forgot-form-wrapper">
                        <Link to="/login" className="back-link">
                            <ArrowLeft size={20} />
                            Retour à la connexion
                        </Link>

                        {!isSubmitted ? (
                            <>
                                <div className="forgot-header">
                                    <h2>Mot de passe oublié ?</h2>
                                    <p>
                                        Entrez votre adresse email et nous vous enverrons un lien pour
                                        réinitialiser votre mot de passe.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="forgot-form">
                                    {error && (
                                        <div className="alert alert-error">
                                            {error}
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label htmlFor="email" className="form-label">
                                            Adresse email
                                        </label>
                                        <div className="input-with-icon">
                                            <Mail size={20} className="input-icon" />
                                            <input
                                                type="email"
                                                id="email"
                                                className="form-control"
                                                placeholder="Entrez votre email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                autoComplete="email"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-block"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <span className="btn-loading">
                                                <span className="spinner-sm"></span>
                                                Envoi en cours...
                                            </span>
                                        ) : (
                                            'Envoyer le lien de réinitialisation'
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="success-message">
                                <div className="success-icon">
                                    <CheckCircle size={64} />
                                </div>
                                <h2>Email envoyé !</h2>
                                <p>
                                    Si un compte existe avec l'adresse <strong>{email}</strong>,
                                    vous recevrez un email avec les instructions pour réinitialiser
                                    votre mot de passe.
                                </p>
                                <p className="check-spam">
                                    N'oubliez pas de vérifier votre dossier spam.
                                </p>
                                <Link to="/login" className="btn btn-primary btn-block">
                                    Retour à la connexion
                                </Link>
                            </div>
                        )}

                        <div className="forgot-footer">
                            <p>© 2024 Gestion Mariage. Tous droits réservés.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
