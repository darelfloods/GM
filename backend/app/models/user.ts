import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Mairie from './mairie.js'
import AuditLog from './audit_log.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare telephone: string | null

  @column()
  declare role: 'super_admin' | 'admin_mairie' | 'agent' | 'consultation'

  @column()
  declare mairieId: number | null

  @column()
  declare isActive: boolean

  @column.dateTime()
  declare lastLoginAt: DateTime | null

  @column()
  declare avatar: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relations
  @belongsTo(() => Mairie)
  declare mairie: BelongsTo<typeof Mairie>

  @hasMany(() => AuditLog)
  declare auditLogs: HasMany<typeof AuditLog>

  static accessTokens = DbAccessTokensProvider.forModel(User)

  // Méthodes utilitaires
  isSuperAdmin(): boolean {
    return this.role === 'super_admin'
  }

  isAdminMairie(): boolean {
    return this.role === 'admin_mairie'
  }

  isAgent(): boolean {
    return this.role === 'agent'
  }

  isConsultation(): boolean {
    return this.role === 'consultation'
  }

  canManageMairie(mairieId: number): boolean {
    if (this.isSuperAdmin()) return true
    return this.mairieId === mairieId
  }
}