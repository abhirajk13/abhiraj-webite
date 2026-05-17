import { useState, useMemo } from 'react';
import { ingredientsService } from '../../services/mealPrepDataService';
import { 
  SearchIcon, 
  XIcon, 
  PlusIcon, 
  ChevronLeftIcon,
  AlertIcon
} from './Icons';

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
    'Yogurt', 'Greek Yogurt', 'Sour Cream', 'Cream Cheese'
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

  const addItem = (item) => {
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
      setError('This ingredient is already in your pantry');
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
    setError('');
    
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
      console.error('Failed to save ingredients:', err);
      setError(err.code === 'permission-denied' 
        ? 'Database access denied. Check Firestore rules.' 
        : `Failed to save: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const categories = Object.keys(INGREDIENT_DATABASE);

  return (
    <div className="mp-portal">
      <div className="mp-modal-overlay" onClick={onClose}>
        <div className="mp-modal" onClick={e => e.stopPropagation()}>
          <div className="mp-modal-header">
            <h2 className="mp-modal-title">Add ingredients</h2>
            <button className="mp-icon-btn" onClick={onClose} aria-label="Close">
              <XIcon size={18} />
            </button>
          </div>

          <div className="mp-modal-body">
            {error && (
              <div className="mp-alert">
                <AlertIcon size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="mp-search-wrapper">
              <SearchIcon size={16} className="mp-search-icon" />
              <input
                type="text"
                className="mp-input mp-search"
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="mp-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <XIcon size={14} />
                </button>
              )}
            </div>

            {!searchQuery && !selectedCategory && (
              <>
                {quickAddItems.length > 0 && (
                  <div>
                    <h3 className="mp-section-title" style={{ marginBottom: '10px' }}>
                      Quick add
                    </h3>
                    <div className="mp-chips">
                      {quickAddItems.slice(0, 8).map(item => (
                        <button
                          key={item}
                          className="mp-chip mp-chip-add"
                          onClick={() => addItem(item)}
                        >
                          <PlusIcon size={12} />
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="mp-section-title" style={{ marginBottom: '10px' }}>
                    Categories
                  </h3>
                  <div className="mp-category-grid">
                    {categories.map(category => (
                      <button
                        key={category}
                        className="mp-category-btn"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {(searchQuery || selectedCategory) && (
              <div>
                {selectedCategory && (
                  <button 
                    className="mp-back-btn"
                    onClick={() => setSelectedCategory(null)}
                  >
                    <ChevronLeftIcon size={14} />
                    Back to categories
                  </button>
                )}
                
                {Object.entries(filteredIngredients).length === 0 ? (
                  <div className="mp-empty" style={{ padding: '32px 20px' }}>
                    <p>No matching ingredients found</p>
                  </div>
                ) : (
                  Object.entries(filteredIngredients).map(([category, items]) => (
                    <div key={category} className="mp-result-group">
                      <h4 className="mp-result-group-title">{category}</h4>
                      <div className="mp-chips">
                        {items.map(item => (
                          <button
                            key={item}
                            className="mp-chip mp-chip-add"
                            onClick={() => addItem(item)}
                          >
                            <PlusIcon size={12} />
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div>
              <h3 className="mp-section-title" style={{ marginBottom: '10px' }}>
                Add custom
              </h3>
              <div className="mp-custom-add">
                <input
                  type="text"
                  className="mp-input"
                  placeholder="Type ingredient name..."
                  value={customItem}
                  onChange={(e) => setCustomItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
                />
                <button 
                  className="mp-btn mp-btn-secondary"
                  onClick={addCustomItem}
                  disabled={!customItem.trim()}
                >
                  Add
                </button>
              </div>
            </div>

            {selectedItems.length > 0 && (
              <div className="mp-selected-tray">
                <div className="mp-selected-tray-header">
                  <span className="mp-selected-tray-title">Selected</span>
                  <span className="mp-selected-tray-count">{selectedItems.length}</span>
                </div>
                <div className="mp-chips">
                  {selectedItems.map(item => (
                    <span key={item} className="mp-chip mp-chip-selected">
                      {item}
                      <button 
                        className="mp-chip-remove"
                        onClick={() => removeItem(item)}
                        aria-label={`Remove ${item}`}
                      >
                        <XIcon size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mp-modal-footer">
            <button className="mp-btn mp-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="mp-btn mp-btn-primary"
              onClick={handleSave}
              disabled={loading || selectedItems.length === 0}
            >
              {loading ? (
                <>
                  <span className="mp-spinner"></span>
                  Adding
                </>
              ) : (
                `Add ${selectedItems.length || ''} ${selectedItems.length === 1 ? 'item' : 'items'}`.trim()
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManualIngredientEntry;
