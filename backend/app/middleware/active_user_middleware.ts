import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Middleware pour vérifier que l'utilisateur est actif
 */
export default class ActiveUserMiddleware {
    async handle({ auth, response }: HttpContext, next: NextFn) {
        const user = auth.user!

        if (!user.isActive) {
            return response.forbidden({
                success: false,
                message: 'Votre compte a été désactivé. Veuillez contacter un administrateur.',
            })
        }

        await next()
    }
}
