// Interface pour représenter une Unité d'Enseignement
export interface UE {
    code: string;
    ref: string;
    nom: string;
    nbPeriodes: number;
    ects: number;
    prgm: string;
    sectionCode: string;
}
