import React, { useState, useRef } from 'react';
import { exportData, importData, clearAllData } from '../utils/dataPersistence';

function DataManager({ onDataChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const success = exportData();
      if (success) {
        alert('Data exported successfully!');
      } else {
        alert('Failed to export data. Please try again.');
      }
    } catch (error) {
      alert('Export failed: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await importData(file);
      alert('Data imported successfully! Please refresh the page to see your data.');
      onDataChange(); // Trigger a refresh
    } catch (error) {
      alert('Import failed: ' + error.message);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      const success = clearAllData();
      if (success) {
        alert('All data cleared successfully! Please refresh the page.');
        onDataChange(); // Trigger a refresh
      } else {
        alert('Failed to clear data. Please try again.');
      }
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="data-manager-toggle"
        onClick={() => setIsOpen(true)}
        title="Data Management"
      >
        <i className="fas fa-database"></i>
      </button>
    );
  }

  return (
    <div className="data-manager">
      <div className="data-manager-header">
        <h3>Data Management</h3>
        <button 
          className="close-btn"
          onClick={() => setIsOpen(false)}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="data-manager-content">
        <div className="data-actions">
          <button 
            className="action-btn export-btn"
            onClick={handleExport}
            disabled={isExporting}
          >
            <i className="fas fa-download"></i>
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
          
          <button 
            className="action-btn import-btn"
            onClick={handleImport}
            disabled={isImporting}
          >
            <i className="fas fa-upload"></i>
            {isImporting ? 'Importing...' : 'Import Data'}
          </button>
          
          <button 
            className="action-btn clear-btn"
            onClick={handleClearAll}
          >
            <i className="fas fa-trash"></i>
            Clear All Data
          </button>
        </div>
        
        <div className="data-info">
          <p><strong>Export:</strong> Download a backup of all your pins and photos</p>
          <p><strong>Import:</strong> Restore data from a previous backup</p>
          <p><strong>Clear:</strong> Remove all pins and photos (cannot be undone)</p>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default DataManager;
