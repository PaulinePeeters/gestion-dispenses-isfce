import Keycloak from 'keycloak-js';

// Configuration de Keycloak
export const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8084',
  realm: import.meta.env.VITE_KEYCLOAK_REALM ?? 'DISP',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'ETU_APP',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
