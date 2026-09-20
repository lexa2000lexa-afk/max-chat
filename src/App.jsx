import { useState } from 'react'
import Login from './components/Login'
import ChatWindow from './components/ChatWindow'

function App() {
  const [tokens, setTokens] = useState(null)
  return tokens ? (
    <ChatWindow idInstance={tokens.idInstance} apiTokenInstance={tokens.apiTokenInstance} />
  ) : (
    <Login onLogin={setTokens} />
  )
}

export default App
