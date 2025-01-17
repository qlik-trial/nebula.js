/**
 * Utility function for ensuring that each action is awaited before executing the next one.
 * @param {function[]} items An array of items (e.g. selectors) that will be sent into the action function, iteratively.
 * @returns {Promise} Resolves true when done.
 */
function execSequence(items, action) {
  const takeAction = async (index = 0) => {
    if (index >= items.length) {
      return true; // done
    }
    const nextItem = items[index];
    await action(nextItem);
    return takeAction(index + 1);
  };
  return takeAction();
}

export default execSequence;
