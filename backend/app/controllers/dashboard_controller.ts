import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import Mairie from '#models/mairie'
import Mariage from '#models/mariage'
import ActeMariage from '#models/acte_mariage'
import AuditLog from '#models/audit_log'

export default class DashboardController {
    /**
     * Dashboard principal - adapté selon le rôle
     */
    async index({ auth, response }: HttpContext) {
        const user = auth.user!

        if (user.isSuperAdmin()) {
            return this.superAdminDashboard(response)
        } else if (user.isAdminMairie()) {
            return this.adminMairieDashboard(user, response)
        } else {
            return this.agentDashboard(user, response)
        }
    }

    /**
     * Dashboard Super Admin - Statistiques globales
     */
    private async superAdminDashboard(response: HttpContext['response']) {
        const now = DateTime.now()
        const debutMois = now.startOf('month')
        const debutAnnee = now.startOf('year')

        // Statistiques globales
        const totalMairies = await Mairie.query().count('* as total')
        const totalMairiesActives = await Mairie.query().where('is_active', true).count('* as total')
        const totalUsers = await User.query().count('* as total')
        const totalUsersActifs = await User.query().where('is_active', true).count('* as total')
        const totalMariages = await Mariage.query().count('* as total')
        const totalActes = await ActeMariage.query().count('* as total')

        // Mariages ce mois-ci
        const mariagesMois = await Mariage.query()
            .where('created_at', '>=', debutMois.toSQL())
            .count('* as total')

        // Mariages cette année
        const mariagesAnnee = await Mariage.query()
            .where('created_at', '>=', debutAnnee.toSQL())
            .count('* as total')

        // Derniers mariages
        const derniersMariages = await Mariage.query()
            .preload('mairie')
            .orderBy('created_at', 'desc')
            .limit(5)

        // Statistiques par mairie
        const statsMairies = await Mairie.query()
            .select('id', 'nom')
            .withCount('mariages')
            .withCount('users')
            .orderBy('mariages_count', 'desc')
            .limit(10)

        // Activités récentes
        const activitesRecentes = await AuditLog.query()
            .preload('user')
            .preload('mairie')
            .orderBy('created_at', 'desc')
            .limit(10)

        return response.ok({
            success: true,
            data: {
                role: 'super_admin',
                statistiques: {
                    totalMairies: totalMairies[0].$extras.total,
                    totalMairiesActives: totalMairiesActives[0].$extras.total,
                    totalUsers: totalUsers[0].$extras.total,
                    totalUsersActifs: totalUsersActifs[0].$extras.total,
                    totalMariages: totalMariages[0].$extras.total,
                    totalActes: totalActes[0].$extras.total,
                    mariagesMois: mariagesMois[0].$extras.total,
                    mariagesAnnee: mariagesAnnee[0].$extras.total,
                },
                derniersMariages,
                statsMairies: statsMairies.map((m) => ({
                    id: m.id,
                    nom: m.nom,
                    totalMariages: m.$extras.mariages_count,
                    totalUsers: m.$extras.users_count,
                })),
                activitesRecentes,
            },
        })
    }

    /**
     * Dashboard Admin Mairie - Statistiques de la mairie
     */
    private async adminMairieDashboard(user: User, response: HttpContext['response']) {
        const mairieId = user.mairieId!
        const now = DateTime.now()
        const debutMois = now.startOf('month')
        const debutAnnee = now.startOf('year')

        // Charger la mairie
        const mairie = await Mairie.find(mairieId)

        // Statistiques de la mairie
        const totalUsers = await User.query()
            .where('mairie_id', mairieId)
            .count('* as total')
        const totalUsersActifs = await User.query()
            .where('mairie_id', mairieId)
            .where('is_active', true)
            .count('* as total')
        const totalMariages = await Mariage.query()
            .where('mairie_id', mairieId)
            .count('* as total')
        const totalActes = await ActeMariage.query()
            .where('mairie_id', mairieId)
            .count('* as total')

        // Mariages par statut
        const mariagesBrouillon = await Mariage.query()
            .where('mairie_id', mairieId)
            .where('statut', 'brouillon')
            .count('* as total')
        const mariagesValides = await Mariage.query()
            .where('mairie_id', mairieId)
            .where('statut', 'valide')
            .count('* as total')

        // Mariages ce mois-ci
        const mariagesMois = await Mariage.query()
            .where('mairie_id', mairieId)
            .where('created_at', '>=', debutMois.toSQL())
            .count('* as total')

        // Mariages cette année
        const mariagesAnnee = await Mariage.query()
            .where('mairie_id', mairieId)
            .where('created_at', '>=', debutAnnee.toSQL())
            .count('* as total')

        // Derniers mariages
        const derniersMariages = await Mariage.query()
            .where('mairie_id', mairieId)
            .preload('createur')
            .orderBy('created_at', 'desc')
            .limit(5)

        // Activités récentes de la mairie
        const activitesRecentes = await AuditLog.query()
            .where('mairie_id', mairieId)
            .preload('user')
            .orderBy('created_at', 'desc')
            .limit(10)

        // Utilisateurs actifs
        const utilisateursActifs = await User.query()
            .where('mairie_id', mairieId)
            .where('is_active', true)
            .orderBy('last_login_at', 'desc')
            .limit(5)

        return response.ok({
            success: true,
            data: {
                role: 'admin_mairie',
                mairie: mairie,
                statistiques: {
                    totalUsers: totalUsers[0].$extras.total,
                    totalUsersActifs: totalUsersActifs[0].$extras.total,
                    totalMariages: totalMariages[0].$extras.total,
                    totalActes: totalActes[0].$extras.total,
                    mariagesBrouillon: mariagesBrouillon[0].$extras.total,
                    mariagesValides: mariagesValides[0].$extras.total,
                    mariagesMois: mariagesMois[0].$extras.total,
                    mariagesAnnee: mariagesAnnee[0].$extras.total,
                },
                derniersMariages,
                activitesRecentes,
                utilisateursActifs,
            },
        })
    }

    /**
     * Dashboard Agent - Vue simplifiée
     */
    private async agentDashboard(user: User, response: HttpContext['response']) {
        const mairieId = user.mairieId!
        const now = DateTime.now()
        const debutMois = now.startOf('month')

        // Charger la mairie
        const mairie = await Mairie.find(mairieId)

        // Statistiques simples
        const mesMariages = await Mariage.query()
            .where('mairie_id', mairieId)
            .where('created_by', user.id)
            .count('* as total')

        const mariagesMois = await Mariage.query()
            .where('mairie_id', mairieId)
            .where('created_at', '>=', debutMois.toSQL())
            .count('* as total')

        // Mes derniers mariages
        const mesDerniersMariages = await Mariage.query()
            .where('mairie_id', mairieId)
            .where('created_by', user.id)
            .preload('acte')
            .orderBy('created_at', 'desc')
            .limit(5)

        // Mariages récents de la mairie
        const mariagesRecents = await Mariage.query()
            .where('mairie_id', mairieId)
            .preload('createur')
            .preload('acte')
            .orderBy('created_at', 'desc')
            .limit(10)

        // Mariages en attente de validation
        const mariagesEnAttente = await Mariage.query()
            .where('mairie_id', mairieId)
            .where('statut', 'brouillon')
            .orderBy('created_at', 'desc')
            .limit(5)

        return response.ok({
            success: true,
            data: {
                role: user.role,
                mairie: mairie,
                statistiques: {
                    mesMariages: mesMariages[0].$extras.total,
                    mariagesMois: mariagesMois[0].$extras.total,
                },
                mesDerniersMariages,
                mariagesRecents,
                mariagesEnAttente,
            },
        })
    }

    /**
     * Statistiques par période
     */
    async stats({ auth, request, response }: HttpContext) {
        const user = auth.user!
        const periode = request.input('periode', 'mois') // jour, semaine, mois, annee
        const annee = request.input('annee', DateTime.now().year)

        let query = Mariage.query()

        // Filtrer par mairie si non super admin
        if (!user.isSuperAdmin()) {
            query = query.where('mairie_id', user.mairieId!)
        }

        // Filtrer par année
        query = query.whereRaw('EXTRACT(YEAR FROM created_at) = ?', [annee])

        const mariages = await query
            .select('*')
            .orderBy('created_at', 'asc')

        // Grouper par période
        const stats = this.grouperParPeriode(mariages, periode)

        return response.ok({
            success: true,
            data: stats,
        })
    }

    private grouperParPeriode(mariages: Mariage[], periode: string) {
        const grouped: { [key: string]: number } = {}

        mariages.forEach((mariage) => {
            let key: string

            switch (periode) {
                case 'jour':
                    key = mariage.createdAt.toFormat('yyyy-MM-dd')
                    break
                case 'semaine':
                    key = `Semaine ${mariage.createdAt.weekNumber}`
                    break
                case 'annee':
                    key = mariage.createdAt.toFormat('yyyy')
                    break
                case 'mois':
                default:
                    key = mariage.createdAt.toFormat('MMMM', { locale: 'fr' })
                    break
            }

            grouped[key] = (grouped[key] || 0) + 1
        })

        return Object.entries(grouped).map(([label, count]) => ({ label, count }))
    }
}
