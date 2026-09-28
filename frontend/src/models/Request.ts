import type { CoursExterneDemande } from './CoursExterneDemande';

// Interface pour représenter un document joint à une demande
export interface RequestDocument {
    id: number;
    originalName: string;
    storedName: string;
    contentType: string;
    size: number;
}

// Interface pour représenter une demande
export interface Request {
    id: number;
    ueCode: string;
    sectionCode: string;
    motif: string;
    statut: 'EN_ATTENTE' | 'VALIDEE' | 'REFUSEE';
    aCoursInconnus?: boolean;
    documents?: RequestDocument[];
    coursExternes?: CoursExterneDemande[];
}

