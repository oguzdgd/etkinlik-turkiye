/**
 * Gmail OAuth2 refresh_token alma scripti — tek seferlik çalıştır.
 *
 * Kullanım:
 *   node --env-file=.env.local scripts/get-gmail-token.mjs
 *
 * .env.local içinde olması gerekenler:
 *   GMAIL_CLIENT_ID=...
 *   GMAIL_CLIENT_SECRET=...
 */

import http from 'http'

const CLIENT_ID = process.env.GMAIL_CLIENT_ID
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Hata: .env.local dosyasında GMAIL_CLIENT_ID ve GMAIL_CLIENT_SECRET eksik.')
  process.exit(1)
}

const PORT = 3333
const REDIRECT_URI = `http://localhost:${PORT}/callback`
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify']

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES.join(' '))}` +
  `&access_type=offline` +
  `&prompt=consent`

console.log('\nTarayıcı açılıyor...')
console.log('Açılmazsa bu URL\'yi manuel olarak aç:\n')
console.log(authUrl + '\n')

const { exec } = await import('child_process')
exec(`start "" "${authUrl}"`)

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const code = url.searchParams.get('code')

  if (!code) {
    res.end('Kod bulunamadı.')
    return
  }

  res.end('<html><body><h2>✓ Başarılı! Terminal\'e dön.</h2></body></html>')
  server.close()

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })

  const data = await tokenRes.json()

  if (data.refresh_token) {
    console.log('✓ Başarılı! Supabase secrets\'a şunları ekle:\n')
    console.log(`GMAIL_CLIENT_ID     = ${CLIENT_ID}`)
    console.log(`GMAIL_CLIENT_SECRET = ${CLIENT_SECRET}`)
    console.log(`GMAIL_REFRESH_TOKEN = ${data.refresh_token}`)
  } else {
    console.error('Hata:', JSON.stringify(data, null, 2))
  }
})

server.listen(PORT, () => {
  console.log(`Callback dinleniyor: http://localhost:${PORT}/callback`)
})
