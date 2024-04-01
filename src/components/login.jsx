import React, { useState } from 'react';
import {useFirebaseContext} from '../context/firebaseContext'
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false)
  const [signInError, setSignInError] = useState(false)


  const { signIn, currentUser } = useFirebaseContext();
  const logInUser = async (e) => {
    e.preventDefault();

    try {

      // Email validation regex pattern
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Check if email is in a valid format
      if (!email || !emailPattern.test(email)) {
        return setSignInError("Please enter a valid email address.");
      }

      // Check if password is valid
      if (!password || password.length < 8) {
        return setSignInError("Password must have 8 or more characters.");
      }

      setLoginLoading(true)
      await signIn(email, password);
      navigate('/')

    } catch (error) {
      setSignInError(error.code)
      setLoginLoading(false)
    }

    setEmail("");
    setPassword("");
  };

  if(currentUser){
    setLoginLoading(false)
  }

  return (
    <div className="relative bg-gray-900 w-full h-screen flex flex-row-reverse items-center justify-between">
      {loginLoading==true && (
        <div className="absolute h-full w-screen flex items-center justify-center backdrop-blur-[5px]">
          <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
        </div>
      )}
      <div className="container md:max-w-sm w-full h-dvh md:h-auto mx-auto flex-1 flex flex-col items-center justify-center px-2">
        <form className="px-6 py-8 rounded shadow-black shadow-sm text-white w-full h-full">
          <h1 className="mb-8 text-3xl text-center text-white">Log in</h1>
          <input
            required
            type="text"
            className="block border border-gray-800 bg-transparent outline-none w-full p-3 rounded mb-4"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            required
            type="password"
            className="block border border-gray-800 bg-transparent outline-none w-full p-3 rounded mb-4"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full text-center py-3 rounded bg-green-600 text-white hover:bg-green-900 focus:outline-none my-1"
            onClick={(e) => logInUser(e)}
          >
            Sign in
          </button>

          {signInError && (
            <div>
              <h1 className="text-red-500 text-center">{signInError}</h1>
            </div>
          )}

          <div className="text-grey-dark mt-6 text-white w-full flex flex-row justify-center gap-2 items-center">
            New Account ?
            <a className="no-underline border-b border-blue text-blue text-white" href="/signup">
              Sign up
            </a>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Login;
