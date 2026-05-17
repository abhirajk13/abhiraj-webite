import { useState, useEffect } from 'react';
import { useAuth } from './PrivatePortal';
import { logout } from '../../services/authService';
import { ingredientsService, preferredMealsService } from '../../services/mealPrepDataService';
import PhotoIngredientCapture from './PhotoIngredientCapture';
import ManualIngredientEntry from './ManualIngredientEntry';
import IngredientList from './IngredientList';
import PreferredMealsManager from './PreferredMealsManager';
import MealSuggestions from './MealSuggestions';
import './MealPrep.css';

function MealPrepDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ingredients');
  const [ingredients, setIngredients] = useState([]);
  const [preferredMeals, setPreferredMeals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubIngredients = ingredientsService.subscribe(user.uid, setIngredients);
    const unsubMeals = preferredMealsService.subscribe(user.uid, setPreferredMeals);

    return () => {
      unsubIngredients();
      unsubMeals();
    };
  }, [user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const tabs = [
    { id: 'ingredients', label: 'Ingredients', icon: '🥬' },
    { id: 'suggestions', label: 'Suggestions', icon: '✨' },
    { id: 'favorites', label: 'Favorites', icon: '❤️' },
  ];

  return (
    <div className="meal-prep-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Meal Prep</h1>
            <span className="ingredient-count">
              {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button 
            className="logout-button" 
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? '...' : '👋'}
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {activeTab === 'ingredients' && (
          <div className="tab-content">
            <div className="add-buttons">
              <button 
                className="add-button photo-button"
                onClick={() => setShowAddModal('photo')}
              >
                <span className="button-icon">📸</span>
                <span className="button-text">Scan Photo</span>
              </button>
              <button 
                className="add-button manual-button"
                onClick={() => setShowAddModal('manual')}
              >
                <span className="button-icon">✏️</span>
                <span className="button-text">Add Manual</span>
              </button>
            </div>

            <IngredientList 
              ingredients={ingredients}
              userId={user.uid}
            />
          </div>
        )}

        {activeTab === 'suggestions' && (
          <MealSuggestions 
            ingredients={ingredients}
            preferredMeals={preferredMeals}
            userId={user.uid}
          />
        )}

        {activeTab === 'favorites' && (
          <PreferredMealsManager 
            meals={preferredMeals}
            userId={user.uid}
          />
        )}
      </main>

      <nav className="dashboard-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {showAddModal === 'photo' && (
        <PhotoIngredientCapture
          userId={user.uid}
          onClose={() => setShowAddModal(null)}
          existingIngredients={ingredients}
        />
      )}

      {showAddModal === 'manual' && (
        <ManualIngredientEntry
          userId={user.uid}
          onClose={() => setShowAddModal(null)}
          existingIngredients={ingredients}
        />
      )}
    </div>
  );
}

export default MealPrepDashboard;
