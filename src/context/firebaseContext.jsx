import { useEffect, useState, createContext, useContext } from 'react';
import { 
    getAuth,
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut, 
    updateProfile 
} from 'firebase/auth';
import { 
    getStorage, 
    getDownloadURL, 
    ref, 
    uploadBytesResumable 
} from 'firebase/storage';
import { 
    collection, 
    doc, 
    getFirestore, 
    setDoc 
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase';

// Initialize Firebase app
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firebaseStorage = getStorage(firebaseApp);
const firebaseFirestore = getFirestore(firebaseApp);

// Creating context
const FirebaseContext = createContext(null);

// Custom hook to use Firebase context
export const useFirebaseContext = () => useContext(FirebaseContext);

export const FirebaseProvider = (props) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userSelected, setUserSelected] = useState(null);
    console.log(currentUser)
    
    // Effect to check authentication state and set current user
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Function to sign up a user
    const signUp = async (email, password, photo, name) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            const photoPath = `users/${userCredential.user.uid}/profilePic.jpg`;
            await uploadBytesResumable(ref(firebaseStorage, photoPath), photo);
            const photoUrl = await getDownloadURL(ref(firebaseStorage, photoPath));
            await setDoc(doc(firebaseFirestore, `users/${userCredential.user.uid}`), {
                name,
                email,
                profileImage: photoUrl,
                uid: userCredential.user.uid
            });
            await updateProfile(userCredential.user, {
                displayName: name,
                photoURL: photoUrl,
            });
        } catch (error) {
            console.error("Error signing up:", error);
        }
    };

    // Function to sign in a user
    const signIn = async (email, password) => {
        try {
            await signInWithEmailAndPassword(firebaseAuth, email, password);
        } catch (error) {
            console.error("Error signing in:", error);
        }
    };

    // Function to sign out the current user
    const signOutFunction = async () => {
        try {
            await signOut(firebaseAuth);
            setCurrentUser(null);
            setLoading(false);
            setUserSelected(null)
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };


    return (
        <FirebaseContext.Provider value={{
            signIn,
            signUp,
            setCurrentUser,
            currentUser,
            firebaseAuth,
            firebaseFirestore,
            firebaseStorage,
            signOutFunction,
            userSelected,
            setUserSelected,
            setLoading,
        }}>
            {!loading ? props.children : (
                <div className="relative h-screen w-screen flex items-center justify-center bg-gray-900 bg-opacity-25">
                    <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
                </div>
            )}
        </FirebaseContext.Provider>
    );
};
