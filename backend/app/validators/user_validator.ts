import vine from '@vinejs/vine'

/**
 * Validateur pour la création d'un utilisateur
 */
export const createUserValidator = vine.compile(
    vine.object({
        fullName: vine.string().minLength(2).maxLength(255),
        email: vine.string().email(),
        password: vine.string().minLength(6),
        telephone: vine.string().optional(),
        role: vine.enum(['super_admin', 'admin_mairie', 'agent', 'consultation']),
        mairieId: vine.number().optional(),
        isActive: vine.boolean().optional(),
    })
)

/**
 * Validateur pour la mise à jour d'un utilisateur
 */
export const updateUserValidator = vine.compile(
    vine.object({
        fullName: vine.string().minLength(2).maxLength(255).optional(),
        email: vine.string().email().optional(),
        telephone: vine.string().optional(),
        role: vine.enum(['super_admin', 'admin_mairie', 'agent', 'consultation']).optional(),
        mairieId: vine.number().optional(),
        isActive: vine.boolean().optional(),
    })
)
