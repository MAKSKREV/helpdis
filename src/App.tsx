import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Knopka from './components/knopka'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Knopka/>
    </>
  )
}

export default App
