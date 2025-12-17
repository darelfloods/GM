import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'users'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.foreign('mairie_id').references('id').inTable('mairies').onDelete('SET NULL')
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropForeign('mairie_id')
        })
    }
}
