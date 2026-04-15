# Pax Mentis — GitHub & Android Studio Kurulum Kılavuzu

## 1. GitHub Reposu
URL: https://github.com/mehmetrts/pax-mentis-app

---

## 2. İlk Push (Replit Shell'den — tek seferlik)

Replit'te sol menüden **Shell** sekmesini aç ve şunu yapıştır:

```bash
cd /home/runner/workspace
git config user.email "pax-mentis@replit.com"
git config user.name "Pax Mentis Replit"
git remote add github-pax "https://mehmetrts:$GITHUB_TOKEN@github.com/mehmetrts/pax-mentis-app.git"
git push github-pax HEAD:main
```

---

## 3. Sonraki Push'lar (değişiklik yaptıktan sonra)

```bash
bash scripts/github-sync.sh
# ya da özel mesajla:
bash scripts/github-sync.sh "feat: bildirim sesi eklendi"
```

---

## 4. Android Studio'da Açmak

### 4a. Clone et:
```bash
git clone https://github.com/mehmetrts/pax-mentis-app.git
cd pax-mentis-app/artifacts/pax-mentis
```

### 4b. Bağımlılıkları kur:
```bash
npm install -g pnpm
pnpm install
```

### 4c. Android klasörünü oluştur (ilk kez):
```bash
npx expo prebuild --platform android
```

### 4d. Android Studio'da aç:
- Android Studio → **Open** → `pax-mentis-app/artifacts/pax-mentis/android` klasörünü seç
- Gradle sync beklenir (~2-3 dakika)

### 4e. Samsung S23 Ultra'da çalıştır:
- Telefonu USB ile bağla, USB Hata Ayıklama'yı aç
- Android Studio'da Run ▶ düğmesine bas

---

## 5. Replit ↔ Android Studio Sync Akışı

```
Replit'te kod yaz
    ↓
bash scripts/github-sync.sh
    ↓
Android Studio → Git → Pull  (ya da: git pull origin main)
    ↓
Gradle sync otomatik
    ↓
Run ▶
```

---

## 6. Bildirim Sesi Dosyası

Özel çan sesi (`pax_chime.wav`) şu konumda:
```
artifacts/pax-mentis/android/app/src/main/res/raw/pax_chime.wav
```
Android kanalı buna otomatik bağlı — ayrıca bir şey yapman gerekmez.

---

## 7. Dev Build (Expo Development Client)

Android Studio'da dev build oluşturmak için:
```bash
cd artifacts/pax-mentis
npx expo run:android
```
Ya da Android Studio'da direkt Run ▶.

Metro URL (Replit'te çalışırken):
```
exp+pax-mentis://expo-development-client/?url=https://960b56c8-27b0-4519-92ab-ac040d0b40d6-00-3j65motj2ud9z.expo.riker.replit.dev
```
