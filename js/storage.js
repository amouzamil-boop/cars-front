/**
 * Module de gestion du cache local (localStorage)
 */

const CACHE_KEY = 'classic-cars-cache';
const CACHE_TIMESTAMP_KEY = 'classic-cars-cache-timestamp';
const LOCAL_CARS_KEY = 'classic-cars-local'; // Pour le mode démo sans API
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes

/**
 * Vérifie si le cache est valide
 * @returns {boolean} True si le cache existe et est valide
 */
export function isCacheValid() {
	const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
	if (!timestamp) {
		return false;
	}

	const cacheAge = Date.now() - parseInt(timestamp, 10);
	return cacheAge < CACHE_DURATION;
}

/**
 * Récupère les données du cache
 * @returns {Array|null} Les données en cache ou null
 */
export function getCachedData() {
	if (!isCacheValid()) {
		return null;
	}

	try {
		const cached = localStorage.getItem(CACHE_KEY);
		if (cached) {
			return JSON.parse(cached);
		}
	} catch (error) {
		console.error('Erreur lors de la lecture du cache:', error);
	}

	return null;
}

/**
 * Met en cache les données
 * @param {Array} data - Les données à mettre en cache
 */
export function setCachedData(data) {
	try {
		localStorage.setItem(CACHE_KEY, JSON.stringify(data));
		localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
	} catch (error) {
		console.error('Erreur lors de la sauvegarde du cache:', error);
	}
}

/**
 * Vide le cache
 */
export function clearCache() {
	try {
		localStorage.removeItem(CACHE_KEY);
		localStorage.removeItem(CACHE_TIMESTAMP_KEY);
	} catch (error) {
		console.error('Erreur lors de la suppression du cache:', error);
	}
}

/**
 * Récupère les statistiques du cache
 * @returns {Object} Les statistiques du cache
 */
export function getCacheStats() {
	const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
	if (!timestamp) {
		return { exists: false, age: null };
	}

	const age = Date.now() - parseInt(timestamp, 10);
	const isValid = age < CACHE_DURATION;

	return {
		exists: true,
		isValid,
		age: Math.floor(age / 1000), // en secondes
		maxAge: Math.floor(CACHE_DURATION / 1000),
	};
}

// ============================================
// Fonctions pour le mode démo (sans API)
// ============================================

/**
 * Récupère les voitures stockées localement (mode démo)
 * @returns {Array} Les voitures stockées localement
 */
export function getLocalCars() {
	try {
		const cars = localStorage.getItem(LOCAL_CARS_KEY);
		return cars ? JSON.parse(cars) : [];
	} catch (error) {
		console.error('Erreur lors de la lecture des voitures locales:', error);
		return [];
	}
}

/**
 * Sauvegarde les voitures localement (mode démo)
 * @param {Array} cars - Les voitures à sauvegarder
 */
export function setLocalCars(cars) {
	try {
		localStorage.setItem(LOCAL_CARS_KEY, JSON.stringify(cars));
	} catch (error) {
		console.error('Erreur lors de la sauvegarde des voitures locales:', error);
	}
}

/**
 * Ajoute une voiture localement (mode démo)
 * @param {Object} car - La voiture à ajouter
 * @returns {Object} La voiture ajoutée avec son ID
 */
export function addLocalCar(car) {
	const cars = getLocalCars();
	const newCar = {
		...car,
		id: `local-${Date.now()}`, // Génère un ID unique
		_id: `local-${Date.now()}`,
		createdAt: new Date().toISOString(),
	};
	cars.push(newCar);
	setLocalCars(cars);
	return newCar;
}

/**
 * Met à jour une voiture localement (mode démo)
 * @param {string} id - L'ID de la voiture
 * @param {Object} carData - Les nouvelles données
 * @returns {Object|null} La voiture mise à jour ou null
 */
export function updateLocalCar(id, carData) {
	const cars = getLocalCars();
	const index = cars.findIndex(c => c.id === id || c._id === id);
	if (index === -1) return null;
	
	cars[index] = { ...cars[index], ...carData, updatedAt: new Date().toISOString() };
	setLocalCars(cars);
	return cars[index];
}

/**
 * Supprime une voiture localement (mode démo)
 * @param {string} id - L'ID de la voiture à supprimer
 * @returns {boolean} True si la suppression a réussi
 */
export function deleteLocalCar(id) {
	const cars = getLocalCars();
	const filteredCars = cars.filter(c => c.id !== id && c._id !== id);
	if (filteredCars.length === cars.length) return false;
	
	setLocalCars(filteredCars);
	return true;
}

/**
 * Récupère une voiture par son ID localement (mode démo)
 * @param {string} id - L'ID de la voiture
 * @returns {Object|null} La voiture ou null
 */
export function getLocalCarById(id) {
	const cars = getLocalCars();
	return cars.find(c => c.id === id || c._id === id) || null;
}
