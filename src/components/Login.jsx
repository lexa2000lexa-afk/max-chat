import { useState } from 'react'

function Login({ onLogin }) {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!idInstance || !apiTokenInstance) {
      setError('Заполните оба поля')
      return
    }
    onLogin({ idInstance, apiTokenInstance })
  }

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F5F6F7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '40px', width: '380px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#FF9500', letterSpacing: '2px' }}>MAX</div>
          <div style={{ fontSize: '14px', color: '#99A2AD', marginTop: '8px' }}>Войдите в аккаунт GREEN-API</div>
        </div>

        {error && (
          <div style={{ background: '#FFE5E5', color: '#E64646', padding: '10px 14px', borderRadius: '10px', fontSize: '14px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#6D7885', marginBottom: '6px' }}>idInstance</label>
            <input type="text" placeholder="Введите idInstance" value={idInstance}
              onChange={(e) => setIdInstance(e.target.value)} autoComplete="off"
              style={{ width: '100%', padding: '12px 14px', background: '#F5F6F7', border: '2px solid transparent', borderRadius: '10px', fontSize: '15px', outline: 'none', color: '#000', boxSizing: 'border-box', transition: 'border 0.2s' }}
              onFocus={(e) => e.target.style.border = '2px solid #FF9500'}
              onBlur={(e) => e.target.style.border = '2px solid transparent'} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#6D7885', marginBottom: '6px' }}>apiTokenInstance</label>
            <input type="password" placeholder="Введите apiTokenInstance" value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)} autoComplete="current-password"
              style={{ width: '100%', padding: '12px 14px', background: '#F5F6F7', border: '2px solid transparent', borderRadius: '10px', fontSize: '15px', outline: 'none', color: '#000', boxSizing: 'border-box', transition: 'border 0.2s' }}
              onFocus={(e) => e.target.style.border = '2px solid #FF9500'}
              onBlur={(e) => e.target.style.border = '2px solid transparent'} />
          </div>

          <button type="submit"
            style={{ width: '100%', padding: '13px', background: '#FF9500', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.target.style.background = '#F08700'}
            onMouseLeave={(e) => e.target.style.background = '#FF9500'}>
            Войти
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
