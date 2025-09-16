import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import App from './App.tsx';
import Login from './login/Login.tsx';
import Register from './signUp/Register.tsx';
import ProductList from './products/ProductList.tsx';
import Bid from './bid/Bid.tsx';
import Payment from './payment/Payment.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path='/products' element={<ProductList/>}/>
        <Route path='/giveBid' element={<Bid/>} />
        <Route path='/payment' element={<Payment/>}/>
        <Route path="/main" element={<App/>}/>
      </Routes>
    </BrowserRouter>    
  </StrictMode>,
);
