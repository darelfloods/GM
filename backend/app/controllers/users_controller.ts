import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import AuditLog from '#models/audit_log'

export default class UsersController {
    /**
     * Liste des utilisateurs
     * Super Admin: tous les utilisateurs
     * Admin Mairie: utilisateurs de sa mairie uniquement
     */
    async index({ auth, request, response }: HttpContext) {
        const user = auth.user!
        const page = request.input('page', 1)
        const limit = request.input('limit', 20)
        const search = request.input('search', '')
        const role = request.input('role', '')
        const isActive = request.input('is_active', '')

        let query = User.query().preload('mairie')

        // Filtrer par mairie si non super admin
        if (!user.isSuperAdmin()) {
            query = query.where('mairie_id', user.mairieId!)
        } else {
            const mairieId = request.input('mairie_id', '')
            if (mairieId) {
                query = query.where('mairie_id', mairieId)
            }
        }

        // Recherche
        if (search) {
            query = query.where((builder) => {
                builder
                    .whereILike('full_name', `%${search}%`)
                    .orWhereILike('email', `%${search}%`)
            })
        }

        // Filtre par rôle
        if (role) {
            query = query.where('role', role)
        }

        // Filtre par statut
        if (isActive !== '') {
            query = query.where('is_active', isActive === 'true')
        }

        const users = await query.orderBy('created_at', 'desc').paginate(page, limit)

        return response.ok({
            success: true,
            data: users,
        })
    }

    /**
     * Détails d'un utilisateur
     */
    async show({ auth, params, response }: HttpContext) {
        const currentUser = auth.user!
        const user = await User.query()
            .where('id', params.id)
            .preload('mairie')
            .first()

        if (!user) {
            return response.notFound({
                success: false,
                message: 'Utilisateur non trouvé',
            })
        }

        // Vérifier les permissions
        if (!currentUser.isSuperAdmin() && user.mairieId !== currentUser.mairieId) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        return response.ok({
            success: true,
            data: user,
        })
    }

    /**
     * Créer un utilisateur
     */
    async store({ auth, request, response }: HttpContext) {
        const currentUser = auth.user!
        const data = request.only([
            'fullName',
            'email',
            'password',
            'telephone',
            'role',
            'mairieId',
            'isActive',
        ])

        // Validation des rôles
        if (!currentUser.isSuperAdmin()) {
            // Admin mairie ne peut créer que des agents ou consultation
            if (!['agent', 'consultation'].includes(data.role)) {
                return response.forbidden({
                    success: false,
                    message: 'Vous ne pouvez créer que des agents ou utilisateurs en consultation',
                })
            }
            // Forcer la mairie de l'admin
            data.mairieId = currentUser.mairieId
        }

        // Vérifier si l'email existe déjà
        const existingUser = await User.findBy('email', data.email)
        if (existingUser) {
            return response.badRequest({
                success: false,
                message: 'Cet email est déjà utilisé',
            })
        }

        const user = await User.create(data)

        // Log de l'action
        await AuditLog.log({
            userId: currentUser.id,
            mairieId: currentUser.mairieId ?? undefined,
            action: 'CREATE',
            entityType: 'User',
            entityId: user.id,
            newValues: { fullName: user.fullName, email: user.email, role: user.role },
            description: `Création de l'utilisateur ${user.fullName}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        await user.load('mairie')

        return response.created({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: user,
        })
    }

    /**
     * Mettre à jour un utilisateur
     */
    async update({ auth, params, request, response }: HttpContext) {
        const currentUser = auth.user!
        const user = await User.find(params.id)

        if (!user) {
            return response.notFound({
                success: false,
                message: 'Utilisateur non trouvé',
            })
        }

        // Vérifier les permissions
        if (!currentUser.isSuperAdmin() && user.mairieId !== currentUser.mairieId) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        const oldValues = {
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        }

        const data = request.only([
            'fullName',
            'email',
            'telephone',
            'role',
            'mairieId',
            'isActive',
        ])

        // Validation des rôles pour admin mairie
        if (!currentUser.isSuperAdmin()) {
            delete data.mairieId
            if (data.role && !['agent', 'consultation'].includes(data.role)) {
                return response.forbidden({
                    success: false,
                    message: 'Vous ne pouvez attribuer que les rôles agent ou consultation',
                })
            }
        }

        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        if (data.email && data.email !== user.email) {
            const existingUser = await User.findBy('email', data.email)
            if (existingUser) {
                return response.badRequest({
                    success: false,
                    message: 'Cet email est déjà utilisé',
                })
            }
        }

        user.merge(data)
        await user.save()

        // Log de l'action
        await AuditLog.log({
            userId: currentUser.id,
            mairieId: currentUser.mairieId ?? undefined,
            action: 'UPDATE',
            entityType: 'User',
            entityId: user.id,
            oldValues,
            newValues: { fullName: user.fullName, email: user.email, role: user.role },
            description: `Modification de l'utilisateur ${user.fullName}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        await user.load('mairie')

        return response.ok({
            success: true,
            message: 'Utilisateur modifié avec succès',
            data: user,
        })
    }

    /**
     * Supprimer un utilisateur
     */
    async destroy({ auth, params, request, response }: HttpContext) {
        const currentUser = auth.user!
        const user = await User.find(params.id)

        if (!user) {
            return response.notFound({
                success: false,
                message: 'Utilisateur non trouvé',
            })
        }

        // Ne pas permettre de se supprimer soi-même
        if (user.id === currentUser.id) {
            return response.badRequest({
                success: false,
                message: 'Vous ne pouvez pas supprimer votre propre compte',
            })
        }

        // Vérifier les permissions
        if (!currentUser.isSuperAdmin() && user.mairieId !== currentUser.mairieId) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        // Log de l'action avant suppression
        await AuditLog.log({
            userId: currentUser.id,
            mairieId: currentUser.mairieId ?? undefined,
            action: 'DELETE',
            entityType: 'User',
            entityId: user.id,
            oldValues: { fullName: user.fullName, email: user.email, role: user.role },
            description: `Suppression de l'utilisateur ${user.fullName}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        await user.delete()

        return response.ok({
            success: true,
            message: 'Utilisateur supprimé avec succès',
        })
    }

    /**
     * Activer/Désactiver un utilisateur
     */
    async toggleStatus({ auth, params, request, response }: HttpContext) {
        const currentUser = auth.user!
        const user = await User.find(params.id)

        if (!user) {
            return response.notFound({
                success: false,
                message: 'Utilisateur non trouvé',
            })
        }

        // Ne pas permettre de se désactiver soi-même
        if (user.id === currentUser.id) {
            return response.badRequest({
                success: false,
                message: 'Vous ne pouvez pas modifier votre propre statut',
            })
        }

        // Vérifier les permissions
        if (!currentUser.isSuperAdmin() && user.mairieId !== currentUser.mairieId) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        user.isActive = !user.isActive
        await user.save()

        // Log de l'action
        await AuditLog.log({
            userId: currentUser.id,
            mairieId: currentUser.mairieId ?? undefined,
            action: user.isActive ? 'ACTIVATE' : 'DEACTIVATE',
            entityType: 'User',
            entityId: user.id,
            description: `${user.isActive ? 'Activation' : 'Désactivation'} de l'utilisateur ${user.fullName}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        return response.ok({
            success: true,
            message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'} avec succès`,
            data: user,
        })
    }
}
