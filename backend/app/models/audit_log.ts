import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Mairie from './mairie.js'

export default class AuditLog extends BaseModel {
    static table = 'audit_logs'

    @column({ isPrimary: true })
    declare id: number

    @column()
    declare userId: number | null

    @column()
    declare mairieId: number | null

    @column()
    declare action: string

    @column()
    declare entityType: string

    @column()
    declare entityId: number | null

    @column()
    declare oldValues: string | null

    @column()
    declare newValues: string | null

    @column()
    declare description: string | null

    @column()
    declare ipAddress: string | null

    @column()
    declare userAgent: string | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    // Relations
    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>

    @belongsTo(() => Mairie)
    declare mairie: BelongsTo<typeof Mairie>

    // Méthode statique pour créer un log
    static async log(params: {
        userId?: number
        mairieId?: number
        action: string
        entityType: string
        entityId?: number
        oldValues?: object
        newValues?: object
        description?: string
        ipAddress?: string
        userAgent?: string
    }) {
        return await this.create({
            userId: params.userId,
            mairieId: params.mairieId,
            action: params.action,
            entityType: params.entityType,
            entityId: params.entityId,
            oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
            newValues: params.newValues ? JSON.stringify(params.newValues) : null,
            description: params.description,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
        })
    }
}
