import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Arrondissement from './arrondissement.js'

export default class Ville extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare nom: string

    @column()
    declare code: string | null

    @column()
    declare region: string | null

    @column()
    declare isActive: boolean

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null

    // Relations
    @hasMany(() => Arrondissement)
    declare arrondissements: HasMany<typeof Arrondissement>
}
