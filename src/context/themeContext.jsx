import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null)
export const useThemeContext =()=> useContext(ThemeContext)

export const ThemeContextProvider = (props) =>{
	console.log('theme render...')
	const [theme, setTheme] = useState('light')
	const [primaryColor1, setPrimaryColor1] = useState(null)
	const [primaryColor2, setPrimaryColor2] = useState(null)
	const [primaryColor3, setPrimaryColor3] = useState(null)
	const [primaryColor4, setPrimaryColor4] = useState(null)
	const [primaryColor5, setPrimaryColor5] = useState(null)
	const [ textColor1, setTextColor1 ] = useState(null)
	const [ textColor2, setTextColor2 ] = useState(null)

	//this is for rightSide Panel
    const [sidePanel, setSidePanel] = useState('')


	useEffect(() => {
        if (theme == 'dark') {
            setPrimaryColor1('#010d19');
            setPrimaryColor2('#0682ff');
            setPrimaryColor3('#0d111c');
            setPrimaryColor4('#2ecc71');
            setPrimaryColor5('#cdd1d4');
            setTextColor1('white');
            setTextColor2('black');
        } else {
            setPrimaryColor1('white');
            setPrimaryColor2('#0682ff');
            setPrimaryColor3('#ecf0f1');
            setPrimaryColor4('#2ecc71');
            setPrimaryColor5('#cdd1d4');
            setTextColor1('black');
            setTextColor2('white');
        }
    }, [theme]);	

	return(
		<ThemeContext.Provider value={{
			primaryColor1,
			primaryColor2,
			primaryColor3,
			primaryColor5,
			primaryColor4,
			textColor1,
			textColor2,
			theme, setTheme,
			sidePanel, setSidePanel
		}}>

			{props.children}

		</ThemeContext.Provider>
	)
}