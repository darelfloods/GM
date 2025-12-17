import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'actes_mariage'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').notNullable()
            table.integer('mariage_id').unsigned().references('id').inTable('mariages').onDelete('CASCADE').notNullable()
            table.integer('mairie_id').unsigned().references('id').inTable('mairies').onDelete('CASCADE').notNullable()

            // Numérotation unique par mairie
            table.string('numero_acte', 100).notNullable()
            table.integer('annee').notNullable()
            table.integer('numero_ordre').notNullable() // Numéro séquentiel dans l'année

            // Contenu de l'acte
            table.text('contenu').nullable() // Contenu HTML/texte de l'acte
            table.string('fichier_pdf').nullable() // Chemin vers le fichier PDF généré

            // Statut et validation
            table.enum('statut', ['brouillon', 'valide', 'imprime', 'annule']).defaultTo('brouillon')
            table.timestamp('date_validation').nullable()
            table.integer('valide_par').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable()

            // Métadonnées
            table.integer('created_by').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable()
            table.integer('updated_by').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable()

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').nullable()

            // Contrainte unique: un seul numéro d'acte par mairie et par année
            table.unique(['mairie_id', 'annee', 'numero_ordre'])
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
