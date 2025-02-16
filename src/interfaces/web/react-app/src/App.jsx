import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Login } from './application/components/Login'
import { Home } from './application/components/Home'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App
