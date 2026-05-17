import { useState, useEffect } from 'react';
import { useAuth } from './PrivatePortal';
import { logout } from '../../services/authService';
import { ingredientsService, preferredMealsService } from '../../services/mealPrepDataService';
import PhotoIngredientCapture from './PhotoIngredientCapture';
import ManualIngredientEntry from './ManualIngredientEntry';
import IngredientList from './IngredientList';
import PreferredMealsManager from './PreferredMealsManager';
import MealSuggestions from './MealSuggestions';
import { 
  CameraIcon, 
  PlusIcon, 
  SaladIcon, 
  SparklesIcon, 
  HeartIcon, 
  LogoutIcon,
  AlertIcon,
  XIcon 
} from './Icons';
import './MealPrep.css';

function MealPrepDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ingredients');
  const [ingredients, setIngredients] = useState([]);
  const [preferredMeals, setPreferredMeals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const handleError = (error) => {
      console.error('Database error:', error);
      if (error.code === 'permission-denied') {
        setDbError('Database access denied. Please check Firestore security rules.');
      } else {
        setDbError(`Database error: ${error.message}`);
      }
    };

    const unsubIngredients = ingredientsService.subscribe(
      user.uid, 
      setIngredients,
      handleError
    );
    const unsubMeals = preferredMealsService.subscribe(
      user.uid, 
      setPreferredMeals,
      handleError
    );

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
    { id: 'ingredients', label: 'Pantry', Icon: SaladIcon },
    { id: 'suggestions', label: 'Discover', Icon: SparklesIcon },
    { id: 'favorites', label: 'Saved', Icon: HeartIcon },
  ];

  const titleMap = {
    ingredients: 'Pantry',
    suggestions: 'Discover',
    favorites: 'Saved meals'
  };

  return (
    <div className="mp-portal">
      <div className="mp-dashboard">
        <header className="mp-header">
          <div className="mp-header-content">
            <div className="mp-header-title">
              <h1>{titleMap[activeTab]}</h1>
              <span className="mp-header-meta">
                {activeTab === 'ingredients' && `${ingredients.length} item${ingredients.length !== 1 ? 's' : ''}`}
                {activeTab === 'favorites' && `${preferredMeals.length} meal${preferredMeals.length !== 1 ? 's' : ''}`}
                {activeTab === 'suggestions' && 'AI-powered recommendations'}
              </span>
            </div>
            <button 
              className="mp-btn mp-btn-ghost mp-btn-icon" 
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogoutIcon size={18} />
            </button>
          </div>
        </header>

        {dbError && (
          <div style={{ padding: '12px 20px 0' }}>
            <div className="mp-alert">
              <AlertIcon size={16} />
              <span>{dbError}</span>
              <button className="mp-alert-close" onClick={() => setDbError(null)}>
                <XIcon size={14} />
              </button>
            </div>
          </div>
        )}

        <main className="mp-main">
          {activeTab === 'ingredients' && (
            <>
              <div className="mp-action-bar">
                <button 
                  className="mp-action"
                  onClick={() => setShowAddModal('photo')}
                >
                  <CameraIcon size={18} />
                  <span>Scan photo</span>
                </button>
                <button 
                  className="mp-action"
                  onClick={() => setShowAddModal('manual')}
                >
                  <PlusIcon size={18} />
                  <span>Add manually</span>
                </button>
              </div>

              <IngredientList 
                ingredients={ingredients}
                userId={user.uid}
              />
            </>
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

        <nav className="mp-nav">
          <div className="mp-nav-inner">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`mp-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.Icon size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
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
    </div>
  );
}

export default MealPrepDashboard;
