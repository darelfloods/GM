import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Ville from './ville.js'
import Mairie from './mairie.js'

export default class Arrondissement extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare nom: string

    @column()
    declare code: string | null

    @column()
    declare villeId: number

    @column()
    declare isActive: boolean

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null

    // Relations
    @belongsTo(() => Ville)
    declare ville: BelongsTo<typeof Ville>

    @hasMany(() => Mairie)
    declare mairies: HasMany<typeof Mairie>
}
