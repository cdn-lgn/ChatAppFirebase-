import React, { useState } from 'react';
import { useFirebaseContext } from '../../context/firebaseContext';
import { useThemeContext } from '../../context/themeContext';
import { FaChevronLeft } from 'react-icons/fa';
import { IoVideocamOutline } from 'react-icons/io5';
import { RiUserVoiceLine } from 'react-icons/ri';
import { FaRegMessage } from 'react-icons/fa6';
import { MdBlock, MdClearAll } from 'react-icons/md';
import { CgUnblock } from 'react-icons/cg';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { LiaUserFriendsSolid } from 'react-icons/lia';
import { useUserSelectedContext } from '../../context/userSelectedContext';



const Profile = () => {
  // Using custom hooks to access context values
  const { /*userSelected, setUserSelected,*/ currentUser, firebaseFirestore } = useFirebaseContext();
  const { setSidePanel, primaryColor1, primaryColor3, textColor1, textColor2 } = useThemeContext();
  const [imageFullView, setImageFullView] = useState(false);
  const { userSelected,setUserSelected } = useUserSelectedContext()











  // Function to clear chat messages
  const clearChat = async () => {
    try {
      const chatCollection = await getDocs(collection(firebaseFirestore, `chatCol/${currentUser.uid}/friends/${userSelected.uid}/chats`));
      chatCollection.forEach((doc) => {
        deleteDoc(doc.ref);
      });
    } catch (e) {
      console.log(e);
    }
  };

  /*delete friend function*/
  const deleteFriend =async()=>{
    const friendRef = doc(firebaseFirestore,`userFriends/${currentUser.uid}/friendData`, `${userSelected.uid}`)
    deleteDoc(friendRef)
    setSidePanel("")
  }

  // Function to block a user
  const blockUser = () => {
    const senderUserRef = doc(firebaseFirestore, `userFriends/${currentUser.uid}/friendData`, `${userSelected.uid}`);
    updateDoc(senderUserRef, { status: `blockedBy${currentUser.displayName}` });
    const receiverUserRef = doc(firebaseFirestore, `userFriends/${userSelected.uid}/friendData`, `${currentUser.uid}`);
    updateDoc(receiverUserRef, { status: `blockedBy${currentUser.displayName}` });
    setUserSelected({
      ...userSelected,
      status: `blockedBy${currentUser.displayName}`,
    });
  };

  // Function to unblock a user
  const unblockUser = () => {
    const senderUserRef = doc(firebaseFirestore, `userFriends/${currentUser.uid}/friendData`, `${userSelected.uid}`);
    updateDoc(senderUserRef, { status: `notBlocked` });
    const receiverUserRef = doc(firebaseFirestore, `userFriends/${userSelected.uid}/friendData`, `${currentUser.uid}`);
    updateDoc(receiverUserRef, { status: `notBlocked` });
    setUserSelected({
      ...userSelected,
      status: `notBlocked`,
    });
  };

  return (
    <div className={`relative w-3/5 md:w-2/3 lg:w-[75%] flex flex-col w-0 h-full ${ !userSelected ? 'w-0 hidden' : 'block w-screen'} transition-all duration-100`} style={{ background: primaryColor1 }}>
      {/* Header */}
      <div className="w-screen h-14 p-2 flex items-center" style={{ background: primaryColor3 }}>
        <FaChevronLeft className="p-1 text-3xl cursor-pointer hover:opacity-60 transition-all duration-300" style={{ color: textColor1 }} onClick={() => setSidePanel('CurrentChat')} />
      </div>

      {/* User Profile */}
      <div className="shadow rounded-lg border" style={{ color: textColor1, borderColor: textColor2 }}>
        <div className="md:px-4 py-5 md:justify-start flex items-center justify-center">
          <img className="relative h-28 w-28 object-cover cursor-pointer rounded-full transition-all duration-300" src={userSelected.profileImage} alt="" onClick={() => setImageFullView(true)} />
        </div>
        <div className="px-4 py-5 sm:p-0">
          <dl>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-xl sm:mt-0 sm:col-span-2">{userSelected.name}</dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="mt-1 text-xl sm:mt-0 sm:col-span-2">{userSelected.gender ? userSelected.gender : "_"}</dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">About</dt>
              <dd className="mt-1 text-xl sm:mt-0 sm:col-span-2">{userSelected.about ? userSelected.about : "_"}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Options */}
      <div>
        <dl className="my-4 mx-2 md:mx-8 grid md:grid-cols-3 grid-cols-none" style={{ color: textColor1 }}>
          {/* Message */}
          <div className="flex items-center gap-4 px-2 py-2 cursor-pointer w-fit" onClick={() => setSidePanel('CurrentChat')}>
            <dt className="text-green-700 text-xl"><FaRegMessage /></dt>
            <dl>Message</dl>
          </div>
          {/* Voice Call */}
          {/*<div className="flex items-center gap-4 px-2 py-2 cursor-pointer w-fit">
            <dt className="text-gray-600 text-xl"><RiUserVoiceLine /></dt>
            <dl>Voice Call</dl>
          </div>
*/}          {/* Video Call */}
          {/*<div className="flex items-center gap-4 px-2 py-2 cursor-pointer w-fit">
            <dt className="text-blue-600 text-xl"><IoVideocamOutline /></dt>
            <dl>Video Call</dl>
          </div>*/}
        </dl>
      </div>

      {/* Additional Options */}
      <div>
        <dl className="my-4 mx-2 md:mx-8 grid md:grid-cols-3 grid-cols-none" style={{ color: textColor1 }}>
          {/* Clear Chat */}
          {userSelected.lastMessage && (
            <div className="flex items-center gap-4 px-2 py-2 cursor-pointer w-fit" onClick={() => clearChat()}>
              <dt className="text-red-600 text-xl"><MdClearAll /></dt>
              <dl>Clear Chat</dl>
            </div>
          )}
          {/* Delete Friend */}
          {userSelected.lastMessage && (
            <div className="flex items-center gap-4 px-2 py-2 cursor-pointer w-fit" onClick={()=>deleteFriend()}>
              <dt className="text-red-600 text-xl"><LiaUserFriendsSolid /></dt>
              <dl>Delete Friend</dl>
            </div>
          )}
          {/* Block/Unblock */}
          {userSelected.status === `blockedBy${currentUser.displayName}` ? (
            <div className="flex items-center gap-4 px-2 py-2 cursor-pointer w-fit" onClick={() => unblockUser()}>
              <dt className="text-red-600 text-xl"><CgUnblock /></dt>
              <dl>Unblock</dl>
            </div>
          ) : (
            <div className="flex items-center gap-4 px-2 py-2 cursor-pointer w-fit" onClick={() => blockUser()}>
              <dt className="text-red-600 text-xl"><MdBlock /></dt>
              <dl>Block</dl>
            </div>
          )}
        </dl>
      </div>

      {/* Full Screen Image View */}
      {imageFullView && (
        <div className="absolute h-full w-full bg-black bg-opacity-40" onClick={() => setImageFullView(false)}>
          <div>
            <img className="md:aspect-auto aspect-square w-screen object-cover h-auto md:h-screen md:w-auto" src={userSelected.profileImage} alt="" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
