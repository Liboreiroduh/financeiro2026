/**
 * StorageManager - Handles low-level localStorage operations
 * Implements the "Local-first" architecture requirement.
 */
export class StorageManager {
    static get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error(`Error reading ${key} from storage:`, error);
            return defaultValue;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error saving ${key} to storage:`, error);
            return false;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing ${key}:`, error);
        }
    }

    static clear() {
        localStorage.clear();
    }
}
