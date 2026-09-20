import { useEffect, useState, useRef } from 'react'
import { sendMessage, receiveNotification, deleteNotification } from '../api/greenApi'

function ChatWindow({ idInstance, apiTokenInstance }) {
  const [chats, setChats] = useState([])
  const [messages, setMessages] = useState([])
  const [inputPhone, setInputPhone] = useState('')
  const [inputText, setInputText] = useState('')
  const [activeChat, setActiveChat] = useState(null)
  const [search, setSearch] = useState('')
  const [sendError, setSendError] = useState('')
  const messagesEndRef = useRef(null)
  const lastSentRef = useRef(null)

  const chatsRef = useRef([])
  useEffect(() => { chatsRef.current = chats }, [chats])

  const normalizePhone = (raw) => {
    if (!raw) return ''
    return String(raw).replace(/[^0-9]/g, '')
  }

  const findChatByPhone = (phone) => {
    const norm = normalizePhone(phone)
    if (!norm) return null
    const currentChats = chatsRef.current

    let chat = currentChats.find((c) => c.phone === norm)
    if (chat) return chat.phone

    const last10 = norm.slice(-10)
    if (last10.length >= 7) {
      chat = currentChats.find((c) => c.phone.slice(-10) === last10)
      if (chat) return chat.phone
    }

    const last7 = norm.slice(-7)
    chat = currentChats.find((c) => c.phone.slice(-7) === last7)
    if (chat) return chat.phone

    return null
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!idInstance || !apiTokenInstance) return

    let active = true
    let timeoutRef

    const poll = async () => {
      if (!active) return
      try {
        const res = await receiveNotification(idInstance, apiTokenInstance)

        if (res && res.receiptId) {
          const body = res.body

          if (body?.typeWebhook === 'incomingMessageReceived') {
            const chatId = body?.senderData?.chatId || ''
            const phone = normalizePhone(chatId.split('@')[0])
            const text = body?.messageData?.textMessageData?.textMessage || ''
            const senderName = body?.senderData?.senderName || phone

            if (phone && text) {
              let matchedPhone = findChatByPhone(phone)

              if (!matchedPhone && lastSentRef.current) {
                const secondsSinceLastSend = (Date.now() - lastSentRef.current.time) / 1000
                if (secondsSinceLastSend < 300) {
                  matchedPhone = lastSentRef.current.phone
                }
              }

              if (matchedPhone) {
                setMessages((prev) => [...prev, { id: res.receiptId, from: 'other', text, phone: matchedPhone }])
                setChats((prev) => prev.map((c) =>
                  c.phone === matchedPhone ? { ...c, lastMessage: text } : c
                ))
              } else {
                setChats((prev) => {
                  if (prev.find((c) => c.phone === phone)) return prev
                  return [...prev, { phone, name: senderName, lastMessage: text }]
                })
                setMessages((prev) => [...prev, { id: res.receiptId, from: 'other', text, phone }])
              }
            }
          }

          await deleteNotification(idInstance, apiTokenInstance, res.receiptId)
        }
      } catch {
        // тихо
      } finally {
        if (active) timeoutRef = setTimeout(poll, 3000)
      }
    }

    poll()
    return () => { active = false; clearTimeout(timeoutRef) }
    // eslint-disable-next-line
  }, [idInstance, apiTokenInstance])

  const createChat = () => {
    const clean = normalizePhone(inputPhone)
    if (!clean) return
    if (chats.find((c) => c.phone === clean)) {
      setActiveChat(clean)
      setInputPhone('')
      return
    }
    setChats((prev) => [...prev, { phone: clean, name: clean, lastMessage: '' }])
    setActiveChat(clean)
    setInputPhone('')
  }

  const send = async () => {
    if (!activeChat || !inputText.trim()) return
    setSendError('')
    try {
      const chatId = `${activeChat}@c.us`
      await sendMessage(idInstance, apiTokenInstance, chatId, inputText)

      lastSentRef.current = { phone: activeChat, time: Date.now() }

      setMessages((prev) => [...prev, { id: Date.now(), from: 'me', text: inputText, phone: activeChat }])
      setChats((prev) => prev.map((c) =>
        c.phone === activeChat ? { ...c, lastMessage: inputText } : c
      ))
      setInputText('')
    } catch (e) {
      setSendError(e.message)
    }
  }

  const visibleMessages = messages.filter((m) => m.phone === activeChat)
  const filteredChats = chats.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Список чатов */}
      <div style={{ width: '320px', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FF6B00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>M</div>
          <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>MAX</span>
        </div>

        <div style={{ padding: '0.5rem 1rem' }}>
          <input
            type="text"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: 'none', borderRadius: '8px', background: '#f5f5f5', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>

        <div style={{ padding: '0 1rem 0.5rem', display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Номер (цифры)"
            value={inputPhone}
            onChange={(e) => setInputPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createChat()}
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
          />
          <button onClick={createChat} style={{ padding: '0.5rem 0.8rem', border: 'none', borderRadius: '8px', background: '#FF6B00', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>+</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredChats.map((c) => {
            const lastMsg = [...messages].reverse().find((m) => m.phone === c.phone)
            return (
              <div
                key={c.phone}
                onClick={() => setActiveChat(c.phone)}
                style={{
                  padding: '0.8rem 1rem', cursor: 'pointer', display: 'flex', gap: '0.7rem', alignItems: 'center',
                  background: activeChat === c.phone ? '#FFF3E6' : 'transparent',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#FF6B00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '600', fontSize: '1rem', flexShrink: 0 }}>
                  {c.name[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {lastMsg?.text || 'Нет сообщений'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Окно чата */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
        {activeChat ? (
          <>
            <div style={{ padding: '0.8rem 1.5rem', borderBottom: '1px solid #e0e0e0', background: '#fff', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FF6B00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '600' }}>
                {chats.find((c) => c.phone === activeChat)?.name[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div style={{ fontWeight: '600' }}>{chats.find((c) => c.phone === activeChat)?.name || activeChat}</div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>был недавно</div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {visibleMessages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    maxWidth: '60%', padding: '0.7rem 1rem', borderRadius: '12px',
                    fontSize: '0.95rem', lineHeight: '1.4', wordBreak: 'break-word',
                    alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start',
                    background: m.from === 'me' ? '#FF6B00' : '#fff',
                    color: m.from === 'me' ? '#fff' : '#000',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  {m.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {sendError && (
              <div style={{
                padding: '0.7rem 1.5rem', background: '#FFE5E5', color: '#E64646',
                fontSize: '0.9rem', borderTop: '1px solid #e0e0e0',
              }}>
                {sendError}
              </div>
            )}

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e0e0e0', background: '#fff', display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Сообщение..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                style={{ flex: 1, padding: '0.7rem 1rem', border: '1px solid #e0e0e0', borderRadius: '20px', fontSize: '0.95rem', outline: 'none' }}
              />
              <button onClick={send} style={{ padding: '0.7rem 1.5rem', border: 'none', borderRadius: '20px', background: '#FF6B00', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                Отправить
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '1.1rem' }}>
            Выберите чат
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatWindow
