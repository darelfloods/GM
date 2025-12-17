import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('full_name', 255).notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.string('telephone', 50).nullable()

      // Rôle de l'utilisateur
      table.enum('role', ['super_admin', 'admin_mairie', 'agent', 'consultation']).defaultTo('agent')

      // Association à une mairie (null pour super_admin)
      table.integer('mairie_id').unsigned().nullable()

      // Statut du compte
      table.boolean('is_active').defaultTo(true)
      table.timestamp('last_login_at').nullable()
      table.string('avatar').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}