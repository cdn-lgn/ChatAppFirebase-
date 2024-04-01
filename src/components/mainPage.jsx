import React, { useState } from 'react';
import Sidebar from './chatbox/sidebar';
import CurrentChat from './chatbox/CurrentChat';
import Settings from './chatbox/settings';
import Profile from './chatbox/profile';
import DeleteUser from './chatbox/deleteUser';
import { useFirebaseContext } from '../context/firebaseContext';
import { useThemeContext } from '../context/themeContext';
import { CiSun } from 'react-icons/ci';
import { FaMoon } from 'react-icons/fa';

const MainPage = () => {
    console.log('MainPage render...')
    const { sidePanel, primaryColor1, textColor} = useThemeContext()

    return (
        <div className="h-dvh relative w-screen overflow-x-hidden" style={{ background : primaryColor1 , color : textColor }}>
            <div className="h-full w-full flex rounded-xl">
                {/*it will show your friends and searched users*/}
                <Sidebar />
                {/*to delete Current Signed in user*/}
                {sidePanel=="DeleteUser" && <DeleteUser/>}
                {/*show conversation b/w two users*/}
                {sidePanel=="CurrentChat" && <CurrentChat/>}
                {/*show user's setting section*/}
                {sidePanel=="settings" && <Settings/>}
                {/*show selected users's profile*/}
                {sidePanel=="profile" && <Profile/>}
                
            </div>
        </div>
    );
};

export default MainPage;
