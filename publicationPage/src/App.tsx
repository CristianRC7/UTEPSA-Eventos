import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SharedPublication from './pages/sharedPublication'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SharedPublication />} />
        <Route path="/sharedPublication" element={<SharedPublication />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
