import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

const getUserCollection = (userId, collectionName) => {
  return collection(db, 'users', userId, collectionName);
};

export const ingredientsService = {
  subscribe: (userId, callback, onError) => {
    const collectionRef = getUserCollection(userId, 'ingredients');
    return onSnapshot(
      collectionRef, 
      (snapshot) => {
        const ingredients = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        ingredients.sort((a, b) => {
          const aTime = a.addedAt?.toMillis?.() || 0;
          const bTime = b.addedAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        callback(ingredients);
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        if (onError) onError(error);
      }
    );
  },

  add: async (userId, ingredient) => {
    try {
      const docRef = await addDoc(getUserCollection(userId, 'ingredients'), {
        ...ingredient,
        addedAt: serverTimestamp()
      });
      console.log('Ingredient added:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding ingredient:', error);
      throw error;
    }
  },

  addMany: async (userId, ingredients) => {
    try {
      const batch = writeBatch(db);
      const collectionRef = getUserCollection(userId, 'ingredients');
      
      ingredients.forEach(ingredient => {
        const docRef = doc(collectionRef);
        batch.set(docRef, {
          ...ingredient,
          addedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log(`Added ${ingredients.length} ingredients`);
    } catch (error) {
      console.error('Error adding ingredients:', error);
      throw error;
    }
  },

  update: async (userId, ingredientId, updates) => {
    const docRef = doc(db, 'users', userId, 'ingredients', ingredientId);
    await updateDoc(docRef, updates);
  },

  delete: async (userId, ingredientId) => {
    const docRef = doc(db, 'users', userId, 'ingredients', ingredientId);
    await deleteDoc(docRef);
  },

  deleteAll: async (userId) => {
    const snapshot = await getDocs(getUserCollection(userId, 'ingredients'));
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
};

export const preferredMealsService = {
  subscribe: (userId, callback, onError) => {
    const collectionRef = getUserCollection(userId, 'preferredMeals');
    return onSnapshot(
      collectionRef,
      (snapshot) => {
        const meals = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        meals.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        callback(meals);
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        if (onError) onError(error);
      }
    );
  },

  add: async (userId, meal) => {
    const snapshot = await getDocs(getUserCollection(userId, 'preferredMeals'));
    const maxOrder = snapshot.docs.reduce((max, doc) => {
      const order = doc.data().sortOrder || 0;
      return order > max ? order : max;
    }, 0);

    const docRef = await addDoc(getUserCollection(userId, 'preferredMeals'), {
      ...meal,
      sortOrder: maxOrder + 1,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  update: async (userId, mealId, updates) => {
    const docRef = doc(db, 'users', userId, 'preferredMeals', mealId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  delete: async (userId, mealId) => {
    const docRef = doc(db, 'users', userId, 'preferredMeals', mealId);
    await deleteDoc(docRef);
  },

  reorder: async (userId, mealIds) => {
    const batch = writeBatch(db);
    mealIds.forEach((mealId, index) => {
      const docRef = doc(db, 'users', userId, 'preferredMeals', mealId);
      batch.update(docRef, { sortOrder: index });
    });
    await batch.commit();
  }
};

export const suggestionsService = {
  subscribe: (userId, callback, onError) => {
    const collectionRef = getUserCollection(userId, 'suggestions');
    return onSnapshot(
      collectionRef,
      (snapshot) => {
        const suggestions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        suggestions.sort((a, b) => {
          const aTime = a.generatedAt?.toMillis?.() || 0;
          const bTime = b.generatedAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        callback(suggestions);
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        if (onError) onError(error);
      }
    );
  },

  save: async (userId, suggestions) => {
    const snapshot = await getDocs(getUserCollection(userId, 'suggestions'));
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    const collectionRef = getUserCollection(userId, 'suggestions');
    suggestions.forEach(suggestion => {
      const docRef = doc(collectionRef);
      batch.set(docRef, {
        ...suggestion,
        generatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
  },

  clear: async (userId) => {
    const snapshot = await getDocs(getUserCollection(userId, 'suggestions'));
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
};
