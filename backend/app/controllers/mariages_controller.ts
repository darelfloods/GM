import type { HttpContext } from '@adonisjs/core/http'
import Mariage from '#models/mariage'
import AuditLog from '#models/audit_log'

export default class MariagesController {
    /**
     * Liste des mariages
     */
    async index({ auth, request, response }: HttpContext) {
        const user = auth.user!
        const page = request.input('page', 1)
        const limit = request.input('limit', 20)
        const search = request.input('search', '')
        const statut = request.input('statut', '')
        const dateDebut = request.input('date_debut', '')
        const dateFin = request.input('date_fin', '')

        let query = Mariage.query()
            .preload('mairie')
            .preload('acte')
            .preload('createur')

        // Filtrer par mairie si non super admin
        if (!user.isSuperAdmin()) {
            query = query.where('mairie_id', user.mairieId!)
        } else {
            const mairieId = request.input('mairie_id', '')
            if (mairieId) {
                query = query.where('mairie_id', mairieId)
            }
        }

        // Recherche par nom des époux
        if (search) {
            query = query.where((builder) => {
                builder
                    .whereILike('epoux_nom', `%${search}%`)
                    .orWhereILike('epoux_prenom', `%${search}%`)
                    .orWhereILike('epouse_nom', `%${search}%`)
                    .orWhereILike('epouse_prenom', `%${search}%`)
            })
        }

        // Filtre par statut
        if (statut) {
            query = query.where('statut', statut)
        }

        // Filtre par date
        if (dateDebut) {
            query = query.where('date_mariage', '>=', dateDebut)
        }
        if (dateFin) {
            query = query.where('date_mariage', '<=', dateFin)
        }

        const mariages = await query.orderBy('date_mariage', 'desc').paginate(page, limit)

        return response.ok({
            success: true,
            data: mariages,
        })
    }

    /**
     * Détails d'un mariage
     */
    async show({ auth, params, response }: HttpContext) {
        const user = auth.user!

        const mariage = await Mariage.query()
            .where('id', params.id)
            .preload('mairie')
            .preload('acte')
            .preload('createur')
            .preload('modificateur')
            .first()

        if (!mariage) {
            return response.notFound({
                success: false,
                message: 'Mariage non trouvé',
            })
        }

        // Vérifier les permissions
        if (!user.isSuperAdmin() && mariage.mairieId !== user.mairieId) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        return response.ok({
            success: true,
            data: mariage,
        })
    }

    /**
     * Créer un mariage
     */
    async store({ auth, request, response }: HttpContext) {
        const user = auth.user!

        // Seuls les admins et agents peuvent créer des mariages
        if (user.isConsultation()) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        const formData = request.only([
            'epouxNom',
            'epouxPrenom',
            'epouxDateNaissance',
            'epouxLieuNaissance',
            'epouxNationalite',
            'epouxProfession',
            'epouxAdresse',
            'epouxNomPere',
            'epouxNomMere',
            'epouseNom',
            'epousePrenom',
            'epouseDateNaissance',
            'epouseLieuNaissance',
            'epouseNationalite',
            'epouseProfession',
            'epouseAdresse',
            'epouseNomPere',
            'epouseNomMere',
            'dateMariage',
            'heureMariage',
            'lieuMariage',
            'regimeMatrimonial',
            'temoin1Nom',
            'temoin1Prenom',
            'temoin2Nom',
            'temoin2Prenom',
            'officierNom',
            'officierFonction',
            'observations',
        ])

        // Définir la mairie
        let mairieId: number
        if (user.isSuperAdmin()) {
            mairieId = request.input('mairieId')
            if (!mairieId) {
                return response.badRequest({
                    success: false,
                    message: 'Veuillez spécifier une mairie',
                })
            }
        } else {
            mairieId = user.mairieId!
        }

        const mariage = await Mariage.create({
            ...formData,
            mairieId,
            createdBy: user.id,
            statut: 'brouillon',
        })

        await AuditLog.log({
            userId: user.id,
            mairieId,
            action: 'CREATE',
            entityType: 'Mariage',
            entityId: mariage.id,
            newValues: {
                epoux: `${formData.epouxPrenom} ${formData.epouxNom}`,
                epouse: `${formData.epousePrenom} ${formData.epouseNom}`,
                dateMariage: formData.dateMariage,
            },
            description: `Création du mariage ${formData.epouxPrenom} ${formData.epouxNom} & ${formData.epousePrenom} ${formData.epouseNom}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        await mariage.load('mairie')

        return response.created({
            success: true,
            message: 'Mariage créé avec succès',
            data: mariage,
        })
    }

    /**
     * Mettre à jour un mariage
     */
    async update({ auth, params, request, response }: HttpContext) {
        const user = auth.user!

        if (user.isConsultation()) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        const mariage = await Mariage.find(params.id)

        if (!mariage) {
            return response.notFound({
                success: false,
                message: 'Mariage non trouvé',
            })
        }

        // Vérifier les permissions
        if (!user.isSuperAdmin() && mariage.mairieId !== user.mairieId) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        // Ne pas modifier un mariage validé (sauf super admin)
        if (mariage.statut === 'valide' && !user.isSuperAdmin()) {
            return response.badRequest({
                success: false,
                message: 'Impossible de modifier un mariage validé',
            })
        }

        const oldValues = {
            epoux: mariage.nomCompletEpoux,
            epouse: mariage.nomCompletEpouse,
            dateMariage: mariage.dateMariage,
            statut: mariage.statut,
        }

        const updateData = request.only([
            'epouxNom',
            'epouxPrenom',
            'epouxDateNaissance',
            'epouxLieuNaissance',
            'epouxNationalite',
            'epouxProfession',
            'epouxAdresse',
            'epouxNomPere',
            'epouxNomMere',
            'epouseNom',
            'epousePrenom',
            'epouseDateNaissance',
            'epouseLieuNaissance',
            'epouseNationalite',
            'epouseProfession',
            'epouseAdresse',
            'epouseNomPere',
            'epouseNomMere',
            'dateMariage',
            'heureMariage',
            'lieuMariage',
            'regimeMatrimonial',
            'temoin1Nom',
            'temoin1Prenom',
            'temoin2Nom',
            'temoin2Prenom',
            'officierNom',
            'officierFonction',
            'observations',
            'statut',
        ])

        mariage.merge(updateData)
        mariage.updatedBy = user.id
        await mariage.save()

        await AuditLog.log({
            userId: user.id,
            mairieId: mariage.mairieId,
            action: 'UPDATE',
            entityType: 'Mariage',
            entityId: mariage.id,
            oldValues,
            newValues: {
                epoux: mariage.nomCompletEpoux,
                epouse: mariage.nomCompletEpouse,
                dateMariage: mariage.dateMariage,
                statut: mariage.statut,
            },
            description: `Modification du mariage ${mariage.nomCompletEpoux} & ${mariage.nomCompletEpouse}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        await mariage.load('mairie')

        return response.ok({
            success: true,
            message: 'Mariage modifié avec succès',
            data: mariage,
        })
    }

    /**
     * Supprimer un mariage
     */
    async destroy({ auth, params, request, response }: HttpContext) {
        const user = auth.user!

        // Seuls les admins peuvent supprimer
        if (!user.isSuperAdmin() && !user.isAdminMairie()) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        const mariage = await Mariage.query()
            .where('id', params.id)
            .preload('acte')
            .first()

        if (!mariage) {
            return response.notFound({
                success: false,
                message: 'Mariage non trouvé',
            })
        }

        // Vérifier les permissions
        if (!user.isSuperAdmin() && mariage.mairieId !== user.mairieId) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        // Ne pas supprimer si un acte a été généré
        if (mariage.acte) {
            return response.badRequest({
                success: false,
                message: 'Impossible de supprimer ce mariage car un acte a été généré',
            })
        }

        await AuditLog.log({
            userId: user.id,
            mairieId: mariage.mairieId,
            action: 'DELETE',
            entityType: 'Mariage',
            entityId: mariage.id,
            oldValues: {
                epoux: mariage.nomCompletEpoux,
                epouse: mariage.nomCompletEpouse,
                dateMariage: mariage.dateMariage,
            },
            description: `Suppression du mariage ${mariage.nomCompletEpoux} & ${mariage.nomCompletEpouse}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        await mariage.delete()

        return response.ok({
            success: true,
            message: 'Mariage supprimé avec succès',
        })
    }

    /**
     * Valider un mariage
     */
    async validate({ auth, params, request, response }: HttpContext) {
        const user = auth.user!

        // Seuls les admins peuvent valider
        if (!user.isSuperAdmin() && !user.isAdminMairie()) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        const mariage = await Mariage.find(params.id)

        if (!mariage) {
            return response.notFound({
                success: false,
                message: 'Mariage non trouvé',
            })
        }

        // Vérifier les permissions
        if (!user.isSuperAdmin() && mariage.mairieId !== user.mairieId) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        if (mariage.statut === 'valide') {
            return response.badRequest({
                success: false,
                message: 'Ce mariage est déjà validé',
            })
        }

        mariage.statut = 'valide'
        mariage.updatedBy = user.id
        await mariage.save()

        await AuditLog.log({
            userId: user.id,
            mairieId: mariage.mairieId,
            action: 'VALIDATE',
            entityType: 'Mariage',
            entityId: mariage.id,
            description: `Validation du mariage ${mariage.nomCompletEpoux} & ${mariage.nomCompletEpouse}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        return response.ok({
            success: true,
            message: 'Mariage validé avec succès',
            data: mariage,
        })
    }
}
