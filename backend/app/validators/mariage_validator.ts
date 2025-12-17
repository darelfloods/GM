import vine from '@vinejs/vine'

/**
 * Validateur pour la création d'un mariage
 */
export const createMariageValidator = vine.compile(
    vine.object({
        // Époux
        epouxNom: vine.string().minLength(2).maxLength(255),
        epouxPrenom: vine.string().minLength(2).maxLength(255),
        epouxDateNaissance: vine.date(),
        epouxLieuNaissance: vine.string().minLength(2).maxLength(255),
        epouxNationalite: vine.string().maxLength(100).optional(),
        epouxProfession: vine.string().maxLength(255).optional(),
        epouxAdresse: vine.string().maxLength(500).optional(),
        epouxNomPere: vine.string().maxLength(255).optional(),
        epouxNomMere: vine.string().maxLength(255).optional(),

        // Épouse
        epouseNom: vine.string().minLength(2).maxLength(255),
        epousePrenom: vine.string().minLength(2).maxLength(255),
        epouseDateNaissance: vine.date(),
        epouseLieuNaissance: vine.string().minLength(2).maxLength(255),
        epouseNationalite: vine.string().maxLength(100).optional(),
        epouseProfession: vine.string().maxLength(255).optional(),
        epouseAdresse: vine.string().maxLength(500).optional(),
        epouseNomPere: vine.string().maxLength(255).optional(),
        epouseNomMere: vine.string().maxLength(255).optional(),

        // Mariage
        dateMariage: vine.date(),
        heureMariage: vine.string().optional(),
        lieuMariage: vine.string().maxLength(500).optional(),
        regimeMatrimonial: vine.string().maxLength(100).optional(),

        // Témoins
        temoin1Nom: vine.string().maxLength(255).optional(),
        temoin1Prenom: vine.string().maxLength(255).optional(),
        temoin2Nom: vine.string().maxLength(255).optional(),
        temoin2Prenom: vine.string().maxLength(255).optional(),

        // Officier
        officierNom: vine.string().maxLength(255).optional(),
        officierFonction: vine.string().maxLength(255).optional(),

        // Autres
        observations: vine.string().optional(),
        mairieId: vine.number().optional(),
    })
)

/**
 * Validateur pour la mise à jour d'un mariage
 */
export const updateMariageValidator = vine.compile(
    vine.object({
        // Époux
        epouxNom: vine.string().minLength(2).maxLength(255).optional(),
        epouxPrenom: vine.string().minLength(2).maxLength(255).optional(),
        epouxDateNaissance: vine.date().optional(),
        epouxLieuNaissance: vine.string().minLength(2).maxLength(255).optional(),
        epouxNationalite: vine.string().maxLength(100).optional(),
        epouxProfession: vine.string().maxLength(255).optional(),
        epouxAdresse: vine.string().maxLength(500).optional(),
        epouxNomPere: vine.string().maxLength(255).optional(),
        epouxNomMere: vine.string().maxLength(255).optional(),

        // Épouse
        epouseNom: vine.string().minLength(2).maxLength(255).optional(),
        epousePrenom: vine.string().minLength(2).maxLength(255).optional(),
        epouseDateNaissance: vine.date().optional(),
        epouseLieuNaissance: vine.string().minLength(2).maxLength(255).optional(),
        epouseNationalite: vine.string().maxLength(100).optional(),
        epouseProfession: vine.string().maxLength(255).optional(),
        epouseAdresse: vine.string().maxLength(500).optional(),
        epouseNomPere: vine.string().maxLength(255).optional(),
        epouseNomMere: vine.string().maxLength(255).optional(),

        // Mariage
        dateMariage: vine.date().optional(),
        heureMariage: vine.string().optional(),
        lieuMariage: vine.string().maxLength(500).optional(),
        regimeMatrimonial: vine.string().maxLength(100).optional(),

        // Témoins
        temoin1Nom: vine.string().maxLength(255).optional(),
        temoin1Prenom: vine.string().maxLength(255).optional(),
        temoin2Nom: vine.string().maxLength(255).optional(),
        temoin2Prenom: vine.string().maxLength(255).optional(),

        // Officier
        officierNom: vine.string().maxLength(255).optional(),
        officierFonction: vine.string().maxLength(255).optional(),

        // Autres
        observations: vine.string().optional(),
        statut: vine.enum(['brouillon', 'valide', 'annule']).optional(),
    })
)
