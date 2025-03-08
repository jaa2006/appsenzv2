import { AuthState } from '../types';

const STORAGE_FILE_KEY = 'appsenz_data.json';

export function saveToStorage(data: AuthState): void {
  try {
    localStorage.setItem(STORAGE_FILE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
    throw new Error('Failed to save data');
  }
}

export function loadFromStorage(): AuthState | null {
  try {
    const data = localStorage.getItem(STORAGE_FILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
}

export function appendToStorage(key: keyof AuthState, data: any): void {
  try {
    const currentData = loadFromStorage();
    if (currentData && Array.isArray(currentData[key])) {
      const updatedData = {
        ...currentData,
        [key]: [...currentData[key], data]
      };
      saveToStorage(updatedData);
    }
  } catch (error) {
    console.error('Error appending data:', error);
    throw new Error('Failed to append data');
  }
}

export function updateInStorage(key: keyof AuthState, id: string, data: any): void {
  try {
    const currentData = loadFromStorage();
    if (currentData && Array.isArray(currentData[key])) {
      const updatedArray = currentData[key].map((item: any) => 
        item.id === id ? { ...item, ...data } : item
      );
      
      const updatedData = {
        ...currentData,
        [key]: updatedArray
      };
      saveToStorage(updatedData);
    }
  } catch (error) {
    console.error('Error updating data:', error);
    throw new Error('Failed to update data');
  }
}

export function removeFromStorage(key: keyof AuthState, id: string): void {
  try {
    const currentData = loadFromStorage();
    if (currentData && Array.isArray(currentData[key])) {
      const updatedArray = currentData[key].filter((item: any) => item.id !== id);
      
      const updatedData = {
        ...currentData,
        [key]: updatedArray
      };
      saveToStorage(updatedData);
    }
  } catch (error) {
    console.error('Error removing data:', error);
    throw new Error('Failed to remove data');
  }
}