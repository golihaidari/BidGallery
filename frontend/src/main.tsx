import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import '../index.css';
import Login from './components/login/Login.tsx';
import Register from './components/register/Register.tsx';
import Products from './components/products/Products.tsx';
import Bid from './components/bid/Bid.tsx';
import Payment from './components/payment/Payment.tsx';
import CheckoutProvider from './context/CheckoutContext.tsx';
import { ThemeProvider } from "@mui/material/styles";
import theme from "./Theme.tsx";
import ShippingAddress from '@components/delivery/ShippingAddress.tsx';
import Submit from '@components/submit/Submit.tsx';
import { AuthProvider } from '@context/AuthContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}> 
      <AuthProvider>
        <CheckoutProvider>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Products/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path="/register" element={<Register/>}/>          
              <Route path='/giveBid' element={<Bid/>} />
              <Route path='/delivery' element={<ShippingAddress/>}/>
              <Route path='/payment' element={<Payment/>}/>
              <Route path='/submit' element={<Submit/>}/>            
            </Routes>
          </BrowserRouter> 
        </CheckoutProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
