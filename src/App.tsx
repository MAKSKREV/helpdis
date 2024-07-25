import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Knopka from './components/knopka'


function App() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
    } else {
      setFile(null);
    }
  };
  return (
    <>
    <Knopka/>
    </>
  );
}

export default App;