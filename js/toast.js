/**
 * Module de gestion des notifications toast
 */

/**
 * Crée et affiche une notification toast
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type de toast ('success', 'error', 'warning', 'info')
 * @param {number} duration - Durée d'affichage en millisecondes (défaut: 5000)
 */
export function showToast(message, type = 'info', duration = 5000) {
	const container = document.getElementById('toast-container');
	if (!container) {
		console.warn('Container toast introuvable');
		return;
	}

	// Crée un ID unique pour le toast
	const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	
	// Détermine les classes et l'icône selon le type
	const typeConfig = {
		success: {
			bgClass: 'bg-success',
			textClass: 'text-white',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-circle-fill me-2" viewBox="0 0 16 16">
				<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 2.384 5.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
			</svg>`,
		},
		error: {
			bgClass: 'bg-danger',
			textClass: 'text-white',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
				<path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
			</svg>`,
		},
		warning: {
			bgClass: 'bg-warning',
			textClass: 'text-dark',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-exclamation-circle-fill me-2" viewBox="0 0 16 16">
				<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 1 0-.9.995c.35 3.507.35 3.507.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
			</svg>`,
		},
		info: {
			bgClass: 'bg-info',
			textClass: 'text-white',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-info-circle-fill me-2" viewBox="0 0 16 16">
				<path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
			</svg>`,
		},
	};

	const config = typeConfig[type] || typeConfig.info;

	// Crée l'élément toast
	const toastElement = document.createElement('div');
	toastElement.className = `toast ${config.bgClass} ${config.textClass}`;
	toastElement.id = toastId;
	toastElement.setAttribute('role', 'alert');
	toastElement.setAttribute('aria-live', 'assertive');
	toastElement.setAttribute('aria-atomic', 'true');
	
	toastElement.innerHTML = `
		<div class="toast-header ${config.bgClass} ${config.textClass} border-0">
			${config.icon}
			<strong class="me-auto">Notification</strong>
			<button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Fermer"></button>
		</div>
		<div class="toast-body">
			${message}
		</div>
	`;

	// Ajoute le toast au container
	container.appendChild(toastElement);

	// Initialise et affiche le toast Bootstrap
	const toast = new bootstrap.Toast(toastElement, {
		autohide: true,
		delay: duration,
	});

	// Supprime le toast du DOM après qu'il soit caché
	toastElement.addEventListener('hidden.bs.toast', () => {
		toastElement.remove();
	});

	toast.show();

	return toast;
}

/**
 * Affiche une notification de succès
 * @param {string} message - Le message de succès
 */
export function showSuccess(message) {
	return showToast(message, 'success');
}

/**
 * Affiche une notification d'erreur
 * @param {string} message - Le message d'erreur
 */
export function showError(message) {
	return showToast(message, 'error', 7000); // Les erreurs restent plus longtemps
}

/**
 * Affiche une notification d'avertissement
 * @param {string} message - Le message d'avertissement
 */
export function showWarning(message) {
	return showToast(message, 'warning');
}

/**
 * Affiche une notification d'information
 * @param {string} message - Le message d'information
 */
export function showInfo(message) {
	return showToast(message, 'info');
}
