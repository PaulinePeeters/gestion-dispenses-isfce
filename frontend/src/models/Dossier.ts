export type EtatDossier = 'DEMANDE_EN_COURS' | 'TRAITEMENT_DIRECTION' | 'TRAITEMENT_PROFESSEUR' | 'TRAITE' | 'CLOTURE';

export interface DossierDto {
    id: number;
    date: string;
    etat: EtatDossier;
    objetDemande: string;
}
