import React, { useEffect, useState } from 'react';
/*import { signOut } from 'firebase/auth'; // Importing signOut function from firebase/auth*/
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query, where, getDocs } from 'firebase/firestore'; // Importing Firestore functions
import { useThemeContext } from '../../context/themeContext';
import { useFirebaseContext } from '../../context/firebaseContext';
import { IoMdSettings } from 'react-icons/io';

const Sidebar = () => {
    // State variables
    const { sidePanel, setSidePanel, primaryColor1, primaryColor2, primaryColor3, primaryColor4, primaryColor5, textColor1, textColor2 } = useThemeContext() //color Context
    const [search, setSearch] = useState(""); // State for search input value
    const [userSearched, setUserSearched] = useState([]); // State for searched users
    const { currentUser, firebaseFirestore, signOutFunction, userSelected, setUserSelected } = useFirebaseContext(); // Destructuring values from Firebase context
    const [friendList, setFriendList] = useState(null); // State for friend list
    const navigate = useNavigate(); // Navigation function

    // Fetch friend list on mount
    useEffect(() => {
        if (currentUser) {
            fetchFriends();
        }
    }, [currentUser]);

    // Fetch friends from Firestore
    const fetchFriends = async () => {
        try {
            const friendCollectionRef = collection(firebaseFirestore, `userFriends/${currentUser.uid}/friendData`); // Reference to user's friend collection
            const orderedFriends = query(friendCollectionRef, orderBy("timeStamp", 'desc')); // Query for ordering friends by timestamp
            const unsubscribe = onSnapshot(orderedFriends, (snapshot) => {
                const updatedFriendList = snapshot.docs.map(doc => {
                    const { lastMessage, uid, name, profileImage, gender, about, status } = doc.data();
                    return { lastMessage, uid, name, profileImage, gender, about, status };
                });
                setFriendList(updatedFriendList); // Set friend list state
            });
            return () => unsubscribe(); // Unsubscribe from snapshot listener on component unmount
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    };

    // Search for users in Firestore
    const searchUser = async (e) => {
        setSearch(e.target.value);
        const q = query(collection(firebaseFirestore, 'users'), where('name', '==', e.target.value)); // Query for searching users by name
        const querySnapshot = await getDocs(q); // Execute query
        if (querySnapshot.empty) {
            setUserSearched(null); // If no users found, set userSearched state to null
            return;
        }
        const searchedUsers = [];
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData.uid !== currentUser.uid && !friendList.map((friend) => friend.uid).includes(userData.uid)) {
                searchedUsers.push(userData);
            }
        });
        setUserSearched(searchedUsers); // Set userSearched state with found users
    };

    // Sign out handler
    const signOutHandler = async () => {
        try {
            await signOutFunction();
            navigate('/login'); // Redirect to login page after sign out
        } catch (e) {
            console.log(e);
        }
    };

    // JSX rendering
    return (
        <div className={`h-full md:w-1/3 lg:w-[25%] flex flex-col ${!userSelected || !sidePanel ? 'w-screen' : 'w-0'} transition-all duration-100`} style={{color: textColor1}}>
            {/* User Info and Logout */}
            <div className="w-full">
                <div className="w-full h-12 flex items-center justify-between px-2 py-2" style={{background:primaryColor1 , color:textColor1}}>
                    <div className="h-full flex items-center gap-2 cursor-pointer">
                        <img className="h-10 w-10 object-cover rounded rounded-full" src={currentUser.photoURL} alt="" />
                        <h2 className="text-xl">{currentUser.displayName}</h2>
                    </div>

                    {/*setings*/}
                    <IoMdSettings className="text-3xl cursor-pointer opacity-50 hover:rotate-45 transition-all duration-100" style={{color:textColor1}} onClick={()=>setSidePanel('settings')}/>
                </div>
                <div className="h-[.3px] w-full"></div>
            </div>

            {/* Search Users */}
            <div className="w-full my-4 px-2">
                <input
                    className="w-full h-8 rounded rounded-xl px-3 bg-transparent border border-2 outline-none"
                    style={{borderColor:primaryColor5 }}
                    maxLength="20"
                    type="text"
                    name="searchUser"
                    onChange={searchUser}
                    value={search}
                    placeholder="Search users..."
                />
                {/* Display searched users */}
                {userSearched && userSearched.map((user, index) => (
                    <div key={index} className="h-12 w-full flex items-center gap-2 cursor-pointer" onClick={() => {
                        setUserSearched([])
                        setSidePanel('CurrentChat')
                        return setUserSelected(user)
                    }}>
                        <img className="h-10 w-10 object-cover rounded rounded-full" src={user.profileImage} alt="" onClick={()=>setSidePanel('profile')}/>
                        <h2 className="text-xl">{user.name}</h2>
                    </div>
                ))}
            </div>

            {/* Display selected user */}
            {userSelected && friendList && friendList.map((friend) => friend.uid).includes(userSelected.uid) ? '' : (
                <div className="w-full">
                    {userSelected && (
                        <div className="w-full h-12 flex items-center justify-between px-2 py-2">
                            <div className="h-full flex items-center gap-2 cursor-pointer">
                                <img className="h-10 w-10 object-cover rounded rounded-full" src={userSelected.profileImage} alt="" onClick={()=>setSidePanel('profile')}/>
                                <h2 className="text-xl">{userSelected.name}</h2>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Display friend list */}
            {friendList && friendList.map((friend, index) => (
                <div key={index} className="w-full h-12 flex items-center justify-between px-2 py-2 cursor-pointer" onClick={() =>{ 
                    setSidePanel('CurrentChat')
                    return setUserSelected(friend)
                }}>
                    <div className="h-full flex items-center gap-2">
                        <img className="h-10 w-10 object-cover rounded rounded-full" src={friend.profileImage} alt=""  onClick={(e) => {
                            e.stopPropagation(); // Stop event propagation
                            setUserSelected(friend)
                            return setSidePanel('profile');
                        }}/>
                        <div className="">
                            <h2 className="text-xl h-[22px]">{friend.name}</h2>
                            <p className="text-[xl-2px]">{friend.lastMessage}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Sidebar;
