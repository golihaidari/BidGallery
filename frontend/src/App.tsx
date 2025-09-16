
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
//This defines a reusable type alias named DescopeSdkType,Anywhere you need to type a variable as “an instance of the Descope SDK,” you can just use DescopeSdkType.
import DescopeSdk from '@descope/web-js-sdk';

const descopeSdk = DescopeSdk({projectId:"c2e3ebd0-0dd1-4a0f-a8e3-3ad1084a56bd"});
const descopeToken = new URLSearchParams(window.location.search).get("t");

function App() {
  const [count, setCount] = useState(0)
  

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
