/**
 * This module handles all communication with the backend API.
 */

const API_BASE_URL = '/api';

/**
 * Plans a route by fetching data from the backend.
 * @param {string} from - The starting location.
 * @param {string} to - The destination location.
 * @returns {Promise<Array>} A promise that resolves to an array of routes.
 */
export async function planRoute(from, to) {
    try {
        const response = await fetch(`${API_BASE_URL}/routes/plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ from, to }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error planning route:', error);
        // Return an empty array or handle the error as needed
        return [];
    }
}
