import React, { useState } from 'react'
import { useThemeContext } from '../../context/themeContext';
import { useFirebaseContext } from '../../context/firebaseContext';
import { EmailAuthProvider, deleteUser, reauthenticateWithCredential } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";

const DeleteUser = () => {


  const {currentUser, setCurrentUser, setLoading, firebaseFirestore, firebaseStorage, firebaseAuth, signOutFunction, deleteCurrentUser} = useFirebaseContext()
  const {sidePanel, setSidePanel, primaryColor1, primaryColor2, primaryColor3, primaryColor4, primaryColor5, textColor1, textColor2, theme, setTheme} = useThemeContext()

  const [password, setPassword] = useState('');
  const [reauthenticating, setReauthenticating] = useState(false);
  const [deleteDisabled, setDeleteDisabled] = useState(false); // State to track delete button disabled state



  const handleSubmit = async(e)=>{
    e.preventDefault()
    try {
      setDeleteDisabled(true); // Disable the button on form submission
      await deleteChat()
      await deleteUserReauthenticate();
      // Optionally, you can handle success or navigate to another page here
    } catch (error) {
      console.error("Error deleting user:", error);
      // Optionally, display an error message to the user
    } finally {
      setDeleteDisabled(false); // Enable the button after deletion process completes
      setCurrentUser(null);
      setSidePanel("")
    }
  }
  

  const deleteChat = async()=>{
    try{
      // Fetch chat collection specific to the current user and delete conversation of user with his friends from his side
      const querySnapshot = await getDocs(collection(firebaseFirestore, `userFriends/${currentUser.uid}/friendData`));
      console.log(querySnapshot)
      querySnapshot.forEach(async(friend) => {

        /*update user status to accdeleted*/
        updateDoc(doc(firebaseFirestore, `userFriends/${friend.id}/friendData`, `${currentUser.uid}`), { status: `AccDeleted` });


        /*delete friends*/
        const singleFriendChat = await getDocs(collection(firebaseFirestore,`chatCol/${currentUser.uid}/friends/${friend.id}/chats`))
        singleFriendChat.forEach((chat)=>{
          deleteDoc(chat.ref)
        })
        /*for deleting user's friendsList*/
        deleteDoc(friend.ref)
      });
      console.log('Chat collection processed successfully');
    }catch(e){
      console.log(e)
    }
  }

  const deleteUserReauthenticate = async () => {
    setReauthenticating(true);
    try {
      
      const user = firebaseAuth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      /*await deleteUser(user)*/

      await deleteDoc(doc(firebaseFirestore,`users/${currentUser.uid}`))
      // Create a reference to the profile to delete
      const desertRef = ref(firebaseStorage, `users/${currentUser.uid}/profilePic.jpg`);
      // Delete the dp pic
      deleteObject(desertRef).then(() => {
        // File deleted successfully
      }).catch((error) => {
        // Uh-oh, an error occurred!
      });
      // Optionally, handle success or navigate to another page here
    } catch (error) {
      console.error("Error re-authenticating user:", error);
      // Optionally, display an error message to the user
    } finally {
      setReauthenticating(false);
    }
  };

return (
    <div className="absolute md:relative w-3/5 md:w-2/3 lg:w-[75%] flex flex-col h-full items-center justify-center transition-all duration-100">
      <form onSubmit={handleSubmit} className="px-2 py-2 rounded w-full h-full">
        <h1 className="mb-2 text-xl text-red-600">Delete Account</h1>
        <input
          required
          type="text"
          className="block border border-gray-500 border-opacity-50 bg-transparent outline-none w-full p-1 rounded mb-1"
          name="email"
          placeholder="Email"
          value={currentUser.email}
          readOnly
        />
        <input
          required
          type="password"
          className="block border border-gray-500 border-opacity-50 bg-transparent outline-none w-full p-1 rounded mb-1"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="w-fit text-center px-1 py-[.5px] transition duration-300 hover:text-gray-500 border border-gray-500 border-opacity-50 rounded focus:outline-none my-1"
            onClick={() => setSidePanel("settings")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-fit text-center px-1 py-[.5px] transition duration-300 hover:text-white hover:bg-red-600 border border-gray-500 border-opacity-50 rounded text-red-600 focus:outline-none my-1"
            disabled={reauthenticating || deleteDisabled} // Disable the button based on deletion state
          >
            {reauthenticating ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeleteUser