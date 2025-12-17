import vine from '@vinejs/vine'

/**
 * Validateur pour la connexion
 */
export const loginValidator = vine.compile(
    vine.object({
        email: vine.string().email(),
        password: vine.string().minLength(6),
    })
)

/**
 * Validateur pour le changement de mot de passe
 */
export const changePasswordValidator = vine.compile(
    vine.object({
        currentPassword: vine.string().minLength(6),
        newPassword: vine.string().minLength(6),
    })
)

/**
 * Validateur pour la demande de réinitialisation
 */
export const forgotPasswordValidator = vine.compile(
    vine.object({
        email: vine.string().email(),
    })
)
