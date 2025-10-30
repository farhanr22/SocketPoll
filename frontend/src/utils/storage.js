// Poll object fields : poll_id, creator_key, question, active_until, expire_at

// localStorage key for this app
const POLLS_STORAGE_KEY = 'quickPoll';

/**
 * Retrieves the list of user-created polls from localStorage.
 * @returns {Array} An array of poll objects.
 */
export const getMyPolls = () => {
  try {
    const storedPolls = localStorage.getItem(POLLS_STORAGE_KEY);
    return storedPolls ? JSON.parse(storedPolls) : [];
  } catch (error) {
    console.error("Failed to parse polls from localStorage", error);
    return [];
  }
};

/**
 * Saves a new poll to the list in localStorage.
 * @param {object} newPoll - The new poll data object.
 */
export const savePoll = (newPoll) => {
  const currentPolls = getMyPolls();
  const updatedPolls = [...currentPolls, newPoll];
  localStorage.setItem(POLLS_STORAGE_KEY, JSON.stringify(updatedPolls));
  return updatedPolls;
};

/**
 * Removes a poll from localStorage by its poll_id.
 * @param {string} pollIdToRemove - The ID of the poll to remove.
 */
export const removePoll = (pollIdToRemove) => {
  const currentPolls = getMyPolls();
  const updatedPolls = currentPolls.filter(
    (poll) => poll.poll_id !== pollIdToRemove
  );
  localStorage.setItem(POLLS_STORAGE_KEY, JSON.stringify(updatedPolls));
  return updatedPolls;
};