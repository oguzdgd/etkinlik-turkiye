import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GMAIL_CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID')!
const GMAIL_CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET')!
const GMAIL_REFRESH_TOKEN = Deno.env.get('GMAIL_REFRESH_TOKEN')!
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!
const SYSTEM_USER_ID = Deno.env.get('SYSTEM_USER_ID')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      refresh_token: GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`Gmail token alınamadı: ${JSON.stringify(data)}`)
  return data.access_token
}

async function fetchAllMessages(token: string): Promise<string[]> {
  const ids: string[] = []
  let pageToken: string | undefined

  do {
    const params = new URLSearchParams({
      q: 'newer_than:7d',
      maxResults: '15',
    })
    if (pageToken) params.set('pageToken', pageToken)

    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const data = await res.json()
    ids.push(...(data.messages || []).map((m: { id: string }) => m.id))
    pageToken = undefined
  } while (pageToken)

  return ids
}

async function fetchMessage(token: string, id: string) {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return res.json()
}

const decodeBase64 = (data: string) => {
  const binary = atob(data.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder('utf-8').decode(bytes)
}

const findPart = (parts: any[], mime: string): string => {
  for (const part of parts) {
    if (part.mimeType === mime && part.body?.data) return decodeBase64(part.body.data)
    if (part.parts) { const r = findPart(part.parts, mime); if (r) return r }
  }
  return ''
}

function extractBody(message: any): string {
  const stripHtml = (html: string) =>
    html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const parts = message.payload?.parts

  if (parts) {
    const plain = findPart(parts, 'text/plain')
    if (plain) return plain
    const html = findPart(parts, 'text/html')
    if (html) return stripHtml(html)
  }

  if (message.payload?.body?.data) {
    const raw = decodeBase64(message.payload.body.data)
    return message.payload.mimeType === 'text/html' ? stripHtml(raw) : raw
  }

  return ''
}

function extractRawHtml(message: any): string {
  const parts = message.payload?.parts
  if (parts) return findPart(parts, 'text/html')
  if (message.payload?.body?.data && message.payload.mimeType === 'text/html') {
    return decodeBase64(message.payload.body.data)
  }
  return ''
}

function extractLinksFromHtml(html: string): string {
  const pairs: string[] = []
  const linkRegex = /<a\b[^>]+href=["']([^"'#][^"']*?)["'][^>]*>([\s\S]*?)<\/a>/gi
  let match
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1].trim()
    const text = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    if (
      url.startsWith('http') &&
      text.length > 2 &&
      !/unsubscribe|optout|abonelik.iptal|list-unsubscribe/i.test(url) &&
      !/aboneliği iptal|unsubscribe/i.test(text)
    ) {
      pairs.push(`"${text}" → ${url}`)
    }
  }
  const seen = new Set<string>()
  return pairs
    .filter(p => {
      const url = p.split(' → ')[1]
      if (seen.has(url)) return false
      seen.add(url)
      return true
    })
    .slice(0, 10)
    .join('\n')
}

function extractFirstImageUrl(html: string): string | null {
  const imgRegex = /<img\b[^>]*>/gi
  let match
  while ((match = imgRegex.exec(html)) !== null) {
    const tag = match[0]
    const srcMatch = /\bsrc=["']([^"']+)["']/i.exec(tag)
    if (!srcMatch) continue
    const url = srcMatch[1]
    if (!url.startsWith('http')) continue
    if (/track|pixel|beacon|open\.(gif|png)|spacer|1x1/i.test(url)) continue
    const w = /\bwidth=["']?(\d+)["']?/i.exec(tag)
    const h = /\bheight=["']?(\d+)["']?/i.exec(tag)
    if (w && parseInt(w[1]) < 80) continue
    if (h && parseInt(h[1]) < 80) continue
    return url
  }
  return null
}

function getHeader(message: any, name: string): string {
  return message.payload?.headers?.find(
    (h: { name: string }) => h.name.toLowerCase() === name.toLowerCase()
  )?.value ?? ''
}

interface ParsedEvent {
  title: string
  description: string
  category: string
  type: 'online' | 'in_person'
  city: string | null
  location_text: string | null
  online_url: string | null
  website_url: string | null
  starts_at: string | null
  ends_at: string | null
  application_deadline: string | null
}

async function parseWithGroq(subject: string, body: string, links: string): Promise<ParsedEvent[] | null> {
  const prompt = `Sen bir Türkiye etkinlik asistanısın. Aşağıdaki e-posta içeriğinden Türkiye'de gerçekleşecek etkinlikleri çıkar.

Kapsam: Teknoloji, yazılım, yapay zeka, girişimcilik, inovasyon, tasarım, veri, siber güvenlik, hackathon, bootcamp, workshop, konferans, meetup, webinar ve bunların yanı sıra staj/kariyer programları, networking buluşmaları, sektör etkinlikleri (enerji, finans, sigortacılık vb. dahil).
Kural: Sadece gerçek etkinlikleri çıkar. Salt ürün/hizmet reklamı olan içerikleri atla. Tarihi olmayan içerikleri atla.
Kural: starts_at etkinliğin başlangıç tarihi; bulamazsan null bırak. application_deadline son başvuru/kayıt tarihi; varsa ISO 8601 doldur. İkisi de yoksa o etkinliği atla.
Kural: Tarih aralığı varsa (örn: 27-28 Haziran) starts_at başlangıç tarihini, ends_at bitiş tarihini taşır.
Kural: application_deadline varsa ISO 8601 formatında doldur (örn: "Son başvuru: 20 Haziran" → "2026-06-20T23:59:00+03:00"), yoksa null.
Kural: website_url için aşağıdaki "Maildeki linkler" listesini kullan. "Başvur", "Detaylar", "Kayıt", "Tıklayınız", "Katıl" gibi anlamlı linkleri seç. Unsubscribe/track linklerini alma. Link yoksa null.
Kural: category şunlardan biri: "Hackathon", "Konferans", "Meetup", "Workshop", "Bootcamp", "Staj", "Yarışma", "AI", "Kariyer", "Networking", "Diğer"
Kural: type "online" veya "in_person" olmalı.
Kural: description alanına etkinliğin kapsamlı Türkçe açıklamasını yaz — ne hakkında, ödüller, kimler katılabilir, format, öne çıkan detaylar. En az 2-3 cümle.

E-posta konusu: ${subject}

Maildeki linkler:
${links || '(yok)'}

E-posta içeriği:
${body.slice(0, 4000)}

Yanıtı SADECE JSON array olarak döndür:
[{"title":"...","description":"...","category":"...","type":"...","city":null,"location_text":null,"online_url":null,"website_url":null,"starts_at":"...","ends_at":null,"application_deadline":null}]

Etkinlik yoksa: []`

  let data: any
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    })
    data = await res.json()
  } catch (err) {
    console.log(`[GROQ] Fetch/parse hatası: ${err}`)
    return null
  }

  if (!data || data.error) {
    const msg = data?.error?.message ?? 'boş yanıt'
    const isRateLimit = !data || /rate.limit|TPM|TPD/i.test(msg)
    console.log(`[GROQ ERROR] ${msg}`)
    if (isRateLimit) return 'rate_limit' as any
    return null
  }

  const text = data.choices?.[0]?.message?.content
  if (!text) {
    console.log(`[GROQ] Yanıt boş`)
    return null
  }

  try {
    const parsed = JSON.parse(text)
    const events = Array.isArray(parsed) ? parsed : (parsed.events ?? [])
    console.log(`[GROQ] ${events.length} etkinlik bulundu — konu: "${subject}"`)
    return events
  } catch {
    console.log(`[GROQ] JSON parse hatası: ${text.slice(0, 100)}`)
    return null
  }
}

Deno.serve(async () => {
  try {
    const token = await getAccessToken()
    const messageIds = await fetchAllMessages(token)
    console.log(`[START] ${messageIds.length} mail işlenecek`)

    let inserted = 0
    let skipped = 0

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

    for (const id of messageIds) {
      try {
        const message = await fetchMessage(token, id)
        if (!message?.payload) { skipped++; continue }

        const subject = getHeader(message, 'subject')
        const body = extractBody(message)
        if (!body) { skipped++; continue }

        const EVENT_KEYWORDS = [
          'hackathon', 'meetup', 'workshop', 'konferans', 'webinar',
          'bootcamp', 'etkinlik', 'event', 'yarışma', 'seminer',
          'summit', 'forum', 'eğitim', 'training', 'conference',
          'staj', 'kariyer', 'networking',
        ]
        const subjectLower = subject.toLowerCase()
        const bodyPreview = body.slice(0, 500).toLowerCase()
        const isRelevant = EVENT_KEYWORDS.some(
          kw => subjectLower.includes(kw) || bodyPreview.includes(kw)
        )
        if (!isRelevant) { skipped++; continue }

        const html = extractRawHtml(message)
        const links = extractLinksFromHtml(html)
        const imageUrl = extractFirstImageUrl(html)

        let events = await parseWithGroq(subject, body, links)
        if ((events as any) === 'rate_limit') {
          console.log('[RATE LIMIT] 12s bekleniyor, tekrar deneniyor...')
          await sleep(12000)
          events = await parseWithGroq(subject, body, links)
        }
        await sleep(5000)
        if (!events || (events as any) === 'rate_limit' || events.length === 0) { skipped++; continue }

        for (const event of events) {
          const effectiveStartsAt = event.starts_at ?? event.application_deadline
          if (!effectiveStartsAt) { skipped++; continue }
          const timeTbd = !event.starts_at

          const result = await supabase.from('events').insert({
            title: event.title,
            description: event.description,
            category: event.category,
            type: event.type,
            city: event.city,
            location_text: event.location_text,
            online_url: event.online_url,
            website_url: event.website_url,
            starts_at: effectiveStartsAt,
            ends_at: event.ends_at ?? null,
            time_tbd: timeTbd,
            application_deadline: event.application_deadline ?? null,
            image_url: imageUrl,
            status: 'pending',
            source: 'email_import',
            email_message_id: id,
            created_by: SYSTEM_USER_ID,
          })

          if (result.error?.code === '23505') {
            skipped++
          } else if (result.error) {
            console.error('Insert hatası:', result.error)
          } else {
            inserted++
          }
        }
      } catch (err) {
        console.error(`Mesaj işlenemedi (${id}):`, err)
        skipped++
      }
    }

    return new Response(
      JSON.stringify({ ok: true, inserted, skipped }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    // Log the detail server-side, but don't leak internals to the caller.
    console.error(err)
    return new Response(JSON.stringify({ ok: false, error: 'internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
