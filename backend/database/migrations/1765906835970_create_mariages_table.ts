import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'mariages'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').notNullable()
            table.integer('mairie_id').unsigned().references('id').inTable('mairies').onDelete('CASCADE').notNullable()

            // Informations du premier époux
            table.string('epoux_nom', 255).notNullable()
            table.string('epoux_prenom', 255).notNullable()
            table.date('epoux_date_naissance').notNullable()
            table.string('epoux_lieu_naissance', 255).notNullable()
            table.string('epoux_nationalite', 100).nullable()
            table.string('epoux_profession', 255).nullable()
            table.string('epoux_adresse', 500).nullable()
            table.string('epoux_nom_pere', 255).nullable()
            table.string('epoux_nom_mere', 255).nullable()

            // Informations du second époux
            table.string('epouse_nom', 255).notNullable()
            table.string('epouse_prenom', 255).notNullable()
            table.date('epouse_date_naissance').notNullable()
            table.string('epouse_lieu_naissance', 255).notNullable()
            table.string('epouse_nationalite', 100).nullable()
            table.string('epouse_profession', 255).nullable()
            table.string('epouse_adresse', 500).nullable()
            table.string('epouse_nom_pere', 255).nullable()
            table.string('epouse_nom_mere', 255).nullable()

            // Informations du mariage
            table.date('date_mariage').notNullable()
            table.time('heure_mariage').nullable()
            table.string('lieu_mariage', 500).nullable()
            table.string('regime_matrimonial', 100).defaultTo('communauté réduite aux acquêts')

            // Témoins
            table.string('temoin1_nom', 255).nullable()
            table.string('temoin1_prenom', 255).nullable()
            table.string('temoin2_nom', 255).nullable()
            table.string('temoin2_prenom', 255).nullable()

            // Officier d'état civil
            table.string('officier_nom', 255).nullable()
            table.string('officier_fonction', 255).nullable()

            // Statut et métadonnées
            table.enum('statut', ['brouillon', 'valide', 'annule']).defaultTo('brouillon')
            table.text('observations').nullable()
            table.integer('created_by').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable()
            table.integer('updated_by').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable()

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').nullable()
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
