import React, { useEffect, useRef, useState } from 'react';
import { MdPermMedia } from 'react-icons/md';
import { BiSend } from 'react-icons/bi';
import { useThemeContext } from '../../context/themeContext';
import { useFirebaseContext } from '../../context/firebaseContext';
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { FaChevronLeft } from 'react-icons/fa';

const CurrentChat = () => {
    console.log('CurrentChat render...')

    // Context and state variables
    const { setSidePanel, primaryColor1, primaryColor2, primaryColor3, primaryColor4, primaryColor5, textColor1, textColor2 } = useThemeContext() //color Context
    const { userSelected, setUserSelected, currentUser, firebaseFirestore } = useFirebaseContext();
    const [input, setInput] = useState(""); // State for input value
    const [currentChat, setCurrentChat] = useState(null); // State for current chat messages

    // Refs
    const chatBottomRef = useRef(null); // Ref for scrolling to the bottom of chat
    const inputRef = useRef(null); // Ref for input field

    // Effect to scroll to bottom when chat updates
    useEffect(() => {
        if (chatBottomRef.current && currentChat && currentChat.length > 0) {
            chatBottomRef.current.scrollIntoView();
        }
    }, [currentChat]);

    // Effect to focus on input field when component mounts
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Effect to fetch chat messages when a user is selected
    useEffect(() => {
        if (userSelected) {
            fetchChat();
        }
    }, [userSelected]);

    // Function to send message
    const sendMessage = async (input) => {
        setInput('');
        try {
            await addDoc(collection(firebaseFirestore, `chatCol/${currentUser.uid}/friends/${userSelected.uid}/chats`), {
                message: input,
                sender: currentUser.uid,
                timeStamp: serverTimestamp()
            });
            await addDoc(collection(firebaseFirestore, `chatCol/${userSelected.uid}/friends/${currentUser.uid}/chats`), {
                message: input,
                sender: currentUser.uid,
                timeStamp: serverTimestamp()
            });
            createFriend(input); // Create friend if not already exists
        } catch (error) {
            console.log(error);
        }
    };

    // Function to handle sending message on Enter key press
    const sendMsg = (event) => {
        if (event.key === 'Enter') {
            sendMessage(input);
        }
    };

    // Function to create a friend entry
    const createFriend = async (input) => {
        try {
            if (!currentUser || !userSelected) return;

            const senderUserRef = doc(firebaseFirestore, `userFriends/${currentUser.uid}/friendData`, `${userSelected.uid}`);
            const receiverUserRef = doc(firebaseFirestore, `userFriends/${userSelected.uid}/friendData`, `${currentUser.uid}`);

            const [senderUserSnap, receiverUserSnap] = await Promise.all([getDoc(senderUserRef), getDoc(receiverUserRef)]);

            if (!senderUserSnap.exists() || !receiverUserSnap.exists()) {
                setDoc(senderUserRef, {
                    lastMessage: input,
                    profileImage: userSelected.profileImage,
                    name: userSelected.name,
                    uid: userSelected.uid,
                    timeStamp: serverTimestamp()
                });
                setDoc(receiverUserRef, {
                    lastMessage: input,
                    profileImage: currentUser.photoURL,
                    name: currentUser.displayName,
                    uid: currentUser.uid,
                    timeStamp: serverTimestamp()
                });
            } else {
                updateDoc(senderUserRef, { timeStamp: serverTimestamp(), lastMessage: input });
                updateDoc(receiverUserRef, { timeStamp: serverTimestamp(), lastMessage: input });
            }
        } catch (error) {
            console.error("Error creating friend:", error);
        }
    };

    // Function to fetch chat messages
    const fetchChat = async () => {
        try {
            const friendChat = collection(firebaseFirestore, `chatCol/${currentUser.uid}/friends/${userSelected.uid}/chats`);
            const orderedChatList = query(friendChat, orderBy("timeStamp"));
            const unsubscribe = onSnapshot(orderedChatList, (snapshot) => {
                const allChat = snapshot.docs.map(doc => doc.data());
                setCurrentChat(allChat);
            });
            return () => unsubscribe();
        } catch (error) {
            console.log(error);
        }
    };

    // Render component only if a user is selected
    if (userSelected) {
        if(userSelected.status==`blockedBy${currentUser.displayName}`){
            return(
                <div 
                    className={`w-3/5 md:w-2/3 lg:w-[75%] flex flex-col w-0 h-full ${!userSelected ? 'w-0 hidden' : 'block w-screen'} transition-all duration-100`} 
                    style={{ background : primaryColor3 , color : textColor1 }}>
                    {/* Top Bar */}
                    <div className="w-full z-10" style={{background:primaryColor3}}>
                        <div className="w-full h-12 flex items-center justify-between px-2 py-2">
                            <div className="h-full flex items-center gap-2 cursor-pointer">
                                <FaChevronLeft className="md:hidden p-1 text-3xl cursor-pointer rounded-full hover:rounded-full hover:bg-[#3f4956] duration-500 transition" onClick={() => setUserSelected(null)} />
                                <img className="h-9 w-9 object-cover rounded rounded-full" src={userSelected.profileImage} alt="" onClick={()=>setSidePanel('profile')}/>
                                <h2 className="text-xl" onClick={()=>setSidePanel('profile')}>{userSelected.name}</h2>
                            </div>
                        </div>
                        <div className="h-[.3px] w-full"></div>
                    </div>
                    <div className="h-full w-full flex items-center justify-center">You are blocked this user</div>
                </div>
            )
        }
        else if(userSelected.status==`blockedBy${userSelected.name}`){
            return(
                <div 
                    className={`w-3/5 md:w-2/3 lg:w-[75%] flex flex-col w-0 h-full ${!userSelected ? 'w-0 hidden' : 'block w-screen'} transition-all duration-100`} 
                    style={{ background : primaryColor3 , color : textColor1 }}>
                        {/* Top Bar */}
                    <div className="w-full z-10" style={{background:primaryColor3}}>
                        <div className="w-full h-12 flex items-center justify-between px-2 py-2">
                            <div className="h-full flex items-center gap-2 cursor-pointer">
                                <FaChevronLeft className="md:hidden p-1 text-3xl cursor-pointer rounded-full hover:rounded-full hover:bg-[#3f4956] duration-500 transition" onClick={() => setUserSelected(null)} />
                                <img className="h-9 w-9 object-cover rounded rounded-full" src={userSelected.profileImage} alt="" onClick={()=>setSidePanel('profile')}/>
                                <h2 className="text-xl" onClick={()=>setSidePanel('profile')}>{userSelected.name}</h2>
                            </div>
                        </div>
                        <div className="h-[.3px] w-full"></div>
                    </div>
                    <div className="h-full w-full flex items-center justify-center">You are blocked by this user</div>
                </div>
            )
        }
        else{
            return (
                <div className={`w-3/5 md:w-2/3 lg:w-[75%] flex flex-col w-0 h-full ${!userSelected ? 'w-0 hidden' : 'block w-screen'} transition-all duration-100`} 
                    style={{ background : primaryColor3 , color : textColor1 }}>
                    {/* Top Bar */}
                    <div className="w-full z-10" style={{background:primaryColor3}}>
                        <div className="w-full h-12 flex items-center justify-between px-2 py-2">
                            <div className="h-full flex items-center gap-2 cursor-pointer">
                                <FaChevronLeft className="md:hidden p-1 text-3xl cursor-pointer rounded-full hover:rounded-full hover:bg-[#3f4956] duration-500 transition" onClick={() => setUserSelected(null)} />
                                <img className="h-9 w-9 object-cover rounded rounded-full" src={userSelected.profileImage} alt="" onClick={()=>setSidePanel('profile')}/>
                                <h2 className="text-xl" onClick={()=>setSidePanel('profile')}>{userSelected.name}</h2>
                            </div>
                        </div>
                        <div className="h-[.3px] w-full"></div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-grow overflow-y-auto scrollBarHider /*bg-[url('./chat-bg.png')]*/ bg-cover">
                        {/* Chats */}
                        <div className="w-full p-1 flex flex-col">
                            {currentChat && currentChat.map((message, index) => (
                                <div key={index} className={`my-2 w-fit md:max-w-[60%] max-w-[90%] break-words p-2 rounded-xl ${message.sender === currentUser.uid ? 'rounded-tr-none self-end' : 'rounded-tl-none'}`}
                                    style={{ background : primaryColor2 , color : textColor2 }}>
                                    <p>{message.message}</p>
                                </div>
                            ))}
                            <div ref={chatBottomRef}></div>
                        </div>
                    </div>

                    {/* Input Bar */}
                    <div className="w-full" style={{background:primaryColor1}}>
                        <div className="w-full h-12 flex items-center justify-center">
                            <div className="w-full h-10 my-2 mx-1 flex items-center justify-center gap-2 md:gap-6">
                                <input ref={inputRef} name="message" autoComplete="off" className="h-full w-full outline-none rounded rounded-2xl p-4 text-xl" 
                                    style={{ background: primaryColor5, color:'black'}} 
                                    type="text" onChange={(e) => setInput(e.target.value)} value={input} onKeyDown={sendMsg} />
                                <input className="w-full hidden" id="fileSender" type="file" />
                                <label className="cursor-pointer text-2xl hidden" htmlFor="fileSender">
                                    <MdPermMedia style={{color:primaryColor5}}/>
                                </label>
                                <button onClick={() => sendMessage(input)} className="cursor-pointer -rotate-45 text-2xl p-1 rounded-full" style={{background:primaryColor2 , color:textColor2}}>
                                    <BiSend />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    } else {
        // Render nothing if no user is selected
        return null;
    }
};

export default CurrentChat;
