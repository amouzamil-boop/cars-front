// Configuration de l'API REST
// ⚠️ IMPORTANT: Remplacez cette URL par l'URL de votre API déployée sur Render

/**
 * Configuration de l'API
 * @type {Object}
 */
export const API_CONFIG = {
	baseURL: 'https://cars-front.onrender.com/api',
	endpoints: {
		cars: '/cars'
	}
};

// Export pour compatibilité avec le code existant
export const API_BASE_URL = API_CONFIG.baseURL;

// Endpoints de l'API
export const API_ENDPOINTS = {
	CARS: API_CONFIG.endpoints.cars,
	CAR_BY_ID: (id) => `${API_CONFIG.endpoints.cars}/${id}`,
};

// Clé API pour les requêtes authentifiées (POST, PUT, DELETE)
// ⚠️ IMPORTANT: Cette clé doit correspondre à celle configurée sur votre API
export const API_KEY = 'ma-super-cle-api-2025';
