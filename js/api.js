import { API_BASE_URL, API_ENDPOINTS, API_KEY } from './config.js';

/**
 * Fonction utilitaire pour gérer les erreurs de requête
 */
function handleResponse(response) {
	if (!response.ok) {
		// Messages d'erreur plus détaillés selon le code HTTP
		let errorMessage = `Erreur HTTP: ${response.status}`;
		switch (response.status) {
			case 400:
				errorMessage = 'Requête invalide. Veuillez vérifier les données saisies.';
				break;
			case 401:
				errorMessage = 'Non autorisé. Veuillez vérifier vos identifiants.';
				break;
			case 403:
				errorMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
				break;
			case 404:
				errorMessage = 'Ressource introuvable.';
				break;
			case 500:
				errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
				break;
			case 503:
				errorMessage = 'Service temporairement indisponible. Veuillez réessayer plus tard.';
				break;
			default:
				errorMessage = `Erreur HTTP ${response.status}: ${response.statusText || 'Erreur inconnue'}`;
		}
		throw new Error(errorMessage);
	}
	return response.json();
}

/**
 * Récupère toutes les voitures depuis l'API avec gestion d'erreur réseau améliorée
 * @param {number} retries - Nombre de tentatives de retry (défaut: 0)
 * @returns {Promise<Array>} Liste des voitures
 */
export async function fetchAllCars(retries = 0) {
	const maxRetries = 1; // Réduit pour un fallback plus rapide
	const timeoutMs = 5000; // 5 secondes
	
	try {
		// Création d'un AbortController pour le timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
		
		const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CARS}`, {
			signal: controller.signal,
		});
		
		clearTimeout(timeoutId);
		return await handleResponse(response);
	} catch (error) {
		console.error('Erreur lors de la récupération des voitures:', error);
		
		// Si c'est une erreur réseau et qu'on peut réessayer
		if (error.name === 'AbortError' || (error.name === 'TypeError' && error.message.includes('fetch'))) {
			if (retries < maxRetries) {
				console.log(`Tentative de récupération ${retries + 1}/${maxRetries}...`);
				// Attendre un peu avant de réessayer (backoff exponentiel)
				await new Promise(resolve => setTimeout(resolve, 500 * (retries + 1)));
				return fetchAllCars(retries + 1);
			}
			throw new Error('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
		}
		
		throw error;
	}
}

/**
 * Récupère une voiture par son ID depuis l'API
 * @param {number|string} id - L'identifiant de la voiture
 * @returns {Promise<Object>} Les données de la voiture
 */
export async function fetchCarById(id) {
	try {
		const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CAR_BY_ID(id)}`);
		return await handleResponse(response);
	} catch (error) {
		console.error(`Erreur lors de la récupération de la voiture ${id}:`, error);
		throw error;
	}
}

/**
 * Crée une nouvelle voiture via l'API
 * @param {Object} carData - Les données de la voiture à créer
 * @returns {Promise<Object>} La voiture créée
 */
export async function createCar(carData) {
	try {
		const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CARS}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': API_KEY,
			},
			body: JSON.stringify(carData),
		});
		return await handleResponse(response);
	} catch (error) {
		console.error('Erreur lors de la création de la voiture:', error);
		throw error;
	}
}

/**
 * Met à jour une voiture via l'API
 * @param {number|string} id - L'identifiant de la voiture
 * @param {Object} carData - Les nouvelles données de la voiture
 * @returns {Promise<Object>} La voiture mise à jour
 */
export async function updateCar(id, carData) {
	try {
		const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CAR_BY_ID(id)}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': API_KEY,
			},
			body: JSON.stringify(carData),
		});
		return await handleResponse(response);
	} catch (error) {
		console.error(`Erreur lors de la mise à jour de la voiture ${id}:`, error);
		throw error;
	}
}

/**
 * Supprime une voiture via l'API
 * @param {number|string} id - L'identifiant de la voiture à supprimer
 * @returns {Promise<void>}
 */
export async function deleteCar(id) {
	try {
		const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CAR_BY_ID(id)}`, {
			method: 'DELETE',
			headers: {
				'x-api-key': API_KEY,
			},
		});
		if (!response.ok) {
			throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
		}
		return;
	} catch (error) {
		console.error(`Erreur lors de la suppression de la voiture ${id}:`, error);
		throw error;
	}
}
