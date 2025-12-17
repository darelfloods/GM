import type { HttpContext } from '@adonisjs/core/http'
import Mairie from '#models/mairie'
import AuditLog from '#models/audit_log'

export default class MairiesController {
    /**
     * Liste des mairies
     */
    async index({ auth, request, response }: HttpContext) {
        const user = auth.user!
        const page = request.input('page', 1)
        const limit = request.input('limit', 20)
        const search = request.input('search', '')
        const arrondissementId = request.input('arrondissement_id', '')
        const all = request.input('all', false)

        let query = Mairie.query().preload('arrondissement', (q) => q.preload('ville'))

        // Si non super admin, ne montrer que sa mairie
        if (!user.isSuperAdmin()) {
            query = query.where('id', user.mairieId!)
        }

        if (arrondissementId) {
            query = query.where('arrondissement_id', arrondissementId)
        }

        if (search) {
            query = query.whereILike('nom', `%${search}%`)
        }

        // Option pour récupérer toutes les mairies (pour les selects)
        if (all) {
            const mairies = await query.where('is_active', true).orderBy('nom', 'asc')
            return response.ok({
                success: true,
                data: mairies,
            })
        }

        const mairies = await query.orderBy('nom', 'asc').paginate(page, limit)

        return response.ok({
            success: true,
            data: mairies,
        })
    }

    /**
     * Détails d'une mairie
     */
    async show({ auth, params, response }: HttpContext) {
        const user = auth.user!

        const mairie = await Mairie.query()
            .where('id', params.id)
            .preload('arrondissement', (q) => q.preload('ville'))
            .preload('users')
            .first()

        if (!mairie) {
            return response.notFound({
                success: false,
                message: 'Mairie non trouvée',
            })
        }

        // Vérifier les permissions
        if (!user.isSuperAdmin() && user.mairieId !== mairie.id) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        return response.ok({
            success: true,
            data: mairie,
        })
    }

    /**
     * Créer une mairie (Super Admin uniquement)
     */
    async store({ auth, request, response }: HttpContext) {
        const user = auth.user!

        if (!user.isSuperAdmin()) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        const data = request.only([
            'nom',
            'code',
            'arrondissementId',
            'adresse',
            'telephone',
            'email',
            'logo',
            'cachet',
            'langue',
            'prefixeActe',
            'isActive',
        ])

        // Vérifier si le code existe déjà
        if (data.code) {
            const existing = await Mairie.findBy('code', data.code)
            if (existing) {
                return response.badRequest({
                    success: false,
                    message: 'Ce code de mairie existe déjà',
                })
            }
        }

        const mairie = await Mairie.create(data)

        await AuditLog.log({
            userId: user.id,
            action: 'CREATE',
            entityType: 'Mairie',
            entityId: mairie.id,
            newValues: { nom: mairie.nom, code: mairie.code },
            description: `Création de la mairie ${mairie.nom}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        await mairie.load('arrondissement', (q) => q.preload('ville'))

        return response.created({
            success: true,
            message: 'Mairie créée avec succès',
            data: mairie,
        })
    }

    /**
     * Mettre à jour une mairie
     */
    async update({ auth, params, request, response }: HttpContext) {
        const user = auth.user!

        const mairie = await Mairie.find(params.id)

        if (!mairie) {
            return response.notFound({
                success: false,
                message: 'Mairie non trouvée',
            })
        }

        // Vérifier les permissions
        if (!user.isSuperAdmin() && !user.isAdminMairie()) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        if (user.isAdminMairie() && user.mairieId !== mairie.id) {
            return response.forbidden({
                success: false,
                message: 'Vous ne pouvez modifier que votre propre mairie',
            })
        }

        const oldValues = { nom: mairie.nom, code: mairie.code }

        // Les admin mairie ne peuvent modifier que certains champs
        let data
        if (user.isAdminMairie()) {
            data = request.only([
                'adresse',
                'telephone',
                'email',
                'logo',
                'cachet',
                'prefixeActe',
            ])
        } else {
            data = request.only([
                'nom',
                'code',
                'arrondissementId',
                'adresse',
                'telephone',
                'email',
                'logo',
                'cachet',
                'langue',
                'prefixeActe',
                'isActive',
            ])
        }

        // Vérifier si le code existe déjà pour une autre mairie (seulement pour super admin)
        if ('code' in data && data.code && data.code !== mairie.code) {
            const existing = await Mairie.findBy('code', data.code)
            if (existing) {
                return response.badRequest({
                    success: false,
                    message: 'Ce code de mairie existe déjà',
                })
            }
        }

        mairie.merge(data)
        await mairie.save()

        await AuditLog.log({
            userId: user.id,
            mairieId: mairie.id,
            action: 'UPDATE',
            entityType: 'Mairie',
            entityId: mairie.id,
            oldValues,
            newValues: { nom: mairie.nom, code: mairie.code },
            description: `Modification de la mairie ${mairie.nom}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        await mairie.load('arrondissement', (q) => q.preload('ville'))

        return response.ok({
            success: true,
            message: 'Mairie modifiée avec succès',
            data: mairie,
        })
    }

    /**
     * Supprimer une mairie (Super Admin uniquement)
     */
    async destroy({ auth, params, request, response }: HttpContext) {
        const user = auth.user!

        if (!user.isSuperAdmin()) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        const mairie = await Mairie.query()
            .where('id', params.id)
            .preload('users')
            .preload('mariages')
            .first()

        if (!mairie) {
            return response.notFound({
                success: false,
                message: 'Mairie non trouvée',
            })
        }

        // Vérifier s'il y a des utilisateurs ou mariages liés
        if (mairie.users.length > 0) {
            return response.badRequest({
                success: false,
                message: 'Impossible de supprimer cette mairie car elle contient des utilisateurs',
            })
        }

        if (mairie.mariages.length > 0) {
            return response.badRequest({
                success: false,
                message: 'Impossible de supprimer cette mairie car elle contient des mariages',
            })
        }

        await AuditLog.log({
            userId: user.id,
            action: 'DELETE',
            entityType: 'Mairie',
            entityId: mairie.id,
            oldValues: { nom: mairie.nom, code: mairie.code },
            description: `Suppression de la mairie ${mairie.nom}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        await mairie.delete()

        return response.ok({
            success: true,
            message: 'Mairie supprimée avec succès',
        })
    }

    /**
     * Statistiques d'une mairie
     */
    async stats({ auth, params, response }: HttpContext) {
        const user = auth.user!
        const mairieId = params.id

        // Vérifier les permissions
        if (!user.isSuperAdmin() && user.mairieId !== parseInt(mairieId)) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        const mairie = await Mairie.query()
            .where('id', mairieId)
            .withCount('users')
            .withCount('mariages')
            .withCount('actes')
            .first()

        if (!mairie) {
            return response.notFound({
                success: false,
                message: 'Mairie non trouvée',
            })
        }

        return response.ok({
            success: true,
            data: {
                mairie: mairie.nom,
                totalUsers: mairie.$extras.users_count,
                totalMariages: mairie.$extras.mariages_count,
                totalActes: mairie.$extras.actes_count,
            },
        })
    }
}
