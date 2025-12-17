import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ActeMariage from '#models/acte_mariage'
import Mariage from '#models/mariage'
import Mairie from '#models/mairie'
import AuditLog from '#models/audit_log'

export default class ActesMariageController {
    /**
     * Liste des actes de mariage
     */
    async index({ auth, request, response }: HttpContext) {
        const user = auth.user!
        const page = request.input('page', 1)
        const limit = request.input('limit', 20)
        const search = request.input('search', '')
        const statut = request.input('statut', '')
        const annee = request.input('annee', '')

        let query = ActeMariage.query()
            .preload('mairie')
            .preload('mariage')
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

        // Recherche par numéro d'acte
        if (search) {
            query = query.whereILike('numero_acte', `%${search}%`)
        }

        // Filtre par statut
        if (statut) {
            query = query.where('statut', statut)
        }

        // Filtre par année
        if (annee) {
            query = query.where('annee', annee)
        }

        const actes = await query.orderBy('created_at', 'desc').paginate(page, limit)

        return response.ok({
            success: true,
            data: actes,
        })
    }

    /**
     * Détails d'un acte
     */
    async show({ auth, params, response }: HttpContext) {
        const user = auth.user!

        const acte = await ActeMariage.query()
            .where('id', params.id)
            .preload('mairie')
            .preload('mariage')
            .preload('createur')
            .preload('validateur')
            .first()

        if (!acte) {
            return response.notFound({
                success: false,
                message: 'Acte non trouvé',
            })
        }

        // Vérifier les permissions
        if (!user.isSuperAdmin() && acte.mairieId !== user.mairieId) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        return response.ok({
            success: true,
            data: acte,
        })
    }

    /**
     * Générer un acte de mariage
     */
    async generate({ auth, request, response }: HttpContext) {
        const user = auth.user!

        if (user.isConsultation()) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        const mariageId = request.input('mariageId')

        const mariage = await Mariage.query()
            .where('id', mariageId)
            .preload('mairie')
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

        // Vérifier si un acte existe déjà
        if (mariage.acte) {
            return response.badRequest({
                success: false,
                message: 'Un acte existe déjà pour ce mariage',
                data: mariage.acte,
            })
        }

        // Le mariage doit être validé pour générer un acte
        if (mariage.statut !== 'valide') {
            return response.badRequest({
                success: false,
                message: 'Le mariage doit être validé avant de générer un acte',
            })
        }

        // Générer le numéro d'acte
        const annee = DateTime.now().year
        const mairie = await Mairie.find(mariage.mairieId)
        if (!mairie) {
            return response.notFound({
                success: false,
                message: 'Mairie non trouvée',
            })
        }

        const { numero, numeroOrdre } = await mairie.genererNumeroActe(annee)

        // Générer le contenu de l'acte
        const contenu = this.genererContenuActe(mariage, mairie, numero)

        const acte = await ActeMariage.create({
            mariageId: mariage.id,
            mairieId: mariage.mairieId,
            numeroActe: numero,
            annee,
            numeroOrdre,
            contenu,
            statut: 'brouillon',
            createdBy: user.id,
        })

        await AuditLog.log({
            userId: user.id,
            mairieId: mariage.mairieId,
            action: 'CREATE',
            entityType: 'ActeMariage',
            entityId: acte.id,
            newValues: { numeroActe: numero, mariageId: mariage.id },
            description: `Génération de l'acte de mariage n°${numero}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        await acte.load('mariage')
        await acte.load('mairie')

        return response.created({
            success: true,
            message: 'Acte de mariage généré avec succès',
            data: acte,
        })
    }

    /**
     * Valider un acte
     */
    async validate({ auth, params, request, response }: HttpContext) {
        const user = auth.user!

        if (!user.isSuperAdmin() && !user.isAdminMairie()) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        const acte = await ActeMariage.find(params.id)

        if (!acte) {
            return response.notFound({
                success: false,
                message: 'Acte non trouvé',
            })
        }

        // Vérifier les permissions
        if (!user.isSuperAdmin() && acte.mairieId !== user.mairieId) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        if (acte.statut === 'valide' || acte.statut === 'imprime') {
            return response.badRequest({
                success: false,
                message: 'Cet acte est déjà validé',
            })
        }

        acte.statut = 'valide'
        acte.dateValidation = DateTime.now()
        acte.validePar = user.id
        acte.updatedBy = user.id
        await acte.save()

        await AuditLog.log({
            userId: user.id,
            mairieId: acte.mairieId,
            action: 'VALIDATE',
            entityType: 'ActeMariage',
            entityId: acte.id,
            description: `Validation de l'acte de mariage n°${acte.numeroActe}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        return response.ok({
            success: true,
            message: 'Acte validé avec succès',
            data: acte,
        })
    }

    /**
     * Marquer comme imprimé
     */
    async markPrinted({ auth, params, request, response }: HttpContext) {
        const user = auth.user!

        const acte = await ActeMariage.find(params.id)

        if (!acte) {
            return response.notFound({
                success: false,
                message: 'Acte non trouvé',
            })
        }

        // Vérifier les permissions
        if (!user.isSuperAdmin() && acte.mairieId !== user.mairieId) {
            return response.forbidden({
                success: false,
                message: 'Accès non autorisé',
            })
        }

        if (acte.statut !== 'valide') {
            return response.badRequest({
                success: false,
                message: 'L\'acte doit être validé avant d\'être imprimé',
            })
        }

        acte.statut = 'imprime'
        acte.updatedBy = user.id
        await acte.save()

        await AuditLog.log({
            userId: user.id,
            mairieId: acte.mairieId,
            action: 'PRINT',
            entityType: 'ActeMariage',
            entityId: acte.id,
            description: `Impression de l'acte de mariage n°${acte.numeroActe}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        return response.ok({
            success: true,
            message: 'Acte marqué comme imprimé',
            data: acte,
        })
    }

    /**
     * Annuler un acte
     */
    async cancel({ auth, params, request, response }: HttpContext) {
        const user = auth.user!

        if (!user.isSuperAdmin()) {
            return response.forbidden({
                success: false,
                message: 'Seul le super admin peut annuler un acte',
            })
        }

        const acte = await ActeMariage.find(params.id)

        if (!acte) {
            return response.notFound({
                success: false,
                message: 'Acte non trouvé',
            })
        }

        acte.statut = 'annule'
        acte.updatedBy = user.id
        await acte.save()

        await AuditLog.log({
            userId: user.id,
            mairieId: acte.mairieId,
            action: 'CANCEL',
            entityType: 'ActeMariage',
            entityId: acte.id,
            description: `Annulation de l'acte de mariage n°${acte.numeroActe}`,
            ipAddress: request.ip(),
            userAgent: request.header('user-agent'),
        })

        return response.ok({
            success: true,
            message: 'Acte annulé avec succès',
            data: acte,
        })
    }

    /**
     * Générer le contenu HTML de l'acte
     */
    private genererContenuActe(mariage: Mariage, mairie: Mairie, numeroActe: string): string {
        const dateMariage = mariage.dateMariage.toFormat('dd MMMM yyyy', { locale: 'fr' })
        const dateNaissanceEpoux = mariage.epouxDateNaissance.toFormat('dd MMMM yyyy', { locale: 'fr' })
        const dateNaissanceEpouse = mariage.epouseDateNaissance.toFormat('dd MMMM yyyy', { locale: 'fr' })

        return `
      <div class="acte-mariage">
        <header>
          <h1>RÉPUBLIQUE DU CAMEROUN</h1>
          <p>Paix - Travail - Patrie</p>
          <h2>ACTE DE MARIAGE</h2>
          <p>N° ${numeroActe}</p>
        </header>

        <section class="mairie-info">
          <p><strong>Mairie de ${mairie.nom}</strong></p>
          <p>${mairie.adresse || ''}</p>
        </section>

        <section class="contenu">
          <p>L'an ${mariage.dateMariage.year}, le ${dateMariage}, à ${mariage.heureMariage || '10h00'},</p>
          
          <p>Devant nous, <strong>${mariage.officierNom || 'L\'Officier d\'État Civil'}</strong>, 
          ${mariage.officierFonction || 'Officier d\'État Civil'}, 
          ont comparu publiquement en la salle des mariages de la Mairie de ${mairie.nom} :</p>

          <div class="epoux">
            <h3>L'ÉPOUX</h3>
            <p><strong>${mariage.epouxPrenom} ${mariage.epouxNom}</strong></p>
            <p>Né le ${dateNaissanceEpoux} à ${mariage.epouxLieuNaissance}</p>
            <p>Nationalité : ${mariage.epouxNationalite || 'Camerounaise'}</p>
            <p>Profession : ${mariage.epouxProfession || 'Non précisée'}</p>
            <p>Domicile : ${mariage.epouxAdresse || 'Non précisé'}</p>
            <p>Fils de ${mariage.epouxNomPere || 'Non précisé'} et de ${mariage.epouxNomMere || 'Non précisée'}</p>
          </div>

          <div class="epouse">
            <h3>L'ÉPOUSE</h3>
            <p><strong>${mariage.epousePrenom} ${mariage.epouseNom}</strong></p>
            <p>Née le ${dateNaissanceEpouse} à ${mariage.epouseLieuNaissance}</p>
            <p>Nationalité : ${mariage.epouseNationalite || 'Camerounaise'}</p>
            <p>Profession : ${mariage.epouseProfession || 'Non précisée'}</p>
            <p>Domicile : ${mariage.epouseAdresse || 'Non précisé'}</p>
            <p>Fille de ${mariage.epouseNomPere || 'Non précisé'} et de ${mariage.epouseNomMere || 'Non précisée'}</p>
          </div>

          <div class="temoins">
            <h3>TÉMOINS</h3>
            <p>1. ${mariage.temoin1Prenom || ''} ${mariage.temoin1Nom || 'Non précisé'}</p>
            <p>2. ${mariage.temoin2Prenom || ''} ${mariage.temoin2Nom || 'Non précisé'}</p>
          </div>

          <p>Les époux ont déclaré adopter le régime matrimonial de <strong>${mariage.regimeMatrimonial}</strong>.</p>

          <p>Après lecture faite aux parties et aux témoins, le présent acte a été signé par nous, 
          les époux et les témoins.</p>
        </section>

        <footer>
          <div class="signatures">
            <div class="signature">L'Époux</div>
            <div class="signature">L'Épouse</div>
            <div class="signature">L'Officier d'État Civil</div>
          </div>
        </footer>
      </div>
    `
    }
}
