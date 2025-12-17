import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Arrondissement from './arrondissement.js'
import User from './user.js'
import Mariage from './mariage.js'
import ActeMariage from './acte_mariage.js'

export default class Mairie extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare nom: string

    @column()
    declare code: string | null

    @column()
    declare arrondissementId: number | null

    @column()
    declare adresse: string | null

    @column()
    declare telephone: string | null

    @column()
    declare email: string | null

    @column()
    declare logo: string | null

    @column()
    declare cachet: string | null

    @column()
    declare langue: string

    @column()
    declare prefixeActe: string | null

    @column()
    declare dernierNumeroActe: number

    @column()
    declare isActive: boolean

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null

    // Relations
    @belongsTo(() => Arrondissement)
    declare arrondissement: BelongsTo<typeof Arrondissement>

    @hasMany(() => User)
    declare users: HasMany<typeof User>

    @hasMany(() => Mariage)
    declare mariages: HasMany<typeof Mariage>

    @hasMany(() => ActeMariage)
    declare actes: HasMany<typeof ActeMariage>

    // Méthode pour générer le prochain numéro d'acte
    async genererNumeroActe(annee: number): Promise<{ numero: string; numeroOrdre: number }> {
        this.dernierNumeroActe += 1
        await this.save()

        const prefixe = this.prefixeActe || 'ACT'
        const numero = `${prefixe}-${annee}-${String(this.dernierNumeroActe).padStart(4, '0')}`

        return {
            numero,
            numeroOrdre: this.dernierNumeroActe
        }
    }
}
