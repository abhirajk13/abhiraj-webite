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
  subscribe: (userId, callback) => {
    const q = query(
      getUserCollection(userId, 'ingredients'),
      orderBy('addedAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const ingredients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(ingredients);
    });
  },

  add: async (userId, ingredient) => {
    const docRef = await addDoc(getUserCollection(userId, 'ingredients'), {
      ...ingredient,
      addedAt: serverTimestamp()
    });
    return docRef.id;
  },

  addMany: async (userId, ingredients) => {
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
  subscribe: (userId, callback) => {
    const q = query(
      getUserCollection(userId, 'preferredMeals'),
      orderBy('sortOrder', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const meals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(meals);
    });
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
  subscribe: (userId, callback) => {
    const q = query(
      getUserCollection(userId, 'suggestions'),
      orderBy('generatedAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const suggestions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(suggestions);
    });
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
