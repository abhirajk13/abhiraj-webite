// Data persistence utilities for the travel map

export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error);
    return false;
  }
};

export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const clearAllData = () => {
  try {
    localStorage.removeItem('visitedCountries');
    localStorage.removeItem('countryPhotos');
    return true;
  } catch (error) {
    console.warn('Failed to clear data from localStorage:', error);
    return false;
  }
};

export const exportData = () => {
  try {
    const visitedCountries = loadFromLocalStorage('visitedCountries', []);
    const countryPhotos = loadFromLocalStorage('countryPhotos', {});
    
    const exportData = {
      visitedCountries,
      countryPhotos,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `travel-map-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.warn('Failed to export data:', error);
    return false;
  }
};

export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.visitedCountries && Array.isArray(data.visitedCountries)) {
          localStorage.setItem('visitedCountries', JSON.stringify(data.visitedCountries));
        }
        
        if (data.countryPhotos && typeof data.countryPhotos === 'object') {
          localStorage.setItem('countryPhotos', JSON.stringify(data.countryPhotos));
        }
        
        resolve(true);
      } catch (error) {
        console.warn('Failed to import data:', error);
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
