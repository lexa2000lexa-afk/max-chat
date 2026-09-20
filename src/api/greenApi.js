const baseUrl = (id) => `/api/waInstance${id}`

export const sendMessage = async (idInstance, apiTokenInstance, phone, text) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  if (cleanPhone.length < 10) throw new Error('Номер слишком короткий')
  const chatId = `${cleanPhone}@c.us`

  const url = `${baseUrl(idInstance)}/sendMessage/${apiTokenInstance}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message: text }),
  })

  if (!res.ok) {
    if (res.status === 466) {
      throw new Error('Лимит тарифа исчерпан. Перейдите на бизнес-тариф в кабинете GREEN-API.')
    }
    throw new Error(`Ошибка отправки: ${res.status}`)
  }

  return await res.json()
}

export const receiveNotification = async (idInstance, apiTokenInstance, timeout = 15) => {
  const url = `${baseUrl(idInstance)}/receiveNotification/${apiTokenInstance}?receiveTimeout=${timeout}`

  try {
    const res = await fetch(url)
    if (!res.ok) return []

    const text = await res.text()
    if (!text || text.trim() === '' || text.trim() === 'null') return []

    const data = JSON.parse(text)
    if (data && data.receiptId) return data
    return []
  } catch {
    return []
  }
}

export const deleteNotification = async (idInstance, apiTokenInstance, receiptId) => {
  const url = `${baseUrl(idInstance)}/deleteNotification/${apiTokenInstance}/${receiptId}`
  try {
    const res = await fetch(url, { method: 'DELETE' })
    return res.ok
  } catch {
    return false
  }
}
