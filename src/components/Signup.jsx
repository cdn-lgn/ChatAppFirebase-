import React, { useRef, useState, useCallback } from 'react';
import { useFirebaseContext } from '../context/firebaseContext';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
	const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    photo: null,
    email: '',
    password: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [signUpError, setSignUpError] = useState();
  const { signUp, currentUser } = useFirebaseContext();

  // Function to handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }, []);

  // Function to handle file input changes
	const handleFileChange = useCallback((e) => {
	  console.log(e.target.files[0].name)
	  setFormData(prevState => ({
	    ...prevState,
	    photo: e.target.files[0]
	  }));
	}, []);


  // Function to handle user sign up
  const signUpUser = useCallback(async (e) => {
    e.preventDefault();
    console.log("Sign up form submitted!");
    try {
    	if(!formData.photo){
    		return setSignUpError('Please Select photo')
    	}
      // Check if name is valid
      if (!formData.name || formData.name.length < 3) {
        return setSignUpError("Name must have at least 3 letters.");
      }

      // Email validation regex pattern
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Check if email is in a valid format
      if (!formData.email || !emailPattern.test(formData.email)) {
        return setSignUpError("Please enter a valid email address.");
      }

      // Check if password is valid
      if (!formData.password || formData.password.length < 8) {
        return setSignUpError("Password must have 8 or more characters.");
      }
      setLoginLoading(true);
      await signUp(formData.email, formData.password, formData.photo, formData.name);
      navigate('/');
    } catch (error) {
      setSignUpError(error.code);
      setLoginLoading(false);
    }

    // Clearing form fields after signup attempt
    setFormData({
      name: '',
      photo: null,
      email: '',
      password: ''
    });
  }, [formData, signUp, navigate]);

  return (
    <div className="relative h-dvh w-full bg-gray-900 flex flex-col items-center">
      {loginLoading && (
        <div className="absolute h-screen w-screen flex items-center justify-center backdrop-blur-[5px] z-10">
          <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
        </div>
      )}
      <div className="container md:max-w-sm w-full mx-auto h-full flex-1 flex flex-col items-center justify-center px-2">
        <form className="px-6 py-8 rounded bg-transparent shadow-black shadow-sm text-white w-full h-screen md:h-auto flex flex-col items-center">
          <h1 className="mb-8 text-3xl text-center text-white">Sign up</h1>

          {/* File input for avatar */}
          <input
            id="avatar"
            required
            type="file"
            accept="image/*" // Restrict to only image files
            className="hidden block border border-grey-light w-full p-3 rounded mb-4"
            onInput={handleFileChange}
          />
          <label htmlFor="avatar" className="flex hover:cursor-pointer items-center justify-center rounded-full w-28 mb-8">
            <img className="h-28 w-28 rounded-full rounded object-cover content-center" src={formData.photo ? `${URL.createObjectURL(formData.photo)}` : 'https://cdn.pixabay.com/photo/2017/07/18/23/23/user-2517433_640.png'} onChange={handleFileChange} alt=""/>
          </label>

          {/* Name input */}
          <input
            required
            type="text"
            className="outline-none bg-transparent block border border-gray-800 w-full p-3 rounded mb-4"
            name="name"
            placeholder="Name"
            autoComplete="off"
            value={formData.name}
            onChange={handleInputChange}
            onClick={() => setSignUpError(false)}
          />

          {/* Email input */}
          <input
            required
            type="text"
            className="outline-none bg-transparent block border border-gray-800 w-full p-3 rounded mb-4"
            name="email"
            placeholder="Email"
            autoComplete="off"
            value={formData.email}
            onChange={handleInputChange}
          />

          {/* Password input */}
          <input
            required
            type="password"
            className="outline-none bg-transparent block border border-gray-800 w-full p-3 rounded mb-4"
            name="password"
            placeholder="Password"
            autoComplete="off"
            value={formData.password}
            onChange={handleInputChange}
          />

          {/* Submit button */}
          <button
            type="submit"
            className="w-full text-center py-3 rounded bg-green-600 text-white hover:bg-green-900 focus:outline-none my-1"
            onClick={signUpUser}
          >
            Create Account
          </button>
          
          {/* Display sign up error message */}
          {signUpError && (
            <div>
              <h1 className="text-red-500">{signUpError}</h1>
            </div>
          )}

          {/* Link to login page */}
          <div className="text-white mt-6">
            Already have an account ?
            <a className="no-underline border-b border-blue text-blue pl-2" href="/login">
              Log in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
