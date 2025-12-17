import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import AuditLog from '#models/audit_log'

export default class AuthController {
    /**
     * Connexion d'un utilisateur
     */
    async login({ request, response }: HttpContext) {
        const { email, password } = request.only(['email', 'password'])

        try {
            const user = await User.verifyCredentials(email, password)

            if (!user.isActive) {
                return response.unauthorized({
                    success: false,
                    message: 'Votre compte a été désactivé. Veuillez contacter un administrateur.',
                })
            }

            // Générer le token d'accès
            const token = await User.accessTokens.create(user, ['*'], {
                expiresIn: '7 days',
            })

            // Mettre à jour la date de dernière connexion
            user.lastLoginAt = DateTime.now()
            await user.save()

            // Log de l'action
            await AuditLog.log({
                userId: user.id,
                mairieId: user.mairieId ?? undefined,
                action: 'LOGIN',
                entityType: 'User',
                entityId: user.id,
                description: `Connexion de l'utilisateur ${user.fullName}`,
                ipAddress: request.ip(),
                userAgent: request.header('user-agent'),
            })

            // Charger la mairie si elle existe
            if (user.mairieId) {
                await user.load('mairie')
            }

            return response.ok({
                success: true,
                message: 'Connexion réussie',
                data: {
                    user: {
                        id: user.id,
                        fullName: user.fullName,
                        email: user.email,
                        role: user.role,
                        mairie: user.mairie ?? null,
                    },
                    token: token.value!.release(),
                },
            })
        } catch {
            return response.unauthorized({
                success: false,
                message: 'Email ou mot de passe incorrect',
            })
        }
    }

    /**
     * Déconnexion
     */
    async logout({ auth, response, request }: HttpContext) {
        const user = auth.user!

        // Supprimer le token actuel
        await User.accessTokens.delete(user, user.currentAccessToken.identifier)

        // Log de l'action
        await AuditLog.log({
            userId: user.id,
            mairieId: user.mairieId ?? undefined,
            action: 'LOGOUT',
            entityType: 'User',
            entityId: user.id,
            description: `Déconnexion de l'utilisateur ${user.fullName}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        return response.ok({
            success: true,
            message: 'Déconnexion réussie',
        })
    }

    /**
     * Récupérer l'utilisateur connecté
     */
    async me({ auth, response }: HttpContext) {
        const user = auth.user!

        if (user.mairieId) {
            await user.load('mairie')
        }

        return response.ok({
            success: true,
            data: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                telephone: user.telephone,
                role: user.role,
                avatar: user.avatar,
                mairie: user.mairie ?? null,
                lastLoginAt: user.lastLoginAt,
            },
        })
    }

    /**
     * Demande de réinitialisation du mot de passe
     */
    async forgotPassword({ request, response }: HttpContext) {
        const { email } = request.only(['email'])

        const user = await User.findBy('email', email)

        if (!user) {
            // Ne pas révéler si l'email existe ou non
            return response.ok({
                success: true,
                message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
            })
        }

        // TODO: Implémenter l'envoi d'email de réinitialisation
        // Générer un token de réinitialisation et l'envoyer par email

        await AuditLog.log({
            userId: user.id,
            mairieId: user.mairieId ?? undefined,
            action: 'PASSWORD_RESET_REQUEST',
            entityType: 'User',
            entityId: user.id,
            description: `Demande de réinitialisation de mot de passe pour ${user.email}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        return response.ok({
            success: true,
            message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
        })
    }

    /**
     * Changer le mot de passe
     */
    async changePassword({ auth, request, response }: HttpContext) {
        const user = auth.user!
        const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword'])

        // Vérifier le mot de passe actuel
        try {
            await User.verifyCredentials(user.email, currentPassword)
        } catch {
            return response.badRequest({
                success: false,
                message: 'Le mot de passe actuel est incorrect',
            })
        }

        // Mettre à jour le mot de passe
        user.password = newPassword
        await user.save()

        // Log de l'action
        await AuditLog.log({
            userId: user.id,
            mairieId: user.mairieId ?? undefined,
            action: 'PASSWORD_CHANGE',
            entityType: 'User',
            entityId: user.id,
            description: `Changement de mot de passe pour ${user.fullName}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        return response.ok({
            success: true,
            message: 'Mot de passe modifié avec succès',
        })
    }
}
