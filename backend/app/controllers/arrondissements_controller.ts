import type { HttpContext } from '@adonisjs/core/http'
import Arrondissement from '#models/arrondissement'
import AuditLog from '#models/audit_log'

export default class ArrondissementsController {
    /**
     * Liste des arrondissements
     */
    async index({ request, response }: HttpContext) {
        const page = request.input('page', 1)
        const limit = request.input('limit', 50)
        const search = request.input('search', '')
        const villeId = request.input('ville_id', '')
        const all = request.input('all', false)

        let query = Arrondissement.query().preload('ville').preload('mairies')

        if (villeId) {
            query = query.where('ville_id', villeId)
        }

        if (search) {
            query = query.whereILike('nom', `%${search}%`)
        }

        // Option pour récupérer tous les arrondissements (pour les selects)
        if (all) {
            const arrondissements = await query.where('is_active', true).orderBy('nom', 'asc')
            return response.ok({
                success: true,
                data: arrondissements,
            })
        }

        const arrondissements = await query.orderBy('nom', 'asc').paginate(page, limit)

        return response.ok({
            success: true,
            data: arrondissements,
        })
    }

    /**
     * Détails d'un arrondissement
     */
    async show({ params, response }: HttpContext) {
        const arrondissement = await Arrondissement.query()
            .where('id', params.id)
            .preload('ville')
            .preload('mairies')
            .first()

        if (!arrondissement) {
            return response.notFound({
                success: false,
                message: 'Arrondissement non trouvé',
            })
        }

        return response.ok({
            success: true,
            data: arrondissement,
        })
    }

    /**
     * Créer un arrondissement
     */
    async store({ auth, request, response }: HttpContext) {
        const user = auth.user!

        if (!user.isSuperAdmin()) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        const data = request.only(['nom', 'code', 'villeId', 'isActive'])

        const arrondissement = await Arrondissement.create(data)

        await AuditLog.log({
            userId: user.id,
            action: 'CREATE',
            entityType: 'Arrondissement',
            entityId: arrondissement.id,
            newValues: { nom: arrondissement.nom, code: arrondissement.code },
            description: `Création de l'arrondissement ${arrondissement.nom}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        await arrondissement.load('ville')

        return response.created({
            success: true,
            message: 'Arrondissement créé avec succès',
            data: arrondissement,
        })
    }

    /**
     * Mettre à jour un arrondissement
     */
    async update({ auth, params, request, response }: HttpContext) {
        const user = auth.user!

        if (!user.isSuperAdmin()) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        const arrondissement = await Arrondissement.find(params.id)

        if (!arrondissement) {
            return response.notFound({
                success: false,
                message: 'Arrondissement non trouvé',
            })
        }

        const oldValues = { nom: arrondissement.nom, code: arrondissement.code }
        const data = request.only(['nom', 'code', 'villeId', 'isActive'])

        arrondissement.merge(data)
        await arrondissement.save()

        await AuditLog.log({
            userId: user.id,
            action: 'UPDATE',
            entityType: 'Arrondissement',
            entityId: arrondissement.id,
            oldValues,
            newValues: { nom: arrondissement.nom, code: arrondissement.code },
            description: `Modification de l'arrondissement ${arrondissement.nom}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        await arrondissement.load('ville')

        return response.ok({
            success: true,
            message: 'Arrondissement modifié avec succès',
            data: arrondissement,
        })
    }

    /**
     * Supprimer un arrondissement
     */
    async destroy({ auth, params, request, response }: HttpContext) {
        const user = auth.user!

        if (!user.isSuperAdmin()) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        const arrondissement = await Arrondissement.query()
            .where('id', params.id)
            .preload('mairies')
            .first()

        if (!arrondissement) {
            return response.notFound({
                success: false,
                message: 'Arrondissement non trouvé',
            })
        }

        // Vérifier s'il y a des mairies liées
        if (arrondissement.mairies.length > 0) {
            return response.badRequest({
                success: false,
                message: 'Impossible de supprimer cet arrondissement car il contient des mairies',
            })
        }

        await AuditLog.log({
            userId: user.id,
            action: 'DELETE',
            entityType: 'Arrondissement',
            entityId: arrondissement.id,
            oldValues: { nom: arrondissement.nom, code: arrondissement.code },
            description: `Suppression de l'arrondissement ${arrondissement.nom}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        await arrondissement.delete()

        return response.ok({
            success: true,
            message: 'Arrondissement supprimé avec succès',
        })
    }
}
