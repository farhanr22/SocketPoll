import axios from 'axios';

import {
  pollResultsSchema,
  voteSuccessSchema,
  pollPublicSchema,
  pollCreatedSchema,
  emptySuccessSchema
} from '../schemas';

// Create base URL
const useSecureProtocols = import.meta.env.VITE_USE_SECURE_PROTOCOLS === 'true';
const httpProtocol = useSecureProtocols ? 'https://' : 'http://';
const baseURL = httpProtocol + import.meta.env.VITE_API_BASE_URL;

// Axios instance with base URL
const apiClient = axios.create({
  baseURL: baseURL,
});


// Helper function to wrap API calls with a standardized flow
// Call API -> Validate response -> Parse error (if any) -> return standardized object
const apiRequest = async (request, schema) => {
  try {
    const response = await request();
    if (response.status === 204) {
      return { success: true, data: null, error: null };
    }
    const validatedData = schema.parse(response.data);
    return { success: true, data: validatedData, error: null };
  }
  catch (error) {
    const errorMessage = parseError(error);
    return { success: false, data: null, error: errorMessage };
  }
};


/**
 * Parses an Axios error object to extract a user-friendly error message.
 * @param {object} error - The Axios error object.
 * @returns {string} A user-friendly error message.
 */
const parseError = (error) => {
  let errorMessage = "An unexpected error occurred. Please try again.";

  // Check for validation errors from Zod
  if (Array.isArray(error.issues)) {
    // Build a response string
    errorMessage = `Response validation failed: ${error.issues.map(e => e.message).join(', ')}`;
  }
  // Extract error from FastAPI validation error response body
  else if (error.response?.data?.detail) {
    const { detail } = error.response.data;
    if (Array.isArray(detail)) {
      errorMessage = detail.map(d => d.msg).join(' ');
    } else if (typeof detail === 'string') {
      errorMessage = detail;
    }
  }

  return errorMessage;
};


/**
 * Creates a new poll.
 * @param {object} pollData - The data for the new poll.
 * @returns {Promise<{success: boolean, data: object|null, error: string|null}>} The result object.
 */
export const createPoll = async (pollData) => {
  return apiRequest(() => apiClient.post('/polls', pollData), pollCreatedSchema);
};


/**
 * Fetches the public data for a single poll.
 * @param {string} pollId - The ID of the poll to fetch.
 * @returns {Promise<{success: boolean, data: object|null, error: string|null}>} The result object.
 */
export const getPoll = async (pollId) => {
  return apiRequest(() => apiClient.get(`/polls/${pollId}`), pollPublicSchema);
};


/**
 * Fetches the results data for a single poll.
 * @param {string} pollId - The ID of the poll to fetch.
 * @param {string|null} creatorKey - The secret key, if available.
 * @returns {Promise<{success: boolean, data: object|null, error: string|null}>} The result object.
 */
export const getPollResults = async (pollId, creatorKey) => {
  const headers = creatorKey ? { 'X-Creator-Key': creatorKey } : {};
  return apiRequest(() => apiClient.get(`/polls/${pollId}/results`, { headers }), pollResultsSchema);
};


/**
 * Submits a vote for a poll.
 * @param {string} pollId - The ID of the poll being voted on.
 * @param {object} voteData - The payload for the vote.
 * @returns {Promise<{success: boolean, data: object|null, error: string|null}>} The result object.
 */
export const castVote = async (pollId, voteData) => {
  return apiRequest(() => apiClient.post(`/polls/${pollId}/vote`, voteData), voteSuccessSchema);
};


/**
 * Deletes a poll.
 * @param {string} pollId - The ID of the poll to delete.
 * @param {string} creatorKey - The secret key for the poll.
 * @returns {Promise<{success: boolean, data: null, error: string|null}>} The result object.
 */
export const deletePoll = async (pollId, creatorKey) => {
  const headers = { 'X-Creator-Key': creatorKey };
  return apiRequest(() => apiClient.delete(`/polls/${pollId}`, { headers }), emptySuccessSchema);
};