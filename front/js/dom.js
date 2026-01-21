/**
 * Module de manipulation du DOM
 * Contient les fonctions de création et mise à jour des éléments HTML
 */

/**
 * Crée un élément card Bootstrap pour une voiture
 * @param {Object} car - Les données de la voiture
 * @param {Object} handlers - Les gestionnaires d'événements { onEdit, onDelete }
 * @returns {HTMLElement} L'élément card créé
 */
export function createCarCard(car, handlers = {}) {
	const article = document.createElement('article');
	article.className = 'card shadow-sm';

	// Formatage du prix
	const formattedPrice = formatPrice(car.price);

	// Construction de l'ID depuis l'URL ou l'ID direct
	const carId = car.id || car._id || '';

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
				<button class="btn btn-warning btn-sm edit-btn" data-car-id="${carId}" title="Modifier" aria-label="Modifier ${car.year} ${car.brand} ${car.model}">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16" aria-hidden="true">
						<path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
					</svg>
				</button>
				<button class="btn btn-danger btn-sm delete-btn" data-car-id="${carId}" title="Supprimer" aria-label="Supprimer ${car.year} ${car.brand} ${car.model}">
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

	// Ajoute les gestionnaires d'événements si fournis
	if (handlers.onEdit) {
		const editBtn = article.querySelector('.edit-btn');
		if (editBtn) {
			editBtn.addEventListener('click', () => handlers.onEdit(carId));
		}
	}

	if (handlers.onDelete) {
		const deleteBtn = article.querySelector('.delete-btn');
		if (deleteBtn) {
			deleteBtn.addEventListener('click', () => handlers.onDelete(carId));
		}
	}

	return article;
}

/**
 * Affiche toutes les voitures dans la section dédiée
 * @param {Array} cars - Liste des voitures à afficher
 * @param {Object} handlers - Les gestionnaires d'événements { onEdit, onDelete }
 */
export function displayCars(cars, handlers = {}) {
	const cardContainer = document.querySelector('.card-cont');
	if (!cardContainer) {
		console.error('Conteneur .card-cont introuvable');
		return;
	}

	// Supprime le contenu existant
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
		const card = createCarCard(car, handlers);
		// Ajoute un délai progressif pour l'animation
		setTimeout(() => {
			cardContainer.appendChild(card);
		}, index * 50); // 50ms entre chaque carte
	});
}

/**
 * Affiche les détails d'une voiture dans la page de détail
 * @param {Object} car - Les données de la voiture
 */
export function displayCarDetails(car) {
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
	updateElementText('car-year', car.year);
	updateElementText('car-brand', car.brand);
	updateElementText('car-model', car.model);
	updateElementText('car-color', car.color);
	updateElementText('car-mileage', car.mileage ? formatMileage(car.mileage) : '-');
	updateElementText('car-description', car.description || 'Aucune description disponible');
	updateElementText('car-price', car.price ? formatPrice(car.price) : '-');
}

/**
 * Affiche un message d'erreur dans la page
 * @param {string} message - Le message d'erreur à afficher
 */
export function displayError(message) {
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
export function displayLoading() {
	const titleElement = document.getElementById('car-title');
	if (titleElement) {
		titleElement.textContent = 'Chargement...';
	}
}

/**
 * Affiche ou cache le spinner de chargement
 * @param {boolean} show - True pour afficher, false pour cacher
 */
export function setLoadingSpinner(show) {
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
 * Met à jour le texte d'un élément par son ID
 * @param {string} elementId - L'ID de l'élément
 * @param {string} text - Le texte à afficher
 */
export function updateElementText(elementId, text) {
	const element = document.getElementById(elementId);
	if (element) {
		element.textContent = text || '-';
	}
}

/**
 * Affiche un message d'alerte dans le formulaire
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type d'alerte ('success', 'danger', 'warning', 'info')
 */
export function showFormAlert(message, type = 'danger') {
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
export function hideFormAlert() {
	const alertElement = document.getElementById('form-alert');
	if (alertElement) {
		alertElement.classList.add('d-none');
	}
}

/**
 * Active ou désactive le bouton de soumission
 * @param {boolean} isLoading - True pour activer le mode chargement
 */
export function setButtonLoading(isLoading) {
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
 * Affiche les statistiques des voitures
 * @param {Object} stats - Les statistiques calculées
 */
export function displayStats(stats) {
	const statsSection = document.getElementById('stats-section');
	const statsContent = document.getElementById('stats-content');

	if (!statsSection || !statsContent || !stats || stats.total === 0) {
		if (statsSection) statsSection.style.display = 'none';
		return;
	}

	const formattedAvgPrice = formatPrice(stats.averagePrice);
	const formattedMinPrice = formatPrice(stats.minPrice);
	const formattedMaxPrice = formatPrice(stats.maxPrice);

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
			<div class="h4 mb-0">${stats.averageMileage ? new Intl.NumberFormat('fr-FR').format(stats.averageMileage) : '-'}</div>
			<div class="text-muted small">km</div>
		</div>
	`;

	statsSection.style.display = 'block';
}

/**
 * Met à jour le compteur de résultats de recherche
 * @param {number} filteredCount - Nombre de résultats filtrés
 * @param {number} totalCount - Nombre total de voitures
 */
export function updateSearchResultsCount(filteredCount, totalCount) {
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

// ============================================
// Fonctions utilitaires de formatage (privées)
// ============================================

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
	}).format(price || 0);
}

/**
 * Formate le kilométrage
 * @param {number} mileage - Le kilométrage à formater
 * @returns {string} Le kilométrage formaté
 */
function formatMileage(mileage) {
	return new Intl.NumberFormat('fr-FR').format(mileage) + ' km';
}
