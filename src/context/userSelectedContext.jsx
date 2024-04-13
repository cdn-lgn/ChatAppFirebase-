import { createContext, useContext, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

const UserSelectedContext = createContext(null)
export const useUserSelectedContext =()=> useContext(UserSelectedContext)

export const UserSelectedContextProvider = (props)=>{
	const [ userSelected, setUserSelected ] = useState(null)
	
    return(
    	<UserSelectedContext.Provider value={{userSelected,setUserSelected}}>
    		{props.children}
    	</UserSelectedContext.Provider>
    )
}