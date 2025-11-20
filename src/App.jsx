import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home';
import Dashboard from './pages/dashboard';
import Registration from './pages/Registration';
import Login from './pages/login';
import Wrapper from './pages/wrapper';


function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        {/*home*/}
        <Route path="/" element= {<Home />}/>
        <Route path="register" element= {<Registration />}/>
        <Route path="login" element= {<Login />}/>
        <Route path="dashboard" element= 
        
        {
        <Wrapper>
            <Dashboard />
        </Wrapper>
        }/>
      </Routes>
      </BrowserRouter>
    </div>
  )
}
export default App;