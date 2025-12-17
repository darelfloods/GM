import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Ville from '#models/ville'
import Arrondissement from '#models/arrondissement'
import Mairie from '#models/mairie'

export default class extends BaseSeeder {
    async run() {
        // ========================================
        // 1. Créer les villes
        // ========================================
        const villes = await Ville.createMany([
            { nom: 'Douala', code: 'DLA', region: 'Littoral' },
            { nom: 'Yaoundé', code: 'YDE', region: 'Centre' },
            { nom: 'Bafoussam', code: 'BFS', region: 'Ouest' },
        ])

        console.log('✅ Villes créées')

        // ========================================
        // 2. Créer les arrondissements
        // ========================================
        const arrondissements = await Arrondissement.createMany([
            // Douala
            { nom: 'Douala 1er', code: 'DLA1', villeId: villes[0].id },
            { nom: 'Douala 2ème', code: 'DLA2', villeId: villes[0].id },
            { nom: 'Douala 3ème', code: 'DLA3', villeId: villes[0].id },
            { nom: 'Douala 4ème', code: 'DLA4', villeId: villes[0].id },
            { nom: 'Douala 5ème', code: 'DLA5', villeId: villes[0].id },
            // Yaoundé
            { nom: 'Yaoundé 1er', code: 'YDE1', villeId: villes[1].id },
            { nom: 'Yaoundé 2ème', code: 'YDE2', villeId: villes[1].id },
            { nom: 'Yaoundé 3ème', code: 'YDE3', villeId: villes[1].id },
            { nom: 'Yaoundé 4ème', code: 'YDE4', villeId: villes[1].id },
            // Bafoussam
            { nom: 'Bafoussam 1er', code: 'BFS1', villeId: villes[2].id },
            { nom: 'Bafoussam 2ème', code: 'BFS2', villeId: villes[2].id },
        ])

        console.log('✅ Arrondissements créés')

        // ========================================
        // 3. Créer les mairies
        // ========================================
        const mairies = await Mairie.createMany([
            {
                nom: 'Mairie de Douala 1er',
                code: 'M-DLA1',
                arrondissementId: arrondissements[0].id,
                adresse: 'Avenue du Général de Gaulle, Douala',
                telephone: '+237 233 42 00 00',
                email: 'mairie.dla1@example.com',
                prefixeActe: 'DLA1',
                langue: 'fr',
            },
            {
                nom: 'Mairie de Douala 2ème',
                code: 'M-DLA2',
                arrondissementId: arrondissements[1].id,
                adresse: 'Rue de New Bell, Douala',
                telephone: '+237 233 42 00 01',
                email: 'mairie.dla2@example.com',
                prefixeActe: 'DLA2',
                langue: 'fr',
            },
            {
                nom: 'Mairie de Yaoundé 1er',
                code: 'M-YDE1',
                arrondissementId: arrondissements[5].id,
                adresse: 'Avenue Kennedy, Yaoundé',
                telephone: '+237 222 23 00 00',
                email: 'mairie.yde1@example.com',
                prefixeActe: 'YDE1',
                langue: 'fr',
            },
            {
                nom: 'Mairie de Bafoussam 1er',
                code: 'M-BFS1',
                arrondissementId: arrondissements[9].id,
                adresse: 'Centre Ville, Bafoussam',
                telephone: '+237 233 44 00 00',
                email: 'mairie.bfs1@example.com',
                prefixeActe: 'BFS1',
                langue: 'fr',
            },
        ])

        console.log('✅ Mairies créées')

        // ========================================
        // 4. Créer les utilisateurs
        // ========================================

        // Super Admin
        await User.create({
            fullName: 'Super Administrateur',
            email: 'superadmin@mariage.cm',
            password: 'password123',
            role: 'super_admin',
            isActive: true,
        })

        // Admin Mairie Douala 1er
        await User.create({
            fullName: 'Admin Douala 1er',
            email: 'admin.dla1@mariage.cm',
            password: 'password123',
            role: 'admin_mairie',
            mairieId: mairies[0].id,
            isActive: true,
        })

        // Agent Mairie Douala 1er
        await User.create({
            fullName: 'Agent Douala 1er',
            email: 'agent.dla1@mariage.cm',
            password: 'password123',
            role: 'agent',
            mairieId: mairies[0].id,
            isActive: true,
        })

        // Consultation Douala 1er
        await User.create({
            fullName: 'Consultation Douala 1er',
            email: 'consult.dla1@mariage.cm',
            password: 'password123',
            role: 'consultation',
            mairieId: mairies[0].id,
            isActive: true,
        })

        // Admin Mairie Yaoundé 1er
        await User.create({
            fullName: 'Admin Yaoundé 1er',
            email: 'admin.yde1@mariage.cm',
            password: 'password123',
            role: 'admin_mairie',
            mairieId: mairies[2].id,
            isActive: true,
        })

        // Agent Mairie Yaoundé 1er
        await User.create({
            fullName: 'Agent Yaoundé 1er',
            email: 'agent.yde1@mariage.cm',
            password: 'password123',
            role: 'agent',
            mairieId: mairies[2].id,
            isActive: true,
        })

        console.log('✅ Utilisateurs créés')

        console.log('')
        console.log('========================================')
        console.log('COMPTES DE TEST CRÉÉS :')
        console.log('========================================')
        console.log('')
        console.log('🔐 Super Admin:')
        console.log('   Email: superadmin@mariage.cm')
        console.log('   Mot de passe: password123')
        console.log('')
        console.log('🔐 Admin Mairie Douala 1er:')
        console.log('   Email: admin.dla1@mariage.cm')
        console.log('   Mot de passe: password123')
        console.log('')
        console.log('🔐 Agent Mairie Douala 1er:')
        console.log('   Email: agent.dla1@mariage.cm')
        console.log('   Mot de passe: password123')
        console.log('')
        console.log('🔐 Admin Mairie Yaoundé 1er:')
        console.log('   Email: admin.yde1@mariage.cm')
        console.log('   Mot de passe: password123')
        console.log('========================================')
    }
}
