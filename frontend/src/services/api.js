import axios from 'axios';

// Axios instance with base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

/**
 * Creates a new poll by sending data to the backend API.
 * @param {object} pollData - The data for the new poll.
 * @returns {Promise<object>} The created poll data (poll_id, creator_key, question, active_until, expire_at).
 */
export const createPoll = async (pollData) => {
  try {
    const response = await apiClient.post('/polls', pollData);
    return response.data;
  } catch (error) {
    // Re-throw the error so the component can handle it
    throw error;
  }
};