/**
 * Module d'utilitaires généraux
 */

/**
 * Valide une URL d'image
 * @param {string} url - L'URL à valider
 * @returns {Promise<boolean>} True si l'URL est valide
 */
export function validateImageUrl(url) {
	return new Promise((resolve) => {
		if (!url || typeof url !== 'string') {
			resolve(false);
			return;
		}

		// Vérifie que c'est une URL valide
		try {
			new URL(url);
		} catch {
			resolve(false);
			return;
		}

		// Crée une image pour tester si l'URL pointe vers une image valide
		const img = new Image();
		
		img.onload = () => resolve(true);
		img.onerror = () => resolve(false);
		
		// Timeout après 5 secondes
		setTimeout(() => resolve(false), 5000);
		
		img.src = url;
	});
}

/**
 * Exporte les données en JSON
 * @param {Array} data - Les données à exporter
 * @param {string} filename - Le nom du fichier (défaut: 'classic-cars.json')
 */
export function exportToJSON(data, filename = 'classic-cars.json') {
	try {
		const jsonString = JSON.stringify(data, null, 2);
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		
		// Libère l'URL de l'objet
		setTimeout(() => URL.revokeObjectURL(url), 100);
		
		return true;
	} catch (error) {
		console.error('Erreur lors de l\'export JSON:', error);
		return false;
	}
}

/**
 * Exporte les données en CSV
 * @param {Array} data - Les données à exporter
 * @param {string} filename - Le nom du fichier (défaut: 'classic-cars.csv')
 */
export function exportToCSV(data, filename = 'classic-cars.csv') {
	try {
		if (!data || data.length === 0) {
			return false;
		}

		// En-têtes CSV
		const headers = ['Année', 'Marque', 'Modèle', 'Couleur', 'Prix (€)', 'Kilométrage', 'Description', 'URL Image'];
		
		// Lignes de données
		const rows = data.map((car) => {
			return [
				car.year || '',
				car.brand || '',
				car.model || '',
				car.color || '',
				car.price || '',
				car.mileage || '',
				(car.description || '').replace(/"/g, '""'), // Échappe les guillemets
				car.imageUrl || car.image || '',
			].map((cell) => `"${cell}"`).join(',');
		});

		// Combine en-têtes et lignes
		const csvContent = [headers.map((h) => `"${h}"`).join(','), ...rows].join('\n');

		// Crée et télécharge le fichier
		const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM pour Excel
		const url = URL.createObjectURL(blob);
		
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		
		// Libère l'URL de l'objet
		setTimeout(() => URL.revokeObjectURL(url), 100);
		
		return true;
	} catch (error) {
		console.error('Erreur lors de l\'export CSV:', error);
		return false;
	}
}

/**
 * Calcule les statistiques d'une liste de voitures
 * @param {Array} cars - La liste des voitures
 * @returns {Object} Les statistiques
 */
export function calculateStats(cars) {
	if (!cars || cars.length === 0) {
		return {
			total: 0,
			averagePrice: 0,
			minPrice: 0,
			maxPrice: 0,
			averageYear: 0,
			totalMileage: 0,
			averageMileage: 0,
		};
	}

	const prices = cars.map((c) => c.price || 0).filter((p) => p > 0);
	const years = cars.map((c) => c.year || 0).filter((y) => y > 0);
	const mileages = cars.map((c) => c.mileage || 0).filter((m) => m > 0);

	return {
		total: cars.length,
		averagePrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
		minPrice: prices.length > 0 ? Math.min(...prices) : 0,
		maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
		averageYear: years.length > 0 ? Math.round(years.reduce((a, b) => a + b, 0) / years.length) : 0,
		totalMileage: mileages.reduce((a, b) => a + b, 0),
		averageMileage: mileages.length > 0 ? Math.round(mileages.reduce((a, b) => a + b, 0) / mileages.length) : 0,
	};
}

/**
 * Formate un nombre avec séparateurs de milliers
 * @param {number} number - Le nombre à formater
 * @returns {string} Le nombre formaté
 */
export function formatNumber(number) {
	return new Intl.NumberFormat('fr-FR').format(number);
}
