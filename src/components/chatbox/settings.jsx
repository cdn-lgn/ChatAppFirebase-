import React, { useCallback, useEffect, useState } from 'react'
import { useThemeContext } from '../../context/themeContext';
import { useFirebaseContext } from '../../context/firebaseContext';
import { FaChevronLeft } from 'react-icons/fa';
import { FiEdit2 } from 'react-icons/fi';
import { collection, doc, getDoc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { createUserWithEmailAndPassword, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { TbLogout } from 'react-icons/tb';
import { MdDeleteForever } from 'react-icons/md';
import { CgDarkMode } from 'react-icons/cg';

const Settings = () => {
  const {currentUser, setLoading, setCurrentUser, firebaseFirestore, firebaseStorage, firebaseAuth, signOutFunction, deleteCurrentUser} = useFirebaseContext()
  const {sidePanel, setSidePanel, primaryColor1, primaryColor2, primaryColor3, primaryColor4, primaryColor5, textColor1, textColor2, theme, setTheme} = useThemeContext()
  const [imageFullView, setImageFullView] = useState(false)
  const [profileEdit, setProfileEdit] = useState(false)
  const [updateDetails,setUpdateDetails] = useState({
    name:currentUser.displayName,
    about:'',
    gender:'',
    photo:null,
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!currentUser || !firebaseFirestore) return;

        const userDocRef = doc(firebaseFirestore, `users/${currentUser.uid}`);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData) {
            setUpdateDetails((prevDetails) => ({
              ...prevDetails,
              about: userData.about || '',
              gender: userData.gender || '',
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [currentUser, firebaseFirestore]);


  // Function to handle file input changes
  const handleFileChange = useCallback((e) => {
    setUpdateDetails(prevState => ({
      ...prevState,
      photo: e.target.files[0]
    }));
    console.log(updateDetails)
  }, []);

  const updateProfileData=async()=>{
    try{
      /*setLoading(true)*/
      /*photo update*/
      const photoPath = `users/${currentUser.uid}/profilePic.jpg`;
      if(updateDetails.photo){
        await uploadBytesResumable(ref(firebaseStorage, photoPath), updateDetails.photo);
      }

      /*getting photourl to add it in upadteDoc*/
      const photoUrl = await getDownloadURL(ref(firebaseStorage, photoPath))
      console.log(photoUrl)

      /*text update*/
      const currentUserRef = doc(firebaseFirestore, `users/${currentUser.uid}`)
      await updateDoc(currentUserRef, {name:updateDetails.name, about:updateDetails.about, gender:updateDetails.gender, profileImage:photoUrl})

      await updateProfile(firebaseAuth.currentUser, {
        displayName:updateDetails.name,
      })

      setCurrentUser({...currentUser, displayName:updateDetails.name, photoURL:photoUrl})


      /*the below code is for where currentUser detail will be upated in his friends database*/
      const userFriends= collection(firebaseFirestore, `userFriends/${currentUser.uid}/friendData`)
      onSnapshot((userFriends),(snapshot)=>{
        snapshot.docs.map(friendFromList =>{
          const singleFriendPath = doc(firebaseFirestore, `userFriends/${friendFromList.data().uid}/friendData/${currentUser.uid}`) 
          updateDoc( singleFriendPath ,{name:updateDetails.name, about:updateDetails.about, gender:updateDetails.gender, profileImage:photoUrl})
        })
      })
    }catch(e){
      console.log(e)
    }
    setProfileEdit(false)
    /*setLoading(false)*/
  }


  const deleteUser = () =>{
    setSidePanel('DeleteUser')
  }

  return (
    <div className={`absolute md:relative w-3/5 md:w-2/3 lg:w-[75%] flex flex-col h-full ${!sidePanel ? 'w-0 hidden' : 'block w-screen'} transition-all duration-100`}  style={{background:primaryColor1}}>
      <div className="h-14 p-2 flex items-center" style={{background:primaryColor3}}>
        <FaChevronLeft className="p-1 text-3xl cursor-pointer hover:opacity-60 transition-all duration-300" style={{color:textColor1}} onClick={() => setSidePanel(null)} />
      </div>
      

      <div className="shadow rounded-lg border mb-4" style={{color:textColor1, borderColor:textColor2,display: profileEdit && 'none'}}>
          <div className="md:px-4 py-5 md:justify-start flex items-center justify-center">
            <img className="relative h-28 w-28 object-cover cursor-pointer rounded-full transition-all duration-300" src={currentUser.photoURL} alt="" onClick={()=>setImageFullView(true)}/>
        </div>

          <div className="px-4 py-5 sm:p-0" style={{color:textColor1}}>
              <dl>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                          Name
                      </dt>
                      <dd className="mt-1 text-xl sm:mt-0 sm:col-span-2">
                          {currentUser.displayName}
                      </dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                          Gender
                      </dt>
                      <dd className="mt-1 text-xl sm:mt-0 sm:col-span-2">
                          {updateDetails.gender}
                      </dd>
                  </div>
                  <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                          About
                      </dt>
                      <dd className="mt-1 text-xl sm:mt-0 sm:col-span-2">
                          {updateDetails.about}
                      </dd>
                  </div>
              </dl>
          </div>

          <div className="text-center m-3 flex items-center justify-center">
            <button type="button" className="flex items-center justify-center gap-1 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-3 py-1 text-center me-2 mb-2" onClick={()=>setProfileEdit(true)}>edit <FiEdit2 /></button>
          </div>
      </div>


      {/*Open Image in Full screen view*/}
      {imageFullView && (
        <div className="absolute h-full w-full bg-black bg-opacity-40"  onClick={()=>setImageFullView(false)}>
          <div>
            <img className="md:aspect-auto aspect-square w-screen object-cover h-auto md:h-screen md:w-auto" src={currentUser.photoURL} alt=""/>
          </div>
        </div>
      )}


      {/*function to edit user's profile*/}
      {profileEdit && (
        <main className="shadow rounded-lg border h-auto" style={{color:textColor1, borderColor:textColor2,}}>
              <div className="p-4">
                  <div className="w-full px-2 pb-8 sm:max-w-xl sm:rounded-lg">

                      <div className="grid max-w-2xl mx-auto">
                          <div className="flex flex-col items-center sm:flex-row sm:space-y-0">

                              <img className="h-28 w-28 object-cover rounded-full transition-all duration-300"
                                  src={updateDetails.photo ? URL.createObjectURL(updateDetails.photo) : currentUser.photoURL}
                                  alt="Bordered avatar"/>

                              <div className="flex flex-col sm:ml-8 gap-4">
                                <input
                            id="changePhoto"
                            required
                            type="file"
                            accept="image/*" // Restrict to only image files
                            className="hidden block border border-grey-light w-full p-3 rounded mb-4"
                            onInput={handleFileChange}
                          />
                                  <label htmlFor="changePhoto"
                                      className="cursor-pointer py-2 px-2 text-base font-medium rounded-lg hover:bg-indigo-900">
                                      Change picture
                                  </label>
                              </div>
                          </div>

                          <div className="items-center mt-8 sm:mt-14">
                    <div className="flex flex-col items-center w-full mb-2 space-x-0 space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 sm:mb-6">
                        <div className="w-full">
                            <label className="block mb-2 text-sm font-medium">Your name</label>
                            <input
                                type="text"
                                id="name"
                                className="bg-transparent outline-none border border-indigo-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                                placeholder="Your first name"
                                value={updateDetails.name}
                                onChange={(e) => setUpdateDetails({ ...updateDetails, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col items-center w-full mb-2 space-x-0 space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 sm:mb-6">
                        <label className="block mb-2 text-sm font-medium">Gender</label>
                        <div className="w-full pt-6 flex items-center justify-center gap-5">
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={updateDetails.gender === 'male'}
                                    onChange={(e) => setUpdateDetails({ ...updateDetails, gender: e.target.value })}
                                />
                                Male
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={updateDetails.gender === 'female'}
                                    onChange={(e) => setUpdateDetails({ ...updateDetails, gender: e.target.value })}
                                />
                                Female
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="other"
                                    checked={updateDetails.gender === 'other'}
                                    onChange={(e) => setUpdateDetails({ ...updateDetails, gender: e.target.value })}
                                />
                                Other
                            </label>
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium">About</label>
                        <textarea
                            id="message"
                            rows="5"
                            className="bg-transparent block p-2.5 w-full text-sm outline-none rounded-lg border border-indigo-300 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Write your bio here..."
                            value={updateDetails.about}
                            onChange={(e) => setUpdateDetails({ ...updateDetails, about: e.target.value })}
                        ></textarea>
                    </div>
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="flex items-center justify-center gap-1 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-3 py-1 text-center me-2 mb-2"
                            onClick={updateProfileData}
                        >
                            Save
                        </button>
                    </div>
                </div>

                      </div>
                  </div>
              </div>
          </main>
      )}
      

      {/*blocked users*/}
      {/*<BlockedUsers />*/}


      {/*dark mode and light mode*/}
      {theme === 'light' ? 
        <button className="flex items-center gap-4 px-2 py-2 cursor-pointer w-fit shadow rounded-lg border h-auto" style={{color:textColor1, borderColor:textColor2,}} onClick={()=>setTheme('dark')}><CgDarkMode />Dark mode</button>
        :
        <button className="flex items-center gap-4 px-2 py-2 cursor-pointer w-fit shadow rounded-lg border h-auto" style={{color:textColor1, borderColor:textColor2,}} onClick={()=>setTheme('light')}><CgDarkMode />Light mode</button>
      }


      <div className="mt-5 flex gap-2 flex-col">
        {/*log out section*/}
        <div className="flex items-center gap-4 px-2 py-2 cursor-pointer w-fit shadow rounded-lg border h-auto" style={{color:textColor1, borderColor:textColor2,}} onClick={()=>signOutFunction()}>
          <TbLogout className="text-red-600 text-2xl"/>
          <h6>Log Out</h6>
        </div>        

        {/*delete acc section*/}
        <div className="flex items-center gap-4 px-2 py-2 cursor-pointer w-fit shadow rounded-lg border h-auto" style={{color:textColor1, borderColor:textColor2,}} onClick={()=>deleteUser()}>
          <MdDeleteForever className="text-red-600 text-2xl"/>
          <h6>Delete Account</h6>
        </div>        
      </div>

    </div>
  )
}

export default Settings