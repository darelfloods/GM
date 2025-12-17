import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Middleware pour vérifier le rôle de l'utilisateur
 */
export default class RoleMiddleware {
    async handle(
        { auth, response }: HttpContext,
        next: NextFn,
        options: { roles: string[] }
    ) {
        const user = auth.user!

        if (!options.roles.includes(user.role)) {
            return response.forbidden({
                success: false,
                message: 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource',
            })
        }

        await next()
    }
}
