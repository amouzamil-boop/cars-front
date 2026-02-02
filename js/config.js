// Configuration de l'API REST

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


export const API_BASE_URL = API_CONFIG.baseURL;

// Endpoints de l'API
export const API_ENDPOINTS = {
	CARS: API_CONFIG.endpoints.cars,
	CAR_BY_ID: (id) => `${API_CONFIG.endpoints.cars}/${id}`,
};


export const API_KEY = 'ma-super-cle-api-2025';
