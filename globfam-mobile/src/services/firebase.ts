import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      email: user.email,
      displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// User functions
export const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Family functions
export const createFamily = async (name: string, createdBy: string, userDisplayName: string, userEmail: string) => {
  try {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const familyData = {
      name,
      createdBy,
      members: [{
        userId: createdBy,
        role: 'admin',
        joinedAt: new Date(),
        displayName: userDisplayName,
        email: userEmail
      }],
      inviteCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const familyRef = await addDoc(collection(db, 'families'), familyData);
    
    // Update user with family ID
    await updateDoc(doc(db, 'users', createdBy), {
      familyId: familyRef.id,
      updatedAt: serverTimestamp()
    });
    
    return { id: familyRef.id, ...familyData };
  } catch (error) {
    throw error;
  }
};

export const joinFamily = async (inviteCode: string, userId: string, userDisplayName: string, userEmail: string) => {
  try {
    const familiesQuery = query(collection(db, 'families'), where('inviteCode', '==', inviteCode));
    const querySnapshot = await getDocs(familiesQuery);
    
    if (querySnapshot.empty) {
      throw new Error('Invalid invite code');
    }
    
    const familyDoc = querySnapshot.docs[0];
    const familyData = familyDoc.data();
    
    // Add user to family members
    const updatedMembers = [...familyData.members, {
      userId,
      role: 'member',
      joinedAt: new Date(),
      displayName: userDisplayName,
      email: userEmail
    }];
    
    await updateDoc(doc(db, 'families', familyDoc.id), {
      members: updatedMembers,
      updatedAt: serverTimestamp()
    });
    
    // Update user with family ID
    await updateDoc(doc(db, 'users', userId), {
      familyId: familyDoc.id,
      updatedAt: serverTimestamp()
    });
    
    return { id: familyDoc.id, ...familyData, members: updatedMembers };
  } catch (error) {
    throw error;
  }
};

export const getFamilyData = async (familyId: string) => {
  try {
    const familyDoc = await getDoc(doc(db, 'families', familyId));
    if (familyDoc.exists()) {
      return { id: familyDoc.id, ...familyDoc.data() };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Currency balance functions
export const updateCurrencyBalance = async (userId: string, currency: string, amount: number) => {
  try {
    const balanceRef = doc(db, 'balances', `${userId}_${currency}`);
    await setDoc(balanceRef, {
      userId,
      currency,
      amount,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    throw error;
  }
};

export const getUserBalances = async (userId: string) => {
  try {
    const balancesQuery = query(collection(db, 'balances'), where('userId', '==', userId));
    const querySnapshot = await getDocs(balancesQuery);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      lastUpdated: doc.data().lastUpdated?.toDate()
    }));
  } catch (error) {
    throw error;
  }
};

// Transaction functions
export const addTransaction = async (transaction: {
  userId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: Date;
}) => {
  try {
    const transactionData = {
      ...transaction,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const transactionRef = await addDoc(collection(db, 'transactions'), transactionData);
    return { id: transactionRef.id, ...transactionData };
  } catch (error) {
    throw error;
  }
};

export const getUserTransactions = async (userId: string) => {
  try {
    const transactionsQuery = query(collection(db, 'transactions'), where('userId', '==', userId));
    const querySnapshot = await getDocs(transactionsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
  } catch (error) {
    throw error;
  }
};