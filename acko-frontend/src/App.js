import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PipelineCreation from './pages/PipelineCreation'
import PipelineManagement from './pages/PipelineManagement'
import { WebSocketProvider } from './webSocketContext'
import './app.css'

const App = () => {
  return (
    <WebSocketProvider>
      <Router>
        <Layout>
          <Routes>
            <Route exact path="/" element={<Dashboard />} />
            <Route path="/create" element={<PipelineCreation />} />
            <Route path="/manage/:id" element={<PipelineManagement />} />
          </Routes>
        </Layout>
      </Router>
    </WebSocketProvider>
  )
}

export default App
