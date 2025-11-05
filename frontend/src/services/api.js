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

/**
 * Deletes a poll from the backend.
 * @param {string} pollId - The ID of the poll to delete.
 * @param {string} creatorKey - The secret key for the poll.
 * @returns {Promise<void>}
 */
export const deletePoll = async (pollId, creatorKey) => {
  try {
    await apiClient.delete(`/polls/${pollId}`, {
      headers: {
        'X-Creator-Key': creatorKey,
      },
    });
  } catch (error) {
    throw error;
  }
};


/**
 * Fetches the public data for a single poll.
 * @param {string} pollId - The ID of the poll to fetch.
 * @returns {Promise<object>} The public poll data.
 */
export const getPoll = async (pollId) => {
  try {
    const response = await apiClient.get(`/polls/${pollId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Submits a vote for a poll.
 * @param {string} pollId - The ID of the poll being voted on.
 * @param {object} voteData - The payload for the vote.
 * @returns {Promise<object>} The success response from the API.
 */
export const castVote = async (pollId, voteData) => {
  try {
    const response = await apiClient.post(`/polls/${pollId}/vote`, voteData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches the results data for a single poll.
 * @param {string} pollId - The ID of the poll to fetch.
 * @param {string|null} creatorKey - The secret key, if available.
 * @returns {Promise<object>} The poll results data.
 */
export const getPollResults = async (pollId, creatorKey) => {
  try {
    // Conditionally add the header if the key exists
    const headers = creatorKey ? { 'X-Creator-Key': creatorKey } : {};
    const response = await apiClient.get(`/polls/${pollId}/results`, { headers });
    return response.data;
  } catch (error) {
    throw error;
  }
};