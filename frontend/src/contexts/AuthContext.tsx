import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                // Vérifier si le token est toujours valide
                try {
                    const response = await authApi.me();
                    setUser(response.data.data);
                    localStorage.setItem('user', JSON.stringify(response.data.data));
                } catch {
                    // Token invalide, déconnecter
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            }

            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await authApi.login(email, password);
            
            // Vérifier la structure de la réponse
            if (!response.data || !response.data.data) {
                throw new Error('Réponse invalide du serveur');
            }

            const { user: userData, token: authToken } = response.data.data;

            if (!userData || !authToken) {
                throw new Error('Données de connexion incomplètes');
            }

            setUser(userData);
            setToken(authToken);

            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error: any) {
            // Propager l'erreur originale pour que le composant Login puisse accéder à error.response
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch {
            // Ignorer les erreurs de logout
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
