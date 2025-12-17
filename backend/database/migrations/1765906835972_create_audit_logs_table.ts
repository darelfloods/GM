import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'audit_logs'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').notNullable()
            table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable()
            table.integer('mairie_id').unsigned().references('id').inTable('mairies').onDelete('SET NULL').nullable()

            // Action effectuée
            table.string('action', 100).notNullable() // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
            table.string('entity_type', 100).notNullable() // User, Mariage, Acte, etc.
            table.integer('entity_id').nullable() // ID de l'entité concernée

            // Détails de l'action
            table.text('old_values').nullable() // JSON des anciennes valeurs
            table.text('new_values').nullable() // JSON des nouvelles valeurs
            table.text('description').nullable() // Description lisible de l'action

            // Informations de connexion
            table.string('ip_address', 45).nullable()
            table.string('user_agent', 500).nullable()

            table.timestamp('created_at').notNullable()
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
