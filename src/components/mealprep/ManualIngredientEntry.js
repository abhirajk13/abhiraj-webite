import { useState, useMemo } from 'react';
import { ingredientsService } from '../../services/mealPrepDataService';

const INGREDIENT_DATABASE = {
  Proteins: [
    'Chicken Breast', 'Chicken Thighs', 'Ground Beef', 'Steak', 'Pork Chops',
    'Bacon', 'Sausage', 'Salmon', 'Tuna', 'Shrimp', 'Eggs', 'Tofu', 'Tempeh'
  ],
  Vegetables: [
    'Onion', 'Garlic', 'Tomato', 'Bell Pepper', 'Carrot', 'Broccoli', 'Spinach',
    'Lettuce', 'Cucumber', 'Zucchini', 'Mushrooms', 'Potato', 'Sweet Potato',
    'Celery', 'Corn', 'Peas', 'Green Beans', 'Asparagus', 'Cauliflower', 'Kale'
  ],
  Fruits: [
    'Apple', 'Banana', 'Orange', 'Lemon', 'Lime', 'Avocado', 'Berries',
    'Grapes', 'Mango', 'Pineapple', 'Strawberries', 'Blueberries'
  ],
  Dairy: [
    'Milk', 'Butter', 'Cheese', 'Cheddar', 'Mozzarella', 'Parmesan', 'Cream',
    'Yogurt', 'Greek Yogurt', 'Sour Cream', 'Cream Cheese', 'Eggs'
  ],
  Grains: [
    'Rice', 'Brown Rice', 'Pasta', 'Bread', 'Flour', 'Oats', 'Quinoa',
    'Couscous', 'Tortillas', 'Noodles', 'Breadcrumbs'
  ],
  Pantry: [
    'Olive Oil', 'Vegetable Oil', 'Soy Sauce', 'Vinegar', 'Honey', 'Sugar',
    'Brown Sugar', 'Salt', 'Canned Tomatoes', 'Tomato Paste', 'Coconut Milk',
    'Chicken Broth', 'Beef Broth', 'Beans', 'Chickpeas', 'Lentils', 'Peanut Butter'
  ],
  Spices: [
    'Black Pepper', 'Paprika', 'Cumin', 'Oregano', 'Basil', 'Thyme', 'Rosemary',
    'Cinnamon', 'Ginger', 'Turmeric', 'Chili Powder', 'Cayenne', 'Italian Seasoning',
    'Garlic Powder', 'Onion Powder', 'Bay Leaves', 'Red Pepper Flakes'
  ]
};

const QUICK_ADD = [
  'Eggs', 'Chicken Breast', 'Rice', 'Onion', 'Garlic', 'Tomato', 
  'Olive Oil', 'Salt', 'Black Pepper', 'Butter', 'Milk', 'Cheese'
];

function ManualIngredientEntry({ userId, onClose, existingIngredients }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customItem, setCustomItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const existingNames = useMemo(() => 
    new Set(existingIngredients.map(i => i.name.toLowerCase())),
    [existingIngredients]
  );

  const filteredIngredients = useMemo(() => {
    if (!searchQuery && !selectedCategory) return {};
    
    const result = {};
    const query = searchQuery.toLowerCase();
    
    Object.entries(INGREDIENT_DATABASE).forEach(([category, items]) => {
      if (selectedCategory && selectedCategory !== category) return;
      
      const filtered = items.filter(item => {
        if (existingNames.has(item.toLowerCase())) return false;
        if (selectedItems.includes(item)) return false;
        if (query && !item.toLowerCase().includes(query)) return false;
        return true;
      });
      
      if (filtered.length > 0) {
        result[category] = filtered;
      }
    });
    
    return result;
  }, [searchQuery, selectedCategory, existingNames, selectedItems]);

  const quickAddItems = useMemo(() => 
    QUICK_ADD.filter(item => 
      !existingNames.has(item.toLowerCase()) && 
      !selectedItems.includes(item)
    ),
    [existingNames, selectedItems]
  );

  const addItem = (item, category = 'Other') => {
    if (!selectedItems.includes(item)) {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const removeItem = (item) => {
    setSelectedItems(prev => prev.filter(i => i !== item));
  };

  const addCustomItem = () => {
    const trimmed = customItem.trim();
    if (!trimmed) return;
    if (existingNames.has(trimmed.toLowerCase())) {
      setError('This ingredient is already in your list');
      return;
    }
    if (selectedItems.map(i => i.toLowerCase()).includes(trimmed.toLowerCase())) {
      setError('Already added');
      return;
    }
    addItem(trimmed);
    setCustomItem('');
    setError('');
  };

  const getCategoryForItem = (itemName) => {
    for (const [category, items] of Object.entries(INGREDIENT_DATABASE)) {
      if (items.map(i => i.toLowerCase()).includes(itemName.toLowerCase())) {
        return category;
      }
    }
    return 'Other';
  };

  const handleSave = async () => {
    if (selectedItems.length === 0) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const ingredients = selectedItems.map(name => ({
        name,
        category: getCategoryForItem(name),
        source: 'manual',
        addedAt: new Date().toISOString()
      }));
      
      await ingredientsService.addMany(userId, ingredients);
      onClose();
    } catch (err) {
      setError('Failed to save ingredients');
      setLoading(false);
    }
  };

  const categories = Object.keys(INGREDIENT_DATABASE);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content manual-entry-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Add Ingredients</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="modal-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="search-section">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {!searchQuery && !selectedCategory && (
          <>
            <div className="quick-add-section">
              <h3>Quick Add</h3>
              <div className="quick-add-chips">
                {quickAddItems.slice(0, 8).map(item => (
                  <button
                    key={item}
                    className="quick-chip"
                    onClick={() => addItem(item)}
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="category-section">
              <h3>Browse by Category</h3>
              <div className="category-buttons">
                {categories.map(category => (
                  <button
                    key={category}
                    className="category-button"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'Proteins' && '🥩'}
                    {category === 'Vegetables' && '🥬'}
                    {category === 'Fruits' && '🍎'}
                    {category === 'Dairy' && '🧀'}
                    {category === 'Grains' && '🌾'}
                    {category === 'Pantry' && '🥫'}
                    {category === 'Spices' && '🧂'}
                    <span>{category}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {(searchQuery || selectedCategory) && (
          <div className="results-section">
            {selectedCategory && (
              <button 
                className="back-button"
                onClick={() => setSelectedCategory(null)}
              >
                ← Back to Categories
              </button>
            )}
            
            {Object.entries(filteredIngredients).length === 0 ? (
              <div className="no-results">
                <p>No matching ingredients found</p>
              </div>
            ) : (
              Object.entries(filteredIngredients).map(([category, items]) => (
                <div key={category} className="result-category">
                  <h4>{category}</h4>
                  <div className="result-items">
                    {items.map(item => (
                      <button
                        key={item}
                        className="result-item"
                        onClick={() => addItem(item, category)}
                      >
                        + {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="custom-add-section">
          <h3>Add Custom</h3>
          <div className="custom-input-wrapper">
            <input
              type="text"
              placeholder="Type ingredient name..."
              value={customItem}
              onChange={(e) => setCustomItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
              className="custom-input"
            />
            <button 
              className="custom-add-button"
              onClick={addCustomItem}
              disabled={!customItem.trim()}
            >
              Add
            </button>
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="selected-section">
            <h3>Selected ({selectedItems.length})</h3>
            <div className="selected-chips">
              {selectedItems.map(item => (
                <span key={item} className="selected-chip">
                  {item}
                  <button onClick={() => removeItem(item)}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="save-button"
            onClick={handleSave}
            disabled={loading || selectedItems.length === 0}
          >
            {loading ? 'Adding...' : `Add ${selectedItems.length} Item${selectedItems.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManualIngredientEntry;
