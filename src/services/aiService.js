const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const parseJsonArray = (text) => {
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error('No JSON array found in response');
    return [];
  }
  
  let jsonStr = jsonMatch[0];
  
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.log('Initial parse failed, attempting to fix JSON...');
    
    jsonStr = jsonStr
      .replace(/,\s*}/g, '}')
      .replace(/,\s*\]/g, ']')
      .replace(/'/g, '"')
      .replace(/(\w+):/g, '"$1":')
      .replace(/:\s*"([^"]*)"([^,\]\}])/g, ': "$1"$2');
    
    try {
      return JSON.parse(jsonStr);
    } catch (e2) {
      const objects = [];
      const objRegex = /\{[^{}]*\}/g;
      let match;
      
      while ((match = objRegex.exec(text)) !== null) {
        try {
          const cleaned = match[0]
            .replace(/,\s*}/g, '}')
            .replace(/'/g, '"');
          objects.push(JSON.parse(cleaned));
        } catch (e3) {
          continue;
        }
      }
      
      if (objects.length > 0) {
        console.log(`Recovered ${objects.length} objects from malformed JSON`);
        return objects;
      }
      
      console.error('Failed to parse JSON:', e2);
      return [];
    }
  }
};

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-preview-05-20',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest', 
  'gemini-1.5-pro'
];

const callGemini = async (contents) => {
  let lastError = null;
  
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
      const response = await fetch(url, {
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

      if (response.ok) {
        const data = await response.json();
        console.log(`Using Gemini model: ${model}`);
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
      
      const error = await response.json();
      lastError = error.error?.message || 'API request failed';
      
      if (response.status === 404 || response.status === 429) {
        console.log(`Model ${model} unavailable (${response.status}), trying next...`);
        continue;
      }
      
      throw new Error(lastError);
    } catch (err) {
      lastError = err.message;
      if (err.message?.includes('not found') || err.message?.includes('quota')) {
        continue;
      }
      throw err;
    }
  }
  
  throw new Error(lastError || 'No available Gemini model found. Please check your API key at https://aistudio.google.com/apikey');
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
    
    const ingredients = parseJsonArray(response);
    if (!ingredients || ingredients.length === 0) {
      console.log('No ingredients detected in image');
      return [];
    }
    
    return ingredients.map((ing, index) => ({
      id: `photo-${Date.now()}-${index}`,
      name: ing.name || 'Unknown',
      category: ing.category || 'Other',
      quantity: ing.quantity || null,
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
    
    const suggestions = parseJsonArray(response);
    if (!suggestions || suggestions.length === 0) {
      console.error('No valid suggestions parsed from response');
      return [];
    }
    
    return suggestions.map((meal, index) => ({
      id: `suggestion-${Date.now()}-${index}`,
      name: meal.name || 'Unnamed Meal',
      description: meal.description || '',
      matchedIngredients: meal.matchedIngredients || [],
      missingIngredients: meal.missingIngredients || [],
      difficulty: meal.difficulty || 'Medium',
      prepTimeMinutes: meal.prepTimeMinutes || 30,
      matchScore: meal.matchScore || 0.5,
      isPreferred: meal.isPreferred || false,
      instructions: meal.instructions || [],
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
