# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Pax Mentis (artifacts/pax-mentis)

Android/iOS Expo uygulaması. Erteleme davranışını psikolojik bilimle ele alan yerel AI destekli mentorluk uygulaması.

**Özellikler:**
- 5 tab: Ana Sayfa (Bento Grid), Mentor (sohbet), Görevler, Wiki, Ayarlar
- Yerel LLM köprüsü (lib/localLLM.ts) — Llama 3.2 3B on-device model + demo fallback
- Wiki bilgi tabanı (lib/wikiKnowledge.ts) — 70 chunk, 31 teori (TMT, PSI, ACT, CBT, Rogers, OARS, SFBT, Gestalt, Sirois/Pychyl, vb.)
- RAG tabanlı bağlamsal içerik enjeksiyonu (retrieveRelevantChunks) — Türkçe morfoloji desteği
- Direnç analizi (lib/resistanceAnalyzer.ts) — 8 sinyal türü, faz bazlı sıcaklık kontrolü

**Tasarım:**
- Material 3 Expressive renk sistemi (constants/colors.ts) — tam M3 token seti
  - Primary: Sage Green #3B6E3B / #8FCF91 (dark)
  - Secondary: Neutral Green #52634F
  - Tertiary: Warm Amber #7B5E00 / #F0BF45 (dark)
  - surface, surfaceContainer, surfaceVariant, onSurface*, outline*, inverse* tokenları
- M3Spring motion preset'leri (spatialDefault/Fast/Slow, effectDefault/Fast)
- Reanimated 4 spring fizik animasyonları: giriş, basma, şekil morflama, loading dots
- Shape token'ları (none→full 6 adım) + M3 pill butonlar (borderRadius: 9999)
- Sokratik mentor sohbeti + streaming + faz etiketleri
- AsyncStorage ile görev + oturum + plan kalıcılığı
- Onboarding modal (5 slayt, ilk başlatmada)

**Takvim & bağlam entegrasyonu:**
- `lib/calendarService.ts` — mahremiyet öncelikli takvim okuma (yalnızca başlık + saat; açıklama/katılımcı/konum okunmaz), yoğunluk skoru, Türkçe özet üretimi
- `context/CalendarContext.tsx` — izin yönetimi, AsyncStorage kalıcılığı, 30 dakikada bir oto-yenileme
- `lib/sharedNotes.ts` — kullanıcı kontrolüyle e-posta/not/görev listesi yapıştırma (max 5 not, 3000 karakter); aktif notlar LLM bağlamına enjekte edilir
- `components/CalendarInsightCard.tsx` — ana ekran Bento grid kartı (etkinlik listesi + yoğunluk çubuğu + mahremiyet notu)
- Tüm takvim/not verileri cihaz üzerinde kalır, sunucuya gönderilmez

**Bildirim sistemi:**
- `lib/notificationService.ts` — 3 Android kanal, 7 bildirim türü, Türkçe mesaj kataloğu (2-3 varyant), sakin saat desteği; `registerOwlCallback` ile maskot entegrasyonu
- `context/NotificationContext.tsx` — bildirim ayarları (AsyncStorage), toast state, izin yönetimi
- `components/SupportiveToast.tsx` — M3 Expressive spring animasyonlu uygulama içi banner (yukarıdan sürgün, ilerleme çubuğu, yukarı kaydır ile kapat)
- `components/OwlNotification.tsx` — animasyonlu maskot bildirimi: 4 kenardan peek (PEEK_AMOUNT=78), queue tabanlı (üst üste binmez), konuşma balonu (maxW=252, 14/13px)
  - Sol: self_compassion / resistance_high | Sağ: gentle_nudge / streak_reminder | Üst: daily_morning | Alt: task_added / session_complete
  - 4 maskot: Baykuş (mezuniyet şapkası), Kedi (yeşil gözler), Köpek (sarı, dil), Tavşan (mor gözler)
  - `MascotPreview` bileşeni: settings'teki seçici için küçük önizleme
- `context/OwlContext.tsx` — queue tabanlı `showOwl(type)` (max 4 bekleyen), maskot tipi AsyncStorage'da (`@pax_mentis:mascot_type`), `setMascot()` API
  - `MASCOT_OPTIONS` dışa aktarılan dizi (settings seçici için)
- `app/(tabs)/settings.tsx` — BİLDİRİM MASKOTu bölümü (4 maskot seçici kartı); BİLDİRİM TESTİ bölümü (4 yön butonu); GÖRÜNÜM + DİL bölümleri
- Tetikleyiciler: görev ekleme → `task_added`, direnç ≥70 → `resistance_high`, günlük sabah → `daily_morning`

**Renk sistemi:** constants/colors.ts — light + dark mode
**Global state:** context/AppContext.tsx — görevler, oturumlar, istatistikler
