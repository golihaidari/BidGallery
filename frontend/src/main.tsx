import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import '../index.css';

// Components
import Login from '@components/Login.tsx';
import Register from '@components/Register.tsx';
import Products from '@components/Products.tsx';
import Artists from '@components/Artists.tsx'
import Bid from '@components/Bid.tsx';
import Payment from '@components/payment/Payment.tsx';
import ShippingAddress from '@components/ShippingAddress.tsx';
import Submit from '@components/Submit.tsx';

//context
import CheckoutProvider from './context/CheckoutContext.tsx';
import { AuthProvider } from '@context/AuthContext.tsx';
import Cart from '@components/Cart.tsx';
import Layout from '@components/common/AppLayout.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CheckoutProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path='/' element={<Products/>}/>                        
              <Route path='/giveBid' element={<Bid/>} />
              <Route path='/artists' element={<Artists/>} />
            </Route>
              <Route path="/login" element={<Login/>}/>
              <Route path="/register" element={<Register/>}/> 
              <Route path='/cart' element={<Cart/>} />
              <Route path='/delivery' element={<ShippingAddress/>}/>
              <Route path='/payment' element={<Payment/>}/>
              <Route path='/submit' element={<Submit/>}/>                       
          </Routes>
        </BrowserRouter> 
      </CheckoutProvider>
    </AuthProvider>
    
  </StrictMode>,
);
