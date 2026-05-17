const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const callGemini = async (contents) => {
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API request failed');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

export const extractIngredientsFromImage = async (imageBase64) => {
  const prompt = `Analyze this image and identify all food ingredients visible. 
Return ONLY a valid JSON array of objects with this exact format:
[
  {"name": "ingredient name", "category": "category", "quantity": "estimated amount or null"}
]

Categories must be one of: Proteins, Vegetables, Fruits, Dairy, Grains, Pantry, Spices, Beverages, Condiments, Other

Be specific with ingredient names (e.g., "red bell pepper" not just "pepper").
If you cannot identify any ingredients, return an empty array [].
Do not include any explanation, just the JSON array.`;

  try {
    const contents = [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
            },
          },
        ],
      },
    ];

    const response = await callGemini(contents);
    
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON array found in response:', response);
      return [];
    }
    
    const ingredients = JSON.parse(jsonMatch[0]);
    return ingredients.map((ing, index) => ({
      id: `photo-${Date.now()}-${index}`,
      name: ing.name,
      category: ing.category || 'Other',
      quantity: ing.quantity,
      source: 'photo',
      addedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error extracting ingredients:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
};

export const generateMealSuggestions = async (ingredients, preferredMeals = []) => {
  const ingredientList = ingredients.map(i => i.name).join(', ');
  const preferredList = preferredMeals.length > 0 
    ? preferredMeals.map(m => `${m.name} (ingredients: ${m.ingredients?.join(', ') || 'not specified'})`).join('\n')
    : 'None specified';

  const prompt = `You are a helpful meal planning assistant. Based on the available ingredients and user preferences, suggest meals.

AVAILABLE INGREDIENTS:
${ingredientList || 'No ingredients specified'}

USER'S PREFERRED/FAVORITE MEALS:
${preferredList}

Generate 5-7 meal suggestions. Prioritize meals from the user's preferred list if ingredients match.
Also suggest other meals that can be made with available ingredients.

Return ONLY a valid JSON array with this exact format:
[
  {
    "name": "Meal Name",
    "description": "Brief description",
    "matchedIngredients": ["ingredient1", "ingredient2"],
    "missingIngredients": ["ingredient3"],
    "difficulty": "Easy|Medium|Hard",
    "prepTimeMinutes": 30,
    "matchScore": 0.85,
    "isPreferred": true,
    "instructions": ["Step 1", "Step 2", "Step 3"]
  }
]

matchScore should be between 0 and 1, representing how many required ingredients are available.
isPreferred should be true if the meal is from the user's preferred list.
Sort by matchScore descending (best matches first).
Do not include any explanation, just the JSON array.`;

  try {
    const contents = [{ parts: [{ text: prompt }] }];
    const response = await callGemini(contents);
    
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON array found in response:', response);
      return [];
    }
    
    const suggestions = JSON.parse(jsonMatch[0]);
    return suggestions.map((meal, index) => ({
      id: `suggestion-${Date.now()}-${index}`,
      ...meal,
      generatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error generating suggestions:', error);
    throw new Error('Failed to generate meal suggestions. Please try again.');
  }
};

export const searchRecipes = async (query, ingredients = []) => {
  const ingredientList = ingredients.map(i => i.name).join(', ');
  
  const prompt = `Search for recipes matching: "${query}"
${ingredientList ? `Available ingredients: ${ingredientList}` : ''}

Return 5 recipe suggestions as a JSON array:
[
  {
    "name": "Recipe Name",
    "description": "Brief description",
    "matchedIngredients": ["ingredient1"],
    "missingIngredients": ["ingredient2"],
    "difficulty": "Easy|Medium|Hard",
    "prepTimeMinutes": 30,
    "matchScore": 0.7,
    "instructions": ["Step 1", "Step 2"]
  }
]

Only return the JSON array, no explanation.`;

  try {
    const contents = [{ parts: [{ text: prompt }] }];
    const response = await callGemini(contents);
    
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    
    return JSON.parse(jsonMatch[0]).map((recipe, index) => ({
      id: `search-${Date.now()}-${index}`,
      ...recipe,
    }));
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw new Error('Failed to search recipes. Please try again.');
  }
};
