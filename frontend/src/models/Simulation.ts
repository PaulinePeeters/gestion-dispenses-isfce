// Interface pour représenter un cours externe
export interface CoursExterneSimulation {
    codeEtablissement: string;
    codeCours: string;
}

// Interface pour représenter une requête de simulation
export interface SimulationRequest {
    codeUeCible: string;
    coursExternesProposes: CoursExterneSimulation[];
}

// Interface pour représenter une réponse de simulation
export interface SimulationResponse {
    dispenseAcceptee: boolean;
    pourcentageCouvert: number;
    coursInconnus: boolean;
    message: string;
    codesCoursInconnus: string[];
}

