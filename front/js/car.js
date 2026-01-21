import { fetchCarById, updateCar, deleteCar } from './api.js';
import { localCarsdata } from './mock-data.js';
import { showSuccess, showError } from './toast.js';
import { getLocalCarById, getCachedData } from './storage.js';

/**
 * Récupère l'ID de la voiture depuis l'URL (query parameter ?id=...)
 * @returns {string|null} L'ID de la voiture ou null si non trouvé
 */
function getCarIdFromUrl() {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get('id');
}

/**
 * Formate le prix en euros
 * @param {number} price - Le prix à formater
 * @returns {string} Le prix formaté
 */
function formatPrice(price) {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(price);
}

/**
 * Formate le kilométrage
 * @param {number} mileage - Le kilométrage à formater
 * @returns {string} Le kilométrage formaté
 */
function formatMileage(mileage) {
	return new Intl.NumberFormat('fr-FR').format(mileage) + ' km';
}

/**
 * Affiche les détails d'une voiture dans la page
 * @param {Object} car - Les données de la voiture
 */
function displayCarDetails(car) {
	// Mise à jour du titre
	const titleElement = document.getElementById('car-title');
	if (titleElement) {
		titleElement.textContent = `${car.year} ${car.brand} ${car.model}`;
	}

	// Mise à jour de l'image
	const imageElement = document.getElementById('car-image');
	if (imageElement) {
		imageElement.src = car.imageUrl || car.image || './imgs/classic-cars.jpg';
		imageElement.alt = `${car.brand} ${car.model}`;
	}

	// Mise à jour des spécifications dans le tableau
	const yearElement = document.getElementById('car-year');
	if (yearElement) yearElement.textContent = car.year || '-';

	const brandElement = document.getElementById('car-brand');
	if (brandElement) brandElement.textContent = car.brand || '-';

	const modelElement = document.getElementById('car-model');
	if (modelElement) modelElement.textContent = car.model || '-';

	const colorElement = document.getElementById('car-color');
	if (colorElement) colorElement.textContent = car.color || '-';

	const mileageElement = document.getElementById('car-mileage');
	if (mileageElement) {
		mileageElement.textContent = car.mileage ? formatMileage(car.mileage) : '-';
	}

	const descriptionElement = document.getElementById('car-description');
	if (descriptionElement) {
		descriptionElement.textContent = car.description || 'Aucune description disponible';
	}

	const priceElement = document.getElementById('car-price');
	if (priceElement) {
		priceElement.textContent = car.price ? formatPrice(car.price) : '-';
	}
}

/**
 * Affiche un message d'erreur dans la page
 * @param {string} message - Le message d'erreur à afficher
 */
function displayError(message) {
	const article = document.querySelector('article');
	if (article) {
		article.innerHTML = `
			<div class="alert alert-danger" role="alert">
				<h4 class="alert-heading">Erreur</h4>
				<p>${message}</p>
				<hr>
				<p class="mb-0">
					<a href="./index.html" class="btn btn-primary">Retour à l'accueil</a>
				</p>
			</div>
		`;
	}
}

/**
 * Affiche un message de chargement
 */
function displayLoading() {
	const titleElement = document.getElementById('car-title');
	if (titleElement) {
		titleElement.textContent = 'Chargement...';
	}
}

/**
 * Trouve une voiture dans les données locales par ID
 * @param {string} id - L'ID de la voiture
 * @returns {Object|null} La voiture trouvée ou null
 */
function findCarInLocalData(id) {
	// D'abord, cherche dans le localStorage (mode démo)
	const localCar = getLocalCarById(id);
	if (localCar) {
		return localCar;
	}
	
	// Ensuite, cherche dans le cache
	const cachedCars = getCachedData();
	if (cachedCars) {
		const cachedCar = cachedCars.find(c => String(c.id || c._id) === String(id));
		if (cachedCar) {
			return cachedCar;
		}
	}
	
	// Enfin, recherche dans les données mock statiques
	return localCarsdata.find((car, index) => {
		// Si l'ID correspond à l'index ou à un ID spécifique
		return String(index + 1) === String(id) || String(car.id || car._id) === String(id);
	}) || null;
}

/**
 * Initialise la page de détails de la voiture
 */
async function init() {
	const carId = getCarIdFromUrl();

	if (!carId) {
		displayError('Aucun ID de voiture spécifié dans l\'URL.');
		return;
	}

	displayLoading();

	// Si l'ID commence par "mock-" ou "local-", c'est une voiture locale/démo
	// On ne doit pas essayer de récupérer depuis l'API
	const isLocalId = carId.startsWith('mock-') || carId.startsWith('local-');
	
	if (isLocalId) {
		// Recherche directement dans les données locales
		const localCar = findCarInLocalData(carId);
		if (localCar) {
			console.log('Voiture trouvée dans les données locales:', localCar);
			displayCarDetails(localCar);
		} else {
			displayError(`Voiture avec l'ID "${carId}" introuvable.`);
		}
		return;
	}

	// Pour les IDs normaux, essaie d'abord l'API
	try {
		const car = await fetchCarById(carId);
		console.log('Voiture récupérée depuis l\'API:', car);
		displayCarDetails(car);
	} catch (error) {
		console.error('Erreur lors de la récupération depuis l\'API:', error);
		console.warn('Tentative de récupération depuis les données locales...');
		
		// Fallback vers les données locales
		const localCar = findCarInLocalData(carId);
		if (localCar) {
			console.log('Voiture trouvée dans les données locales:', localCar);
			displayCarDetails(localCar);
		} else {
			displayError(`Voiture avec l'ID "${carId}" introuvable.`);
		}
	}
}

/**
 * Gère la suppression d'une voiture depuis la page de détails
 */
async function handleDeleteCar() {
	const carId = getCarIdFromUrl();
	if (!carId) {
		alert('ID de voiture manquant');
		return;
	}

	// Confirmation avant suppression
	const confirmed = confirm(
		'Êtes-vous sûr de vouloir supprimer cette voiture ? Cette action est irréversible.'
	);

	if (!confirmed) {
		return;
	}

	try {
		await deleteCar(carId);
		console.log(`Voiture ${carId} supprimée avec succès`);

		// Affiche un message de succès
		showSuccess('Voiture supprimée avec succès !');

		// Redirige vers la page d'accueil après un court délai
		setTimeout(() => {
			window.location.href = './index.html';
		}, 1000);
	} catch (error) {
		console.error('Erreur lors de la suppression:', error);
		showError(`Erreur lors de la suppression de la voiture: ${error.message || 'Erreur inconnue'}`);
	}
}

/**
 * Initialise les gestionnaires d'événements des boutons
 */
function initButtons() {
	const editButton = document.getElementById('edit-car-btn');
	const deleteButton = document.getElementById('delete-car-btn');

	if (editButton) {
		editButton.addEventListener('click', () => {
			const carId = getCarIdFromUrl();
			if (carId) {
				// Ouvre la modal d'édition sur index.html
				window.location.href = `./index.html?edit=${carId}`;
			}
		});
	}

	if (deleteButton) {
		deleteButton.addEventListener('click', handleDeleteCar);
	}
}

/**
 * Initialise la page de détails de la voiture
 */
function pageInit() {
	init();
	initButtons();
}

// Initialise la page quand le DOM est chargé
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', pageInit);
} else {
	pageInit();
}
