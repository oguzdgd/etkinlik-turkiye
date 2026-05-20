/**
 * Gmail OAuth2 refresh_token alma scripti — tek seferlik çalıştır.
 *
 * Kullanım:
 *   node scripts/get-gmail-token.mjs
 *
 * Gereksinimler:
 *   - Google Cloud Console'da proje oluştur
 *   - Gmail API'yi aktif et
 *   - OAuth 2.0 credentials oluştur (Desktop app türünde)
 *   - client_id ve client_secret'ı aşağıya yaz
 */

const CLIENT_ID = 'BURAYA_CLIENT_ID_YAZ'
const CLIENT_SECRET = 'BURAYA_CLIENT_SECRET_YAZ'
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'

const SCOPES = ['https://www.googleapis.com/auth/gmail.modify']

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES.join(' '))}` +
  `&access_type=offline` +
  `&prompt=consent`

console.log('\n1. Bu URL\'yi tarayıcıda aç:\n')
console.log(authUrl)
console.log('\n2. Google hesabınla giriş yap ve izin ver.')
console.log('3. Ekranda çıkan kodu aşağıya yapıştır:\n')

const { createInterface } = await import('readline')
const rl = createInterface({ input: process.stdin, output: process.stdout })

rl.question('Kod: ', async (code) => {
  rl.close()

  const res = await fetch('https://oauth2.googleapis.com/token', {
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

  const data = await res.json()

  if (data.refresh_token) {
    console.log('\n✓ Başarılı! Supabase secrets\'a şunları ekle:\n')
    console.log(`GMAIL_CLIENT_ID     = ${CLIENT_ID}`)
    console.log(`GMAIL_CLIENT_SECRET = ${CLIENT_SECRET}`)
    console.log(`GMAIL_REFRESH_TOKEN = ${data.refresh_token}`)
  } else {
    console.error('\nHata:', data)
  }
})
