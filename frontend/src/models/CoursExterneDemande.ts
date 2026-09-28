/**
 * Interface pour les données d'un cours externe soumis avec une demande de dispense.
 */
export interface CoursExterneDemandeInput {
    codeEtablissement?: string;
    codeCours?: string;
    intituleCours: string;
    creditsEcts: number;
    nomEtablissement: string;
}

/** Cours externe tel que retourné par le backend dans une demande existante. */
export interface CoursExterneDemande {
    id: number;
    codeEtablissement?: string;
    codeCours?: string;
    connu: boolean;
    intituleCours?: string;
    creditsEcts?: number;
    nomEtablissement?: string;
}
