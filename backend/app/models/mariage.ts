import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import Mairie from './mairie.js'
import User from './user.js'
import ActeMariage from './acte_mariage.js'

export default class Mariage extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare mairieId: number

    // Informations du premier époux
    @column()
    declare epouxNom: string

    @column()
    declare epouxPrenom: string

    @column.date()
    declare epouxDateNaissance: DateTime

    @column()
    declare epouxLieuNaissance: string

    @column()
    declare epouxNationalite: string | null

    @column()
    declare epouxProfession: string | null

    @column()
    declare epouxAdresse: string | null

    @column()
    declare epouxNomPere: string | null

    @column()
    declare epouxNomMere: string | null

    // Informations du second époux
    @column()
    declare epouseNom: string

    @column()
    declare epousePrenom: string

    @column.date()
    declare epouseDateNaissance: DateTime

    @column()
    declare epouseLieuNaissance: string

    @column()
    declare epouseNationalite: string | null

    @column()
    declare epouseProfession: string | null

    @column()
    declare epouseAdresse: string | null

    @column()
    declare epouseNomPere: string | null

    @column()
    declare epouseNomMere: string | null

    // Informations du mariage
    @column.date()
    declare dateMariage: DateTime

    @column()
    declare heureMariage: string | null

    @column()
    declare lieuMariage: string | null

    @column()
    declare regimeMatrimonial: string

    // Témoins
    @column()
    declare temoin1Nom: string | null

    @column()
    declare temoin1Prenom: string | null

    @column()
    declare temoin2Nom: string | null

    @column()
    declare temoin2Prenom: string | null

    // Officier d'état civil
    @column()
    declare officierNom: string | null

    @column()
    declare officierFonction: string | null

    // Statut et métadonnées
    @column()
    declare statut: 'brouillon' | 'valide' | 'annule'

    @column()
    declare observations: string | null

    @column()
    declare createdBy: number | null

    @column()
    declare updatedBy: number | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null

    // Relations
    @belongsTo(() => Mairie)
    declare mairie: BelongsTo<typeof Mairie>

    @belongsTo(() => User, { foreignKey: 'createdBy' })
    declare createur: BelongsTo<typeof User>

    @belongsTo(() => User, { foreignKey: 'updatedBy' })
    declare modificateur: BelongsTo<typeof User>

    @hasOne(() => ActeMariage)
    declare acte: HasOne<typeof ActeMariage>

    // Méthodes utilitaires
    get nomCompletEpoux(): string {
        return `${this.epouxPrenom} ${this.epouxNom}`
    }

    get nomCompletEpouse(): string {
        return `${this.epousePrenom} ${this.epouseNom}`
    }
}
