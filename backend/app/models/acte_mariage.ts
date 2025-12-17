import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Mariage from './mariage.js'
import Mairie from './mairie.js'
import User from './user.js'

export default class ActeMariage extends BaseModel {
    static table = 'actes_mariage'

    @column({ isPrimary: true })
    declare id: number

    @column()
    declare mariageId: number

    @column()
    declare mairieId: number

    @column()
    declare numeroActe: string

    @column()
    declare annee: number

    @column()
    declare numeroOrdre: number

    @column()
    declare contenu: string | null

    @column()
    declare fichierPdf: string | null

    @column()
    declare statut: 'brouillon' | 'valide' | 'imprime' | 'annule'

    @column.dateTime()
    declare dateValidation: DateTime | null

    @column()
    declare validePar: number | null

    @column()
    declare createdBy: number | null

    @column()
    declare updatedBy: number | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null

    // Relations
    @belongsTo(() => Mariage)
    declare mariage: BelongsTo<typeof Mariage>

    @belongsTo(() => Mairie)
    declare mairie: BelongsTo<typeof Mairie>

    @belongsTo(() => User, { foreignKey: 'validePar' })
    declare validateur: BelongsTo<typeof User>

    @belongsTo(() => User, { foreignKey: 'createdBy' })
    declare createur: BelongsTo<typeof User>

    @belongsTo(() => User, { foreignKey: 'updatedBy' })
    declare modificateur: BelongsTo<typeof User>
}
