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
    pageToken = undefined // tek sayfa, timeout önlemi
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

function extractBody(message: any): string {
  const decode = (data: string) =>
    atob(data.replace(/-/g, '+').replace(/_/g, '/'))

  const stripHtml = (html: string) =>
    html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

  const findPart = (parts: any[], mime: string): string => {
    for (const part of parts) {
      if (part.mimeType === mime && part.body?.data) return decode(part.body.data)
      if (part.parts) { const r = findPart(part.parts, mime); if (r) return r }
    }
    return ''
  }

  const parts = message.payload?.parts

  if (parts) {
    const plain = findPart(parts, 'text/plain')
    if (plain) return plain
    const html = findPart(parts, 'text/html')
    if (html) return stripHtml(html)
  }

  if (message.payload?.body?.data) {
    const raw = decode(message.payload.body.data)
    return message.payload.mimeType === 'text/html' ? stripHtml(raw) : raw
  }

  return ''
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
  starts_at: string
}

async function parseWithGroq(subject: string, body: string): Promise<ParsedEvent[] | null> {
  const prompt = `Sen bir Türkiye etkinlik asistanısın. Aşağıdaki e-posta içeriğinden Türkiye'de gerçekleşecek etkinlikleri çıkar.

Kapsam: Yazılım, teknoloji, yapay zeka, girişimcilik, yatırım, inovasyon, tasarım, veri, siber güvenlik, hackathon, bootcamp, workshop, konferans, meetup, webinar, eğitim programları.
Kural: Sadece gerçek etkinlikleri çıkar. Etkinlik tarihi olmayan içerikleri atla.
Kural: starts_at ISO 8601 formatında olmalı (örn: "2026-06-15T18:00:00+03:00"). Tarihi bulamazsan o etkinliği atla.
Kural: category şunlardan biri: "Yazılım", "Yapay Zeka", "Veri Bilimi", "Siber Güvenlik", "Girişimcilik", "Tasarım", "Diğer"
Kural: type "online" veya "in_person" olmalı.

E-posta konusu: ${subject}

E-posta içeriği:
${body.slice(0, 4000)}

Yanıtı SADECE JSON array olarak döndür:
[{"title":"...","description":"...","category":"...","type":"...","city":null,"location_text":null,"online_url":null,"starts_at":"..."}]

Etkinlik yoksa: []`

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

  const data = await res.json()

  if (data.error) {
    console.log(`[GROQ ERROR] ${data.error.message}`)
    return null
  }

  const text = data.choices?.[0]?.message?.content
  if (!text) {
    console.log(`[GROQ] Yanıt boş`)
    return null
  }

  try {
    const parsed = JSON.parse(text)
    // Model bazen array yerine {events: [...]} döndürüyor
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

    for (const id of messageIds) {
      try {
        const message = await fetchMessage(token, id)
        if (!message?.payload) { skipped++; continue }

        const subject = getHeader(message, 'subject')
        const body = extractBody(message)
        if (!body) { skipped++; continue }

        const events = await parseWithGroq(subject, body)
        if (!events || events.length === 0) { skipped++; continue }

        for (const event of events) {
          const result = await supabase.from('events').insert({
            title: event.title,
            description: event.description,
            category: event.category,
            type: event.type,
            city: event.city,
            location_text: event.location_text,
            online_url: event.online_url,
            starts_at: event.starts_at,
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
    console.error(err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
