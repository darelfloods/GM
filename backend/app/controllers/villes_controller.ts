import type { HttpContext } from '@adonisjs/core/http'
import Ville from '#models/ville'
import AuditLog from '#models/audit_log'

export default class VillesController {
    /**
     * Liste des villes
     */
    async index({ request, response }: HttpContext) {
        const page = request.input('page', 1)
        const limit = request.input('limit', 50)
        const search = request.input('search', '')
        const all = request.input('all', false)

        let query = Ville.query().preload('arrondissements')

        if (search) {
            query = query.whereILike('nom', `%${search}%`)
        }

        // Option pour récupérer toutes les villes (pour les selects)
        if (all) {
            const villes = await query.where('is_active', true).orderBy('nom', 'asc')
            return response.ok({
                success: true,
                data: villes,
            })
        }

        const villes = await query.orderBy('nom', 'asc').paginate(page, limit)

        return response.ok({
            success: true,
            data: villes,
        })
    }

    /**
     * Détails d'une ville
     */
    async show({ params, response }: HttpContext) {
        const ville = await Ville.query()
            .where('id', params.id)
            .preload('arrondissements', (query) => {
                query.preload('mairies')
            })
            .first()

        if (!ville) {
            return response.notFound({
                success: false,
                message: 'Ville non trouvée',
            })
        }

        return response.ok({
            success: true,
            data: ville,
        })
    }

    /**
     * Créer une ville
     */
    async store({ auth, request, response }: HttpContext) {
        const user = auth.user!

        // Seul le super admin peut créer des villes
        if (!user.isSuperAdmin()) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        const data = request.only(['nom', 'code', 'region', 'isActive'])

        // Vérifier si le code existe déjà
        if (data.code) {
            const existing = await Ville.findBy('code', data.code)
            if (existing) {
                return response.badRequest({
                    success: false,
                    message: 'Ce code de ville existe déjà',
                })
            }
        }

        const ville = await Ville.create(data)

        await AuditLog.log({
            userId: user.id,
            action: 'CREATE',
            entityType: 'Ville',
            entityId: ville.id,
            newValues: { nom: ville.nom, code: ville.code },
            description: `Création de la ville ${ville.nom}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        return response.created({
            success: true,
            message: 'Ville créée avec succès',
            data: ville,
        })
    }

    /**
     * Mettre à jour une ville
     */
    async update({ auth, params, request, response }: HttpContext) {
        const user = auth.user!

        if (!user.isSuperAdmin()) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        const ville = await Ville.find(params.id)

        if (!ville) {
            return response.notFound({
                success: false,
                message: 'Ville non trouvée',
            })
        }

        const oldValues = { nom: ville.nom, code: ville.code, region: ville.region }
        const data = request.only(['nom', 'code', 'region', 'isActive'])

        // Vérifier si le code existe déjà pour une autre ville
        if (data.code && data.code !== ville.code) {
            const existing = await Ville.findBy('code', data.code)
            if (existing) {
                return response.badRequest({
                    success: false,
                    message: 'Ce code de ville existe déjà',
                })
            }
        }

        ville.merge(data)
        await ville.save()

        await AuditLog.log({
            userId: user.id,
            action: 'UPDATE',
            entityType: 'Ville',
            entityId: ville.id,
            oldValues,
            newValues: { nom: ville.nom, code: ville.code },
            description: `Modification de la ville ${ville.nom}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        return response.ok({
            success: true,
            message: 'Ville modifiée avec succès',
            data: ville,
        })
    }

    /**
     * Supprimer une ville
     */
    async destroy({ auth, params, request, response }: HttpContext) {
        const user = auth.user!

        if (!user.isSuperAdmin()) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        const ville = await Ville.query()
            .where('id', params.id)
            .preload('arrondissements')
            .first()

        if (!ville) {
            return response.notFound({
                success: false,
                message: 'Ville non trouvée',
            })
        }

        // Vérifier s'il y a des arrondissements liés
        if (ville.arrondissements.length > 0) {
            return response.badRequest({
                success: false,
                message: 'Impossible de supprimer cette ville car elle contient des arrondissements',
            })
        }

        await AuditLog.log({
            userId: user.id,
            action: 'DELETE',
            entityType: 'Ville',
            entityId: ville.id,
            oldValues: { nom: ville.nom, code: ville.code },
            description: `Suppression de la ville ${ville.nom}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        await ville.delete()

        return response.ok({
            success: true,
            message: 'Ville supprimée avec succès',
        })
    }
}
