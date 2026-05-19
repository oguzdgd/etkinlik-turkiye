# Etkinlik Türkiye

**Etkinlik Türkiye**, Türkiye'deki teknoloji ve yazılım geliştirici topluluğuna yönelik etkinlikleri tek çatı altında toplayan, topluluk odaklı bir web platformudur.

## 🎯 Amaç

Türkiye'de her gün onlarca hackathon, AI meetup, yazılım workshop'u ve kariyer etkinliği düzenlenmektedir — ancak bunların büyük çoğunluğu farklı platformlara, e-posta listelerine ve sosyal medya hesaplarına dağılmış durumdadır. Etkinlik Türkiye bu dağınıklığı çözmek için tasarlanmıştır.

Platform şu soruyu yanıtlar: **"Bu hafta Türkiye'de geliştiriciler için ne var?"**

### Kimler için?

- **Yazılım geliştiriciler** — Hackathon'lara katılmak, yeni teknolojiler öğrenmek ve toplulukla buluşmak isteyenler
- **AI / Veri bilimi meraklıları** — LLM, üretken yapay zeka ve araştırma etkinliklerini takip etmek isteyenler
- **Kariyer odaklı bireyler** — CV klinikleri, mentörlük programları ve iş fırsatı etkinliklerini arayanlar
- **Topluluk organizatörleri** — Etkinliklerini Türkiye'deki geliştirici kitlesine duyurmak isteyenler

### Etkinlik Kategorileri

| Kategori | Ne içerir? |
|---|---|
| **Hackathon** | 48 saatte sıfırdan ürün kurmak |
| **AI** | Üretken modeller, LLM mühendisliği, araştırma |
| **Yazılım** | React, Next.js, Rust, backend mimarileri |
| **Workshop** | Pratik, küçük gruplu, uygulamalı oturumlar |
| **Kariyer** | CV klinikleri, mentörlük, iş fırsatları |
| **Networking** | Geliştirici buluşmaları, topluluk geceleri |
| **Diğer** | Kategoriye girmeyen her şey |

Etkinlikler **online** veya **yüz yüze** olabilir; harita görünümünde fiziksel etkinliklerin konumları işaretlenir.

---

## 🌟 Özellikler

### Kullanıcılar için
- **Etkinlik Keşfi** — Kategoriye, şehre, tarihe ve türe göre gelişmiş filtreleme
- **Harita Görünümü** — Leaflet tabanlı interaktif haritada etkinlikleri görüntüleme
- **Katılım & Favoriler** — Etkinliklere katılım bildirme ve favorilere ekleme
- **Kişisel Dashboard** — Oluşturulan ve katılınan etkinliklerin yönetimi

### Etkinlik Sahipleri için
- **Etkinlik Oluşturma** — Online veya yüz yüze etkinlik yayınlama, görsel yükleme
- **Moderasyon Süreci** — Etkinlikler admin onayından geçtikten sonra yayınlanır

### Adminler için
- **Admin Paneli** — Bekleyen etkinlikleri onaylama / reddetme
- **E-posta İmport** — Gmail entegrasyonu ile dışarıdan gelen etkinlikleri otomatik içe aktarma

---

## 🛠 Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Frontend | React 18 + Vite 5 |
| Routing | React Router v6 (lazy loading) |
| Server State | TanStack Query v5 |
| UI State | Zustand v5 |
| Styling | Tailwind CSS v4 |
| Backend / BaaS | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Harita | Leaflet + React-Leaflet |
| Edge Functions | Supabase Edge Functions (Deno) |

---

## 🏗 Proje Mimarisi

```
src/
├── app/              # Router ve uygulama entry point
├── features/         # Domain-bazlı modüller
│   ├── auth/         # Kimlik doğrulama (context, hooks, services)
│   ├── events/       # Etkinlik CRUD, listeleme, detay
│   └── favorites/    # Favori yönetimi
├── pages/            # Route bileşenleri
│   ├── admin/        # Admin dashboard
│   ├── events/       # Etkinlik sayfaları (liste, detay, oluşturma, harita)
│   ├── public/       # Herkese açık sayfalar
│   └── user/         # Kullanıcı dashboard & profil
├── components/       # Paylaşılan UI bileşenleri
├── hooks/            # Genel amaçlı React hook'ları
├── store/            # Zustand store'ları
└── lib/              # Saf yardımcı fonksiyonlar
```

### Mimari Kararlar

- **Feature-first yapı**: Her domain kendi `components/`, `hooks/`, `services/` ve `queryKeys.js` dosyalarına sahiptir.
- **Servis katmanı**: `@supabase/supabase-js` yalnızca `services/` altında import edilir; diğer her yer servis fonksiyonlarını çağırır.
- **Barrel exports**: Sayfalar `@features/<name>` barrel'larından import eder; internal path'lere erişim yoktur.
- **snake_case → camelCase**: Supabase'den gelen tüm veri `toEvent` / `mapEvent` dönüşüm fonksiyonlarıyla normalize edilir.

---

## 🗄 Veritabanı

```
profiles        — auth.users uzantısı; rol yönetimi
events          — Etkinlik kayıtları (pending / approved / rejected)
event_attendees — Katılım kayıtları
favorites       — Kullanıcı favorileri
```

**RLS Politikası:**
- `approved` etkinlikler → herkese açık (anonim dahil)
- `pending` / `rejected` → yalnızca etkinlik sahibi ve admin
- `favorites` → yalnızca kendi sahibi

---

## 🚀 Kurulum

### Gereksinimler

- Node.js ≥ 20.11
- Supabase hesabı

### Adımlar

```bash
# 1. Repoyu klonla
git clone https://github.com/<kullanici>/etkinlik-turkiye.git
cd etkinlik-turkiye

# 2. Bağımlılıkları yükle
npm install

# 3. Ortam değişkenlerini tanımla
cp .env.example .env.local
# .env.local dosyasını düzenle

# 4. Supabase şemasını uygula
# Dashboard → SQL Editor → supabase/schema.sql içeriğini yapıştır ve çalıştır

# 5. Geliştirme sunucusunu başlat
npm run dev
```

### Ortam Değişkenleri

```env
VITE_SUPABASE_URL=https://<proje-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

---

## 📜 Komutlar

```bash
npm run dev      # Vite geliştirme sunucusu — localhost:5173
npm run build    # Üretim paketi oluştur
npm run preview  # Üretim paketini yerel olarak önizle
```

---

## ⚙️ Supabase Edge Functions

```
supabase/functions/
└── email-import/   # Gmail'den etkinlik içe aktarma
```

Edge Functions yerel olarak çalıştırmak için Supabase CLI gerekir. Dağıtım için:

```bash
supabase functions deploy email-import
```

---

## 🔐 Admin Rolü

Bir kullanıcıya admin yetkisi vermek için Supabase SQL Editor'da:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## 📁 Katkı

1. Fork yap
2. Feature branch oluştur (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerini commit et (`git commit -m 'feat: yeni özellik eklendi'`)
4. Branch'i push et (`git push origin feature/yeni-ozellik`)
5. Pull Request aç

---

## 📄 Lisans

MIT
