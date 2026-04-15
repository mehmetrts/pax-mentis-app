# Pax Mentis — GitHub & Android Studio Kurulum Kılavuzu

## 1. GitHub Reposu
**URL:** https://github.com/mehmetrts/pax-mentis-app

> İlk push tamamlandı — repo canlı ve güncel.

---

## 2. Sonraki Push'lar (değişiklik yaptıktan sonra)

Replit'te **Shell** sekmesini aç ve şunu çalıştır:

```bash
bash scripts/github-sync.sh
```

Özel commit mesajıyla:
```bash
bash scripts/github-sync.sh "feat: yeni özellik açıklaması"
```

---

## 3. Android Studio'da Açmak

### 3a. Bilgisayarına clone et:
```bash
git clone https://github.com/mehmetrts/pax-mentis-app.git
cd pax-mentis-app/artifacts/pax-mentis
```

### 3b. Bağımlılıkları kur:
```bash
npm install -g pnpm
pnpm install
```

### 3c. Android klasörünü oluştur (ilk kez — prebuild):
```bash
npx expo prebuild --platform android
```

### 3d. Android Studio'da aç:
- Android Studio → **Open** → `pax-mentis-app/artifacts/pax-mentis/android` klasörünü seç
- Gradle sync beklenir (~2-3 dakika)

### 3e. Samsung S23 Ultra'da çalıştır:
- Telefonu USB ile bağla, USB Hata Ayıklama'yı aç
- Android Studio'da **Run ▶** düğmesine bas

---

## 4. Replit → GitHub → Android Studio Akışı

```
Replit'te kod değişikliği
        ↓
bash scripts/github-sync.sh
        ↓
Android Studio → Git → Pull
        ↓
Gradle sync (otomatik)
        ↓
Run ▶
```

---

## 5. Bildirim Sesi Dosyası

Özel çan sesi şu konumda — Android kanalı otomatik bağlı:
```
artifacts/pax-mentis/android/app/src/main/res/raw/pax_chime.wav
```

---

## 6. Sorun Giderme

**"GITHUB_TOKEN ortam değişkeni tanımlı değil" hatası:**
Replit Shell'de şunu çalıştır:
```bash
echo $GITHUB_TOKEN
```
Boş çıkıyorsa Replit Secrets sekmesinde `GITHUB_TOKEN` değerini kontrol et.

**"remote already exists" hatası:**
`github-pax` remote zaten ekli — `scripts/github-sync.sh` bunu otomatik yönetir.

---

## 7. Dev Build (Expo Development Client)

```bash
cd artifacts/pax-mentis
npx expo run:android
```

Replit Metro URL:
```
exp+pax-mentis://expo-development-client/?url=https://960b56c8-27b0-4519-92ab-ac040d0b40d6-00-3j65motj2ud9z.expo.riker.replit.dev
```
