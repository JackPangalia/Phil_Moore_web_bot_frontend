// hooks/useLocalStorage.js
import { useCallback } from "react";

/**
 * useLocalStorage custom hook provides an interface to interact with either
 * sessionStorage or localStorage.
 *
 * @param {string} storageType - The type of storage to use ('session' or 'local'). Defaults to 'session'.
 * @returns {object} An object containing getItem, setItem, and removeItem functions.
 */
const useLocalStorage = (storageType = "session") => {
  const storage = storageType === "session" ? sessionStorage : localStorage;

  /**
   * Retrieves an item from storage by key.
   *
   * @param {string} key - The key of the item to retrieve.
   * @returns {string|null} The value of the item, or null if it does not exist.
   */
  const getItem = useCallback((key) => {
    return storage.getItem(key);
  }, [storage]);

  /**
   * Sets an item in storage with the given key and value.
   *
   * @param {string} key - The key of the item to set.
   * @param {string} value - The value to store.
   */
  const setItem = useCallback((key, value) => {
    storage.setItem(key, value);
  }, [storage]);

  /**
   * Removes an item from storage by key.
   *
   * @param {string} key - The key of the item to remove.
   */
  const removeItem = useCallback((key) => {
    storage.removeItem(key);
  }, [storage]);

  return { getItem, setItem, removeItem };
};

export default useLocalStorage;