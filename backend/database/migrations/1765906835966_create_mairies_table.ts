import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'mairies'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').notNullable()
            table.string('nom', 255).notNullable()
            table.string('code', 50).nullable().unique()
            table.integer('arrondissement_id').unsigned().references('id').inTable('arrondissements').onDelete('SET NULL').nullable()
            table.string('adresse', 500).nullable()
            table.string('telephone', 50).nullable()
            table.string('email', 254).nullable()
            table.string('logo').nullable()
            table.string('cachet').nullable()
            table.string('langue', 10).defaultTo('fr')
            table.string('prefixe_acte', 20).nullable() // Préfixe pour la numérotation des actes
            table.integer('dernier_numero_acte').defaultTo(0) // Pour la numérotation séquentielle
            table.boolean('is_active').defaultTo(true)

            table.timestamp('created_at').notNullable()
            table.timestamp('updated_at').nullable()
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
