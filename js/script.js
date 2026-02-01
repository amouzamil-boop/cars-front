import { fetchAllCars, createCar, updateCar, deleteCar, fetchCarById } from './api.js';
import { localCarsdata } from './mock-data.js';
import { showSuccess, showError, showWarning, showInfo } from './toast.js';
import { getCachedData, setCachedData, clearCache, getLocalCars, setLocalCars, addLocalCar, updateLocalCar, deleteLocalCar, getLocalCarById } from './storage.js';
import { exportToJSON, exportToCSV, calculateStats, formatNumber } from './utils.js';

// Variable globale pour stocker toutes les voitures (non filtrées)
let allCars = [];

// Variable globale pour le critère de tri actuel
let currentSort = '';

// Mode démo : true si l'API n'est pas disponible
let isDemoMode = false;

/**
 * Valide si une chaîne est une URL valide
 * @param {string} string - La chaîne à valider
 * @returns {boolean} True si c'est une URL valide
 */
function isValidUrl(string) {
	try {
		new URL(string);
		return true;
	} catch {
		return false;
	}
}

/**
 * Remplit le formulaire avec les données d'une voiture pour l'édition
 * @param {Object} car - Les données de la voiture
 * @param {string} carId - L'ID de la voiture
 */
function populateEditForm(car, carId) {
	const form = document.getElementById('car-form');
	if (!form) {
		console.error('Formulaire car-form introuvable');
		return;
	}

	// Remplit les champs du formulaire
	document.getElementById('car-brand').value = car.brand || '';
	document.getElementById('car-model').value = car.model || '';
	document.getElementById('car-year').value = car.year || '';
	document.getElementById('car-color').value = car.color || '';
	document.getElementById('car-price').value = car.price || '';
	document.getElementById('car-mileage').value = car.mileage || '';
	document.getElementById('car-description').value = car.description || '';
	document.getElementById('car-imageUrl').value = car.imageUrl || car.image || '';

	// Stocke l'ID de la voiture en cours d'édition
	form.dataset.editCarId = carId;

	// Change le titre de la modal
	const modalTitle = document.getElementById('exampleModalLabel');
	if (modalTitle) {
		modalTitle.textContent = 'Modifier une voiture';
	}

	// Change le texte du bouton
	const saveText = document.getElementById('save-text');
	if (saveText) {
		saveText.textContent = 'Mettre à jour';
	}

	// Affiche la modal
	const modalElement = document.getElementById('exampleModal');
	if (modalElement) {
		try {
			// Vérifie si une instance de modal existe déjà
			let modal = bootstrap.Modal.getInstance(modalElement);
			if (!modal) {
				// Crée une nouvelle instance si elle n'existe pas
				modal = new bootstrap.Modal(modalElement);
			}
			// Ouvre la modal
			modal.show();
			console.log('Modal d\'édition ouverte avec succès');
		} catch (error) {
			console.error('Erreur lors de l\'ouverture de la modal:', error);
			// Fallback : ouvre la modal via data-bs-toggle
			modalElement.classList.add('show');
			modalElement.style.display = 'block';
			document.body.classList.add('modal-open');
		}
	} else {
		console.error('Élément modal #exampleModal introuvable');
	}
}

/**
 * Trouve une voiture dans les données locales par ID
 * @param {string} id - L'ID de la voiture
 * @returns {Object|null} La voiture trouvée ou null
 */
function findCarInLocalDataForEdit(id) {
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
	
	// Cherche dans allCars (les voitures actuellement chargées)
	const carInAllCars = allCars.find(c => String(c.id || c._id) === String(id));
	if (carInAllCars) {
		return carInAllCars;
	}
	
	// Enfin, recherche dans les données mock statiques
	return localCarsdata.find((car, index) => {
		// Si l'ID correspond à l'index ou à un ID spécifique
		return String(index + 1) === String(id) || String(car.id || car._id) === String(id);
	}) || null;
}

/**
 * Récupère les données d'une voiture depuis l'API pour l'édition
 * @param {string} carId - L'ID de la voiture à éditer
 */
async function loadCarForEdit(carId) {
	try {
		console.log('Chargement de la voiture pour édition:', carId);
		
		// Si l'ID commence par "mock-" ou "local-", c'est une voiture locale/démo
		// On ne doit pas essayer de récupérer depuis l'API
		const isLocalId = carId.startsWith('mock-') || carId.startsWith('local-');
		
		let car;
		if (isLocalId) {
			// Recherche directement dans les données locales
			car = findCarInLocalDataForEdit(carId);
			if (!car) {
				throw new Error('Voiture non trouvée dans les données locales');
			}
			console.log('Voiture trouvée dans les données locales:', car);
		} else {
			// Pour les IDs normaux, essaie d'abord l'API
			try {
				car = await fetchCarById(carId);
				console.log('Voiture récupérée depuis l\'API:', car);
			} catch (apiError) {
				console.warn('Erreur API, recherche dans les données locales...', apiError);
				// Fallback vers les données locales
				car = findCarInLocalDataForEdit(carId);
				if (!car) {
					throw apiError; // Relance l'erreur API si pas trouvé localement
				}
				console.log('Voiture trouvée dans les données locales (fallback):', car);
			}
		}
		
		if (!car) {
			throw new Error('Voiture non trouvée');
		}
		populateEditForm(car, carId);
	} catch (error) {
		console.error('Erreur lors du chargement de la voiture:', error);
		showFormAlert('Impossible de charger les données de la voiture.', 'danger');
		showError('Impossible de charger les données de la voiture. Veuillez réessayer.');
	}
}

/**
 * Gère la modification d'une voiture
 * @param {string} carId - L'ID de la voiture à modifier
 */
async function editCarHandler(carId) {
	if (!carId) {
		console.error('ID de voiture manquant');
		showError('ID de voiture manquant pour la modification.');
		return;
	}
	
	try {
		console.log('Édition de la voiture:', carId);
		await loadCarForEdit(carId);
	} catch (error) {
		console.error('Erreur lors de l\'édition:', error);
		showError('Impossible de charger les données de la voiture. Veuillez réessayer.');
	}
}

/**
 * Gère la suppression d'une voiture avec confirmation
 * @param {string} carId - L'ID de la voiture à supprimer
 */
async function deleteCarHandler(carId) {
	if (!carId) {
		console.error('ID de voiture manquant');
		showError('ID de voiture manquant pour la suppression.');
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
		if (isDemoMode) {
			// Mode démo : suppression locale
			const success = deleteLocalCar(carId);
			if (!success) {
				throw new Error('Voiture non trouvée');
			}
			console.log(`Voiture ${carId} supprimée localement`);
			showSuccess('Voiture supprimée avec succès ! (mode démo)');
		} else {
			// Mode API
			await deleteCar(carId);
			console.log(`Voiture ${carId} supprimée avec succès`);
			showSuccess('Voiture supprimée avec succès !');
		}

		// Vide le cache pour forcer le rechargement
		clearCache();

		// Rafraîchit la liste des voitures
		await refreshCarsList();
	} catch (error) {
		console.error('Erreur lors de la suppression:', error);
		showError(`Erreur lors de la suppression de la voiture: ${error.message || 'Erreur inconnue'}`);
	}
}

// Exporte les fonctions au scope global IMMÉDIATEMENT pour qu'elles soient accessibles depuis onclick
// Cela doit être fait AVANT la création des cartes
if (typeof window !== 'undefined') {
	window.editCar = editCarHandler;
	window.deleteCar = deleteCarHandler;
}

/**
 * Crée un élément card Bootstrap pour une voiture
 * @param {Object} car - Les données de la voiture
 * @returns {HTMLElement} L'élément card créé
 */
function createCarCard(car) {
	const article = document.createElement('article');
	article.className = 'card shadow-sm';

	// Formatage du prix
	const formattedPrice = new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(car.price);

	// Construction de l'ID depuis l'URL ou l'ID direct
	const carId = car.id || car._id || extractIdFromUrl(car.imageUrl) || '';

	article.innerHTML = `
		<a href="car.html?id=${carId}" aria-label="Voir les détails de ${car.year} ${car.brand} ${car.model}">
			<img
				src="${car.imageUrl || car.image}"
				class="card-img-top object-fit-fill"
				alt="${car.year} ${car.brand} ${car.model}"
				loading="lazy"
				onerror="this.src='./imgs/classic-cars.jpg'; this.classList.add('loaded')"
				onload="this.classList.add('loaded')"
			/>
		</a>
		<div class="card-body">
			<h5 class="card-title">${car.year} ${car.brand} ${car.model}</h5>
			<p class="card-text">${car.description || 'Voiture de collection'}</p>
			<p class="text-muted"><strong>${formattedPrice}</strong></p>
			<div class="d-flex gap-2">
				<a href="car.html?id=${carId}" class="btn btn-primary flex-fill" aria-label="Voir les détails de ${car.year} ${car.brand} ${car.model}">See more</a>
				<button class="btn btn-warning btn-sm" onclick="window.editCar('${carId}')" title="Modifier" aria-label="Modifier ${car.year} ${car.brand} ${car.model}">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16" aria-hidden="true">
						<path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
					</svg>
				</button>
				<button class="btn btn-danger btn-sm" onclick="window.deleteCar('${carId}')" title="Supprimer" aria-label="Supprimer ${car.year} ${car.brand} ${car.model}">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16" aria-hidden="true">
						<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
						<path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
					</svg>
				</button>
			</div>
		</div>
	`;
	
	// Stocke l'ID dans l'élément pour pouvoir le récupérer plus tard
	article.dataset.carId = carId;

	// Ajoute l'animation fade-in
	article.classList.add('fade-in');
	
	return article;
}

/**
 * Extrait un ID d'une URL si nécessaire (fonction utilitaire)
 */
function extractIdFromUrl(url) {
	// Si l'URL contient un ID, on peut l'extraire
	// Sinon, on retourne null
	return null;
}

/**
 * Affiche toutes les voitures dans la section dédiée
 * @param {Array} cars - Liste des voitures à afficher
 */
function displayCars(cars) {
	const cardContainer = document.querySelector('.card-cont');
	if (!cardContainer) {
		console.error('Conteneur .card-cont introuvable');
		return;
	}

	// Supprime le contenu statique (exemple de carte)
	const existingCards = cardContainer.querySelectorAll('article');
	existingCards.forEach((card) => card.remove());

	// Supprime aussi les alertes existantes
	const existingAlerts = cardContainer.querySelectorAll('.alert');
	existingAlerts.forEach((alert) => alert.remove());

	// Vérifie s'il y a des voitures
	if (!cars || cars.length === 0) {
		cardContainer.innerHTML = `
			<div class="alert alert-info text-center w-100">
				<p class="mb-0">Aucune voiture trouvée.</p>
			</div>
		`;
		return;
	}

	// Crée et ajoute les cartes pour chaque voiture avec animation
	cars.forEach((car, index) => {
		const card = createCarCard(car);
		// Ajoute un délai progressif pour l'animation
		setTimeout(() => {
			cardContainer.appendChild(card);
		}, index * 50); // 50ms entre chaque carte
	});
}

/**
 * Filtre les voitures selon le terme de recherche
 * @param {string} searchTerm - Le terme de recherche
 * @param {Array} cars - La liste des voitures à filtrer
 * @returns {Array} La liste filtrée des voitures
 */
function filterCars(searchTerm, cars) {
	if (!searchTerm || searchTerm.trim() === '') {
		return cars;
	}

	const term = searchTerm.toLowerCase().trim();
	return cars.filter((car) => {
		// Recherche dans plusieurs champs
		const searchableText = [
			car.brand,
			car.model,
			car.year?.toString(),
			car.color,
			car.description,
			car.price?.toString(),
			car.mileage?.toString(),
		]
			.filter(Boolean)
			.join(' ')
			.toLowerCase();

		return searchableText.includes(term);
	});
}

/**
 * Initialise la barre de recherche
 */
function initSearch() {
	const searchInput = document.getElementById('search-input');
	const clearButton = document.getElementById('clear-search-btn');

	if (!searchInput) return;

	// Recherche en temps réel
	searchInput.addEventListener('input', (e) => {
		const searchTerm = e.target.value;
		
		// Affiche/masque le bouton de réinitialisation
		if (clearButton) {
			if (searchTerm.trim() !== '') {
				clearButton.style.display = 'block';
			} else {
				clearButton.style.display = 'none';
			}
		}

		// Filtre et affiche les voitures
		const filteredCars = filterCars(searchTerm, allCars);
		displayCars(filteredCars);

		// Affiche le nombre de résultats
		updateSearchResultsCount(filteredCars.length, allCars.length);
	});

	// Bouton pour effacer la recherche
	if (clearButton) {
		clearButton.style.display = 'none';
		clearButton.addEventListener('click', () => {
			searchInput.value = '';
			clearButton.style.display = 'none';
			displayCars(allCars);
			updateSearchResultsCount(allCars.length, allCars.length);
		});
	}
}

/**
 * Met à jour le compteur de résultats de recherche
 * @param {number} filteredCount - Nombre de résultats filtrés
 * @param {number} totalCount - Nombre total de voitures
 */
function updateSearchResultsCount(filteredCount, totalCount) {
	// Crée ou met à jour l'élément de compteur
	let counterElement = document.getElementById('search-results-count');
	
	if (filteredCount !== totalCount) {
		if (!counterElement) {
			counterElement = document.createElement('p');
			counterElement.id = 'search-results-count';
			counterElement.className = 'text-muted text-center mb-3';
			const searchContainer = document.getElementById('search-input')?.closest('.row');
			if (searchContainer) {
				searchContainer.insertAdjacentElement('afterend', counterElement);
			}
		}
		counterElement.textContent = `${filteredCount} voiture(s) trouvée(s) sur ${totalCount}`;
		counterElement.style.display = 'block';
	} else {
		if (counterElement) {
			counterElement.style.display = 'none';
		}
	}
}

/**
 * Affiche un message d'alerte dans le formulaire
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type d'alerte ('success', 'danger', 'warning', 'info')
 */
function showFormAlert(message, type = 'danger') {
	const alertElement = document.getElementById('form-alert');
	if (!alertElement) return;

	alertElement.className = `alert alert-${type}`;
	alertElement.textContent = message;
	alertElement.classList.remove('d-none');
	
	// Scroll vers l'alerte
	alertElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Cache le message d'alerte du formulaire
 */
function hideFormAlert() {
	const alertElement = document.getElementById('form-alert');
	if (alertElement) {
		alertElement.classList.add('d-none');
	}
}

/**
 * Réinitialise le formulaire
 */
function resetForm() {
	const form = document.getElementById('car-form');
	if (form) {
		form.reset();
		// Supprime les classes de validation
		const inputs = form.querySelectorAll('.form-control');
		inputs.forEach((input) => {
			input.classList.remove('is-invalid', 'is-valid');
		});
		hideFormAlert();
	}
}

/**
 * Active ou désactive le bouton de soumission
 * @param {boolean} isLoading - True pour activer le mode chargement
 */
function setLoadingState(isLoading) {
	const saveButton = document.getElementById('save-car-btn');
	const spinner = document.getElementById('save-spinner');
	const textSpan = document.getElementById('save-text');
	
	if (!saveButton) return;

	if (isLoading) {
		saveButton.disabled = true;
		if (spinner) spinner.classList.remove('d-none');
		if (textSpan) textSpan.textContent = 'Enregistrement...';
	} else {
		saveButton.disabled = false;
		if (spinner) spinner.classList.add('d-none');
		if (textSpan) textSpan.textContent = 'Enregistrer';
	}
}

/**
 * Valide le formulaire avant soumission
 * @param {HTMLFormElement} form - Le formulaire à valider
 * @returns {boolean} True si le formulaire est valide
 */
function validateForm(form) {
	if (!form.checkValidity()) {
		form.classList.add('was-validated');
		return false;
	}
	return true;
}

/**
 * Gère la soumission du formulaire (création ou édition)
 * @param {Event} event - L'événement de soumission
 */
async function handleFormSubmit(event) {
	event.preventDefault();
	event.stopPropagation();

	const form = event.target;
	
	// Cache l'alerte précédente
	hideFormAlert();

	// Valide le formulaire
	if (!validateForm(form)) {
		showFormAlert('Veuillez remplir tous les champs obligatoires correctement.', 'warning');
		return;
	}

	// Récupère les données du formulaire
	const formData = new FormData(form);
	const imageUrl = formData.get('imageUrl')?.trim() || '';
	
	const carData = {
		brand: formData.get('brand').trim(),
		model: formData.get('model').trim(),
		year: parseInt(formData.get('year'), 10),
		color: formData.get('color').trim(),
		price: parseFloat(formData.get('price')),
		mileage: parseInt(formData.get('mileage'), 10),
		description: formData.get('description')?.trim() || '',
		imageUrl: imageUrl || './imgs/classic-cars.jpg', // Image par défaut si non fournie
	};

	// Validation de l'URL si elle est fournie
	if (imageUrl && !isValidUrl(imageUrl)) {
		showFormAlert('L\'URL de l\'image n\'est pas valide.', 'warning');
		return;
	}

	// Validation supplémentaire
	if (carData.year < 1900 || carData.year > new Date().getFullYear() + 1) {
		showFormAlert('L\'année doit être comprise entre 1900 et l\'année actuelle.', 'warning');
		return;
	}

	if (carData.price < 0) {
		showFormAlert('Le prix doit être un nombre positif.', 'warning');
		return;
	}

	if (carData.mileage < 0) {
		showFormAlert('Le kilométrage doit être un nombre positif.', 'warning');
		return;
	}

	// Active le mode chargement
	setLoadingState(true);

	try {
		const carId = form.dataset.editCarId;
		
		if (isDemoMode) {
			// Mode démo : sauvegarde locale
			if (carId) {
				// Mode édition locale
				const updatedCar = updateLocalCar(carId, carData);
				console.log('Voiture mise à jour localement:', updatedCar);
				showFormAlert('Voiture modifiée avec succès ! (mode démo)', 'success');
				showSuccess('Voiture modifiée avec succès ! (mode démo)');
			} else {
				// Mode création locale
				const newCar = addLocalCar(carData);
				console.log('Voiture créée localement:', newCar);
				showFormAlert('Voiture ajoutée avec succès ! (mode démo)', 'success');
				showSuccess('Voiture ajoutée avec succès ! (mode démo)');
			}
		} else {
			// Mode API
			if (carId) {
				// Mode édition : mise à jour via API
				const updatedCar = await updateCar(carId, carData);
				console.log('Voiture mise à jour avec succès:', updatedCar);
				showFormAlert('Voiture modifiée avec succès !', 'success');
				showSuccess('Voiture modifiée avec succès !');
			} else {
				// Mode création : création via API
				const newCar = await createCar(carData);
				console.log('Voiture créée avec succès:', newCar);
				console.log('ID de la nouvelle voiture:', newCar?.id || newCar?._id);
				showFormAlert('Voiture ajoutée avec succès !', 'success');
				showSuccess('Voiture ajoutée avec succès !');
			}
		}

		// Réinitialise le formulaire
		resetForm();
		resetFormToCreateMode();
		form.classList.remove('was-validated');

		// Ferme la modal immédiatement
		const modalElement = document.getElementById('exampleModal');
		if (modalElement) {
			const modal = bootstrap.Modal.getInstance(modalElement);
			if (modal) {
				modal.hide();
			}
		}

		// Vide le cache pour forcer le rechargement
		clearCache();
		console.log('Cache vidé, rechargement de la liste...');

		// Rafraîchit la liste des voitures
		console.log('Début du rechargement de la liste...');
		await refreshCarsList();
		console.log('Rechargement terminé.');
	} catch (error) {
		console.error('Erreur lors de la sauvegarde:', error);
		const errorMessage = error.message || 'Une erreur est survenue. Veuillez réessayer.';
		showFormAlert(errorMessage, 'danger');
		showError(errorMessage);
	} finally {
		// Désactive le mode chargement
		setLoadingState(false);
	}
}

/**
 * Initialise les gestionnaires d'événements du formulaire
 */
function initFormHandlers() {
	const form = document.getElementById('car-form');
	if (!form) {
		console.warn('Formulaire car-form introuvable');
		return;
	}

	console.log('Initialisation des gestionnaires du formulaire...');

	// Gère la soumission du formulaire
	form.addEventListener('submit', (event) => {
		console.log('Événement submit détecté');
		event.preventDefault();
		event.stopPropagation();
		handleFormSubmit(event);
	});

	// Gère aussi le clic sur le bouton Enregistrer
	const saveButton = document.getElementById('save-car-btn');
	if (saveButton) {
		saveButton.addEventListener('click', (event) => {
			console.log('Clic sur le bouton Enregistrer');
			event.preventDefault();
			// Déclenche la soumission du formulaire
			const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
			form.dispatchEvent(submitEvent);
		});
	}

	// Réinitialise le formulaire quand la modal est fermée
	const modalElement = document.getElementById('exampleModal');
	if (modalElement) {
		modalElement.addEventListener('hidden.bs.modal', () => {
			resetForm();
			resetFormToCreateMode();
		});
		
		// Réinitialise en mode création quand la modal s'ouvre sans ID d'édition
		modalElement.addEventListener('show.bs.modal', () => {
			if (!form.dataset.editCarId) {
				resetFormToCreateMode();
			}
		});
	}

	// Masque l'alerte lors de la modification des champs
	const inputs = form.querySelectorAll('input, textarea');
	inputs.forEach((input) => {
		input.addEventListener('input', () => {
			hideFormAlert();
		});
	});

	console.log('Gestionnaires du formulaire initialisés avec succès');
}

/**
 * Affiche ou cache le spinner de chargement
 * @param {boolean} show - True pour afficher, false pour cacher
 */
function setLoadingSpinner(show) {
	const spinner = document.getElementById('loading-spinner');
	if (spinner) {
		if (show) {
			spinner.classList.remove('d-none');
		} else {
			spinner.classList.add('d-none');
		}
	}
}

/**
 * Affiche les statistiques des voitures
 * @param {Array} cars - La liste des voitures à analyser
 */
function displayStats(cars) {
	const statsSection = document.getElementById('stats-section');
	const statsContent = document.getElementById('stats-content');
	
	if (!statsSection || !statsContent || !cars || cars.length === 0) {
		if (statsSection) statsSection.style.display = 'none';
		return;
	}

	const stats = calculateStats(cars);
	const formattedAvgPrice = new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(stats.averagePrice);

	const formattedMinPrice = new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(stats.minPrice);

	const formattedMaxPrice = new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0,
	}).format(stats.maxPrice);

	statsContent.innerHTML = `
		<div class="col-md-3 col-6 mb-3 mb-md-0">
			<div class="text-muted small">Total</div>
			<div class="h4 mb-0">${stats.total}</div>
			<div class="text-muted small">voiture(s)</div>
		</div>
		<div class="col-md-3 col-6 mb-3 mb-md-0">
			<div class="text-muted small">Prix moyen</div>
			<div class="h4 mb-0">${formattedAvgPrice}</div>
			<div class="text-muted small">${formattedMinPrice} - ${formattedMaxPrice}</div>
		</div>
		<div class="col-md-3 col-6">
			<div class="text-muted small">Année moyenne</div>
			<div class="h4 mb-0">${stats.averageYear || '-'}</div>
			<div class="text-muted small">année(s)</div>
		</div>
		<div class="col-md-3 col-6">
			<div class="text-muted small">Kilométrage moyen</div>
			<div class="h4 mb-0">${stats.averageMileage ? formatNumber(stats.averageMileage) : '-'}</div>
			<div class="text-muted small">km</div>
		</div>
	`;

	statsSection.style.display = 'block';
}

/**
 * Initialise les gestionnaires d'export
 */
function initExport() {
	const exportJsonBtn = document.getElementById('export-json-btn');
	const exportCsvBtn = document.getElementById('export-csv-btn');

	if (exportJsonBtn) {
		exportJsonBtn.addEventListener('click', () => {
			const carsToExport = applyFiltersAndSort(allCars);
			if (carsToExport.length === 0) {
				showWarning('Aucune voiture à exporter.');
				return;
			}

			const success = exportToJSON(carsToExport);
			if (success) {
				showSuccess(`Export réussi : ${carsToExport.length} voiture(s) exportée(s) en JSON.`);
			} else {
				showError('Erreur lors de l\'export en JSON.');
			}
		});
	}

	if (exportCsvBtn) {
		exportCsvBtn.addEventListener('click', () => {
			const carsToExport = applyFiltersAndSort(allCars);
			if (carsToExport.length === 0) {
				showWarning('Aucune voiture à exporter.');
				return;
			}

			const success = exportToCSV(carsToExport);
			if (success) {
				showSuccess(`Export réussi : ${carsToExport.length} voiture(s) exportée(s) en CSV.`);
			} else {
				showError('Erreur lors de l\'export en CSV.');
			}
		});
	}
}

/**
 * Rafraîchit la liste des voitures depuis l'API ou le stockage local
 */
async function refreshCarsList() {
	setLoadingSpinner(true);
	
	try {
		let cars;
		
		if (isDemoMode) {
			// Mode démo : récupère depuis le stockage local
			console.log('Rechargement depuis le stockage local (mode démo)...');
			cars = getLocalCars();
			console.log('Voitures récupérées localement:', cars);
		} else {
			// Mode API : récupère depuis l'API
			console.log('Rechargement forcé depuis l\'API...');
			cars = await fetchAllCars();
			console.log('Voitures récupérées depuis l\'API:', cars);
			
			// Met en cache les nouvelles données
			if (cars && cars.length > 0) {
				setCachedData(cars);
			}
		}
		
		console.log('Nombre de voitures:', cars?.length || 0);
		
		// Stocke toutes les voitures (non filtrées)
		allCars = cars || [];
		console.log('Voitures stockées dans allCars:', allCars.length);
		
		// Applique les filtres et le tri
		const carsToDisplay = applyFiltersAndSort(allCars);
		console.log('Voitures à afficher après filtres/tri:', carsToDisplay.length);
		
		// Affiche les voitures
		displayCars(carsToDisplay);
		
		// Affiche les statistiques
		displayStats(allCars);
		
		// Met à jour le compteur
		updateSearchResultsCount(carsToDisplay.length, allCars.length);
	} catch (error) {
		console.error('Erreur lors du rechargement:', error);
		showError('Erreur lors du rechargement de la liste. Veuillez actualiser la page.');
	} finally {
		setLoadingSpinner(false);
	}
}

/**
 * Initialise l'application : récupère et affiche les voitures
 */
async function init() {
	setLoadingSpinner(true);
	
	try {
		// Vérifie d'abord le cache
		let cars = getCachedData();
		
		if (!cars) {
			// Essaie de récupérer les données depuis l'API
			cars = await fetchAllCars();
			console.log('Voitures récupérées depuis l\'API:', cars);
			isDemoMode = false;
			
			// Met en cache les données
			if (cars && cars.length > 0) {
				setCachedData(cars);
			}
		} else {
			console.log('Voitures récupérées depuis le cache');
			showInfo('Données chargées depuis le cache.');
		}
		
		// Stocke toutes les voitures (non filtrées)
		allCars = cars || [];
		
		// Applique les filtres et le tri
		const carsToDisplay = applyFiltersAndSort(allCars);
		displayCars(carsToDisplay);
		
		// Affiche les statistiques
		displayStats(allCars);
		
		// Met à jour le compteur
		updateSearchResultsCount(carsToDisplay.length, allCars.length);
	} catch (error) {
		console.error('Erreur lors de la récupération depuis l\'API:', error);
		console.warn('Activation du mode démo (données locales)');
		
		// Active le mode démo
		isDemoMode = true;
		
		// Récupère les voitures déjà ajoutées localement
		const localCars = getLocalCars();
		
		// Combine les données de mock avec les voitures ajoutées localement
		// Les voitures locales doivent avoir des IDs pour éviter les doublons
		const mockCarsWithIds = localCarsdata.map((car, index) => ({
			...car,
			id: car.id || `mock-${index + 1}`,
			_id: car._id || `mock-${index + 1}`,
		}));
		
		// Si pas de voitures locales, initialise avec les données de mock
		if (localCars.length === 0) {
			setLocalCars(mockCarsWithIds);
			allCars = mockCarsWithIds;
		} else {
			allCars = localCars;
		}
		
		const carsToDisplay = applyFiltersAndSort(allCars);
		displayCars(carsToDisplay);
		displayStats(allCars);
		updateSearchResultsCount(carsToDisplay.length, allCars.length);
		
		showWarning('Mode démo activé. Les données sont stockées localement dans votre navigateur.');
	} finally {
		setLoadingSpinner(false);
	}
}

/**
 * Initialise toute l'application
 */
function appInit() {
	// Initialise les gestionnaires d'événements du formulaire
	initFormHandlers();

	// Initialise la barre de recherche
	initSearch();

	// Initialise le tri
	initSort();

	// Initialise l'export
	initExport();

	// Initialise la prévisualisation de l'image
	initImagePreview();

	// Si on vient de car.html avec ?edit=id, ouvre la modal d'édition après chargement
	const urlParams = new URLSearchParams(window.location.search);
	const editId = urlParams.get('edit');
	
	// Charge et affiche les voitures, puis ouvre la modal d'édition si nécessaire
	if (editId) {
		console.log('Paramètre edit détecté dans l\'URL:', editId);
	}
	
	init().then(() => {
		if (editId) {
			// Attendre que tout soit bien initialisé (DOM, Bootstrap, données)
			setTimeout(() => {
				console.log('Tentative d\'ouverture de la modal d\'édition pour:', editId);
				if (window.editCar && typeof window.editCar === 'function') {
					window.editCar(editId);
				} else {
					console.error('window.editCar n\'est pas défini ou n\'est pas une fonction');
					console.log('window.editCar:', window.editCar);
				}
			}, 1000); // Augmenté à 1 seconde pour être sûr que tout est chargé
		}
	}).catch((error) => {
		console.error('Erreur lors du chargement des voitures:', error);
		// Même en cas d'erreur, on essaie d'ouvrir la modal
		if (editId) {
			setTimeout(() => {
				if (window.editCar && typeof window.editCar === 'function') {
					console.log('Ouverture de la modal après erreur pour:', editId);
					window.editCar(editId);
				} else if (typeof loadCarForEdit === 'function') {
					console.log('Utilisation de loadCarForEdit directement pour:', editId);
					loadCarForEdit(editId);
				}
			}, 1000);
		}
	});
}

// Initialise l'application quand le DOM est chargé
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', appInit);
} else {
	appInit();
}

/**
 * Réinitialise le formulaire en mode création
 */
function resetFormToCreateMode() {
	const form = document.getElementById('car-form');
	if (form) {
		// Supprime l'ID d'édition
		delete form.dataset.editCarId;
	}

	// Remet le titre de la modal
	const modalTitle = document.getElementById('exampleModalLabel');
	if (modalTitle) {
		modalTitle.textContent = 'Ajouter une nouvelle voiture';
	}

	// Remet le texte du bouton
	const saveText = document.getElementById('save-text');
	if (saveText) {
		saveText.textContent = 'Enregistrer';
	}
}

/**
 * Trie les voitures selon le critère sélectionné
 * @param {Array} cars - La liste des voitures à trier
 * @param {string} sortBy - Le critère de tri (ex: 'brand-asc', 'price-desc')
 * @returns {Array} La liste triée des voitures
 */
function sortCars(cars, sortBy) {
	if (!sortBy || sortBy === '') {
		return cars;
	}

	const [field, direction] = sortBy.split('-');
	const multiplier = direction === 'asc' ? 1 : -1;

	return [...cars].sort((a, b) => {
		let valueA = a[field];
		let valueB = b[field];

		// Gère les valeurs null/undefined
		if (valueA == null) return 1;
		if (valueB == null) return -1;

		// Convertit en minuscules pour les chaînes
		if (typeof valueA === 'string') valueA = valueA.toLowerCase();
		if (typeof valueB === 'string') valueB = valueB.toLowerCase();

		if (valueA < valueB) return -1 * multiplier;
		if (valueA > valueB) return 1 * multiplier;
		return 0;
	});
}

/**
 * Initialise le tri
 */
function initSort() {
	const sortSelect = document.getElementById('sort-select');
	const clearSortBtn = document.getElementById('clear-sort-btn');

	if (!sortSelect) return;

	sortSelect.addEventListener('change', (e) => {
		currentSort = e.target.value;

		// Affiche/masque le bouton de réinitialisation
		if (clearSortBtn) {
			clearSortBtn.style.display = currentSort ? 'block' : 'none';
		}

		// Applique les filtres et le tri, puis affiche
		const carsToDisplay = applyFiltersAndSort(allCars);
		displayCars(carsToDisplay);
	});

	if (clearSortBtn) {
		clearSortBtn.addEventListener('click', () => {
			sortSelect.value = '';
			currentSort = '';
			clearSortBtn.style.display = 'none';

			// Applique les filtres et le tri, puis affiche
			const carsToDisplay = applyFiltersAndSort(allCars);
			displayCars(carsToDisplay);
		});
	}
}

/**
 * Applique les filtres et le tri sur les voitures
 * @param {Array} cars - La liste des voitures
 * @returns {Array} La liste filtrée et triée
 */
function applyFiltersAndSort(cars) {
	const searchInput = document.getElementById('search-input');
	const searchTerm = searchInput ? searchInput.value : '';

	// Applique le filtre de recherche
	let result = filterCars(searchTerm, cars);

	// Applique le tri
	result = sortCars(result, currentSort);

	return result;
}

/**
 * Initialise la prévisualisation de l'image dans le formulaire
 */
function initImagePreview() {
	const imageUrlInput = document.getElementById('car-imageUrl');
	const imagePreview = document.getElementById('imagePreview');
	const imagePreviewImg = document.getElementById('imagePreviewImg');
	const imagePreviewError = document.getElementById('imagePreviewError');

	if (!imageUrlInput || !imagePreview || !imagePreviewImg) return;

	let debounceTimer;

	imageUrlInput.addEventListener('input', (e) => {
		const url = e.target.value.trim();

		// Annule le timer précédent
		clearTimeout(debounceTimer);

		if (!url) {
			imagePreview.style.display = 'none';
			return;
		}

		// Attend 500ms avant de charger l'image (debounce)
		debounceTimer = setTimeout(() => {
			imagePreview.style.display = 'block';
			if (imagePreviewError) imagePreviewError.style.display = 'none';

			imagePreviewImg.onload = () => {
				imagePreviewImg.style.display = 'block';
				if (imagePreviewError) imagePreviewError.style.display = 'none';
			};

			imagePreviewImg.onerror = () => {
				imagePreviewImg.style.display = 'none';
				if (imagePreviewError) imagePreviewError.style.display = 'block';
			};

			imagePreviewImg.src = url;
		}, 500);
	});
}

// Export pour utilisation dans d'autres modules si nécessaire
export { createCarCard, displayCars, init };
