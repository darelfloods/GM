// Types pour l'authentification
export interface User {
    id: number;
    fullName: string;
    email: string;
    telephone?: string;
    role: 'super_admin' | 'admin_mairie' | 'agent' | 'consultation';
    avatar?: string;
    mairieId?: number;
    mairie?: Mairie;
    isActive: boolean;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
}

// Types pour les entités géographiques
export interface Ville {
    id: number;
    nom: string;
    code?: string;
    region?: string;
    isActive: boolean;
    arrondissements?: Arrondissement[];
    createdAt: string;
    updatedAt: string;
}

export interface Arrondissement {
    id: number;
    nom: string;
    code?: string;
    villeId: number;
    ville?: Ville;
    isActive: boolean;
    mairies?: Mairie[];
    createdAt: string;
    updatedAt: string;
}

export interface Mairie {
    id: number;
    nom: string;
    code?: string;
    arrondissementId?: number;
    arrondissement?: Arrondissement;
    adresse?: string;
    telephone?: string;
    email?: string;
    logo?: string;
    cachet?: string;
    langue: string;
    prefixeActe?: string;
    dernierNumeroActe: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Types pour les mariages
export interface Mariage {
    id: number;
    mairieId: number;
    mairie?: Mairie;
    epouxNom: string;
    epouxPrenom: string;
    epouxDateNaissance: string;
    epouxLieuNaissance: string;
    epouxNationalite?: string;
    epouxProfession?: string;
    epouxAdresse?: string;
    epouxNomPere?: string;
    epouxNomMere?: string;
    epouseNom: string;
    epousePrenom: string;
    epouseDateNaissance: string;
    epouseLieuNaissance: string;
    epouseNationalite?: string;
    epouseProfession?: string;
    epouseAdresse?: string;
    epouseNomPere?: string;
    epouseNomMere?: string;
    dateMariage: string;
    heureMariage?: string;
    lieuMariage?: string;
    regimeMatrimonial: string;
    temoin1Nom?: string;
    temoin1Prenom?: string;
    temoin2Nom?: string;
    temoin2Prenom?: string;
    officierNom?: string;
    officierFonction?: string;
    statut: 'brouillon' | 'valide' | 'annule';
    observations?: string;
    acte?: ActeMariage;
    createur?: User;
    createdAt: string;
    updatedAt: string;
}

export interface ActeMariage {
    id: number;
    mariageId: number;
    mairieId: number;
    numeroActe: string;
    annee: number;
    numeroOrdre: number;
    contenu?: string;
    fichierPdf?: string;
    statut: 'brouillon' | 'valide' | 'imprime' | 'annule';
    dateValidation?: string;
    createdAt: string;
    updatedAt: string;
}

// Types pour le dashboard
export interface DashboardStats {
    totalMairies?: number;
    totalMairiesActives?: number;
    totalUsers?: number;
    totalUsersActifs?: number;
    totalMariages?: number;
    totalActes?: number;
    mariagesMois?: number;
    mariagesAnnee?: number;
    mariagesBrouillon?: number;
    mariagesValides?: number;
    mesMariages?: number;
}

export interface DashboardData {
    role: string;
    mairie?: Mairie;
    statistiques: DashboardStats;
    derniersMariages?: Mariage[];
    statsMairies?: Array<{
        id: number;
        nom: string;
        totalMariages: number;
        totalUsers: number;
    }>;
    activitesRecentes?: AuditLog[];
    mariagesRecents?: Mariage[];
    mariagesEnAttente?: Mariage[];
    utilisateursActifs?: User[];
}

export interface AuditLog {
    id: number;
    userId?: number;
    mairieId?: number;
    action: string;
    entityType: string;
    entityId?: number;
    description?: string;
    user?: User;
    createdAt: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        perPage: number;
        currentPage: number;
        lastPage: number;
        firstPage: number;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
}
