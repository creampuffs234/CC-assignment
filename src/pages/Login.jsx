import React, { useState } from "react";
import supabase from "../helper/supabaseClient";
import {Link,useNavigate} from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [message, setMessage] = useState("");
      const [error, setError] = useState(false);
    
      const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("Creating user...");
        setError(false);
    
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
    
        if (error) {
          setMessage(error.message);
          setError(true);
             setEmail("");
            setPassword("");
          return;
        }
    
        if (data) {
          navigate("/dashboard");
          return null;
        }
    
     
      };
    
  return (

        <div className="min-h-screen flex items-center justify-center bg-red-300 p-4">
      <div className="bg-black shadow-lg rounded-lg p-8 w-full max-w-md ">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          Login page
        </h2>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-blue-400 p-6 rounded-lg">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors font-semibold"
          >
            Log in
          </button>
        </form>
        <span>Don't have an account?</span>
        <Link to= "/login">create one</Link>

      </div>
    </div>
  );
  
}

export default Login;
