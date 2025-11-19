# 🚂 Railway Deployment - Detaylı Adım Adım Kılavuz

## 📌 Senaryo
- **Backend Repo:** Spring Boot projesi (ayrı GitHub repo)
- **Frontend Repo:** Angular projesi (ayrı GitHub repo)
- **Database:** PostgreSQL (Railway'de oluşturulacak)

Hepsi **tek Railway projesinde** farklı servisler olarak çalışacak.

---

## 🚀 Adım 1: Railway Projesi Oluşturma

### 1.1 New Project
```bash
1. Railway Dashboard → "New Project"
2. "Empty Project" seçin (şimdilik boş başlayalım)
3. Proje adı: "kutuphane-rezervasyon"
```

---

## 🗄️ Adım 2: PostgreSQL Database Ekleme

### 2.1 Database Service Oluştur
```bash
1. Proje içinde → "+ New" butonu
2. "Database" sekmesi → "Add PostgreSQL"
3. Otomatik oluşturulur ve başlatılır
```

### 2.2 Database Bilgilerini Kaydet
```bash
PostgreSQL service → "Variables" sekmesi
Otomatik oluşturulan değişkenler:
- DATABASE_URL
- PGHOST
- PGPORT
- PGDATABASE
- PGUSER  
- PGPASSWORD

Bu bilgileri backend'de kullanacağız!
```

---

## 🔧 Adım 3: Backend (Spring Boot) Deploy

### 3.1 Backend Service Oluştur
```bash
1. Proje içinde → "+ New" butonu
2. "GitHub Repo" seçin
3. GitHub hesabınızı bağlayın (ilk seferinde)
4. Spring Boot repo'nuzu seçin (örn: Metehan-Yenil/kutuphane)
5. "Deploy" butonuna tıklayın
```

### 3.2 Service Ayarları
```bash
Service adını değiştir:
1. Service → "Settings" sekmesi
2. "Name" → "backend" olarak değiştir
3. "Save Config"
```

### 3.3 Environment Variables Ekle
```bash
Service → "Variables" sekmesi → "Raw Editor"

Şu değişkenleri ekleyin:
```

```bash
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

# Database (PostgreSQL servisinden reference)
SPRING_DATASOURCE_URL=${{Postgres.DATABASE_URL}}
SPRING_DATASOURCE_USERNAME=${{Postgres.PGUSER}}
SPRING_DATASOURCE_PASSWORD=${{Postgres.PGPASSWORD}}
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver

# JPA
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false
SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT=org.hibernate.dialect.PostgreSQLDialect

# CORS (frontend URL'i sonra ekleyeceğiz)
CORS_ALLOWED_ORIGINS=http://localhost:4201

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRATION=86400000

# Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_KUTUPHANEREZERVASYON=DEBUG
```

### 3.4 Backend Build Kontrol
```bash
1. "Deployments" sekmesi → Son deployment'ı açın
2. "Build Logs" sekmesi → Build başarılı mı kontrol edin
3. "Deploy Logs" sekmesi → Uygulama başladı mı kontrol edin

Başarılı log örneği:
✅ "Started KutuphaneApplication in X seconds"
✅ "Tomcat started on port 8080"
```

### 3.5 Backend Public URL Oluştur
```bash
1. Backend service → "Settings" sekmesi
2. "Networking" bölümü → "Generate Domain"
3. URL örneği: https://kutuphane-backend-production-abc123.up.railway.app
4. Bu URL'i kopyalayın (frontend'de kullanacağız)
```

### 3.6 Backend Test
```bash
# Browser'da test edin:
https://your-backend-url.up.railway.app/actuator/health

Beklenen yanıt:
{"status":"UP"}
```

---

## 🎨 Adım 4: Frontend (Angular) Deploy

### 4.1 Frontend Service Oluştur
```bash
1. Proje içinde → "+ New" butonu
2. "GitHub Repo" seçin
3. Angular repo'nuzu seçin (örn: Metehan-Yenil/kutuphane-frontend)
4. Root directory: "." (boş bırakın veya . yazın)
5. "Deploy" butonuna tıklayın
```

### 4.2 Service Ayarları
```bash
Service adını değiştir:
1. Service → "Settings" sekmesi
2. "Name" → "frontend" olarak değiştir
3. "Save Config"
```

### 4.3 Environment Variables Ekle
```bash
Service → "Variables" sekmesi → "Raw Editor"

Şu değişkenleri ekleyin:
```

```bash
NODE_ENV=production
PORT=80

# Backend API URL (yukarıda kopyaladığınız backend URL)
API_URL=https://kutuphane-backend-production-abc123.up.railway.app
NEXT_PUBLIC_API_URL=https://kutuphane-backend-production-abc123.up.railway.app
```

### 4.4 Frontend Build Kontrol
```bash
1. "Deployments" sekmesi → Son deployment'ı açın
2. "Build Logs" → Angular build başarılı mı?
3. "Deploy Logs" → Nginx başladı mı?

Başarılı log örneği:
✅ "npm run build - completed"
✅ "nginx: [notice] start worker processes"
```

### 4.5 Frontend Public URL Oluştur
```bash
1. Frontend service → "Settings" sekmesi
2. "Networking" → "Generate Domain"
3. URL örneği: https://kutuphane-frontend-production-xyz789.up.railway.app
4. Bu URL'i kopyalayın
```

### 4.6 Backend CORS Güncelle
```bash
Şimdi frontend URL'ini backend'e ekleyelim:

1. Backend service → "Variables" sekmesi
2. CORS_ALLOWED_ORIGINS değişkenini bulun
3. Değeri güncelleyin:
```

```bash
CORS_ALLOWED_ORIGINS=https://kutuphane-frontend-production-xyz789.up.railway.app,https://your-custom-domain.com
```

```bash
4. "Save Variables"
5. Backend otomatik restart olacak
```

---

## ✅ Adım 5: Test ve Doğrulama

### 5.1 Frontend Test
```bash
1. Browser'da frontend URL'i açın:
   https://kutuphane-frontend-production-xyz789.up.railway.app

2. Login sayfası görünüyor mu?
3. Network tab'da API çağrıları başarılı mı?
```

### 5.2 Backend Test
```bash
# Terminal'de test:
curl -X POST https://your-backend-url.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://your-frontend-url.up.railway.app" \
  -d '{"email":"root@kutuphane.com","password":"root123"}'

Beklenen yanıt:
{
  "userId": 1,
  "name": "Root Admin",
  "email": "root@kutuphane.com",
  "role": "ADMIN",
  "token": "..."
}
```

### 5.3 Database Test
```bash
# Railway Dashboard'dan:
1. PostgreSQL service → "Data" sekmesi
2. Tables görünüyor mu?
3. Sample data var mı? (users, rooms, etc.)
```

---

## 🔧 Railway CLI ile Deployment (Alternatif)

Terminal'den deployment yapmak isterseniz:

```bash
# 1. Railway CLI kur
npm install -g @railway/cli

# 2. Login
railway login

# 3. Backend Deploy
cd D:\kutuphane
railway link  # Mevcut projeyi seç → backend service'i seç
railway up

# 4. Frontend Deploy
cd D:\kutuphane-frontend\kutuphane-rezervasyon-frontend
railway link  # Aynı projeyi seç → frontend service'i seç
railway up
```

---

## 📊 Railway Dashboard Yapısı

```
📦 kutuphane-rezervasyon (Project)
├── 🗄️ Postgres (Database)
│   ├── Variables: DATABASE_URL, PGUSER, PGPASSWORD
│   └── Data: Tables görüntüleme
│
├── ⚙️ backend (Service - Spring Boot)
│   ├── Settings: Name, Networking, Build
│   ├── Variables: Spring Boot config
│   ├── Deployments: Build/Deploy logs
│   └── Metrics: CPU, Memory, Network
│
└── 🎨 frontend (Service - Angular)
    ├── Settings: Name, Networking, Build
    ├── Variables: Node/Nginx config
    ├── Deployments: Build/Deploy logs
    └── Metrics: CPU, Memory, Network
```

---

## 🎯 GitHub Actions Entegrasyonu

### Backend Workflow Güncelleme

Backend repo'nuzda `.github/workflows/deploy.yml`:

```yaml
name: Deploy Backend to Railway

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Railway
        run: npm i -g @railway/cli
      
      - name: Deploy to Railway
        run: railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### Frontend Workflow Güncelleme

Frontend repo'nuzda `.github/workflows/deploy.yml`:

```yaml
name: Deploy Frontend to Railway

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Railway
        run: npm i -g @railway/cli
      
      - name: Deploy to Railway
        run: railway up --service frontend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### Railway Token Alma ve Ekleme

```bash
# 1. Railway token al
Railway Dashboard → Account → Tokens → Create Token

# 2. GitHub secrets ekle (HER İKİ REPO için)

Backend repo:
GitHub → Settings → Secrets → Actions → New secret
Name: RAILWAY_TOKEN
Value: (railway token)

Frontend repo:
GitHub → Settings → Secrets → Actions → New secret
Name: RAILWAY_TOKEN
Value: (aynı railway token)
```

---

## 🐛 Sorun Giderme

### Backend Database Bağlanamıyor
```bash
Problem: Backend database'e bağlanamıyor

Çözüm:
1. Backend service → Variables
2. SPRING_DATASOURCE_URL'i kontrol et
3. Şu formatta olmalı:
   ${{Postgres.DATABASE_URL}}
   
4. Ya da manuel olarak:
   jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}
```

### Frontend Backend'e Erişemiyor
```bash
Problem: CORS hatası alıyorum

Çözüm:
1. Backend service → Variables → CORS_ALLOWED_ORIGINS
2. Frontend URL'ini ekle:
   https://your-frontend.up.railway.app
3. Backend restart olacak otomatik
```

### Build Başarısız
```bash
Problem: Railway build başarısız oluyor

Backend için:
1. Dockerfile doğru mu kontrol et
2. pom.xml dependency'leri tam mı?
3. Java version 21 mi?

Frontend için:
1. Dockerfile doğru mu?
2. package.json dependencies tam mı?
3. npm ci --legacy-peer-deps kullanılıyor mu?
```

### Environment Variables Çalışmıyor
```bash
Problem: ENV variables uygulamada görünmüyor

Çözüm:
1. Variables → Raw Editor
2. Syntax doğru mu kontrol et
3. Service'i restart et:
   Settings → Restart
```

---

## 💰 Maliyet Optimizasyonu

```bash
# Starter Plan: $5/ay
- 500 saat compute time (3 servis × 166 saat)
- PostgreSQL dahil
- 100GB bandwidth

# Maliyetleri azaltmak için:
1. Development branch'leri auto-deploy kapatın
2. Kullanılmayan servisleri durdurun (sleep)
3. Database connection pool optimize edin
4. Frontend'i CDN'e taşıyın (opsiyonel)
```

---

## 📝 Checklist - Railway Deployment

- [ ] **Railway projesi oluşturuldu**
- [ ] **PostgreSQL eklendi**
- [ ] **Backend service eklendi (GitHub repo)**
  - [ ] Environment variables ayarlandı
  - [ ] Database bağlantısı yapılandırıldı
  - [ ] Public domain oluşturuldu
  - [ ] Health check çalışıyor
- [ ] **Frontend service eklendi (GitHub repo)**
  - [ ] Environment variables ayarlandı
  - [ ] Backend URL konfigüre edildi
  - [ ] Public domain oluşturuldu
  - [ ] Nginx çalışıyor
- [ ] **CORS güncellendi (backend)**
- [ ] **Test login başarılı**
- [ ] **GitHub Actions secrets eklendi**
  - [ ] Backend repo → RAILWAY_TOKEN
  - [ ] Frontend repo → RAILWAY_TOKEN
- [ ] **Auto-deploy çalışıyor**

---

## 🚀 Deployment Sonrası

### Custom Domain Ekleme (Opsiyonel)
```bash
Frontend için:
1. Domain sağlayıcınızdan CNAME ekleyin:
   kutuphane.yourdomain.com → your-frontend.up.railway.app

2. Railway → Frontend service → Settings → Domains
3. "Custom Domain" → kutuphane.yourdomain.com
4. SSL otomatik oluşturulur

Backend için:
1. CNAME: api.yourdomain.com → your-backend.up.railway.app
2. Railway → Backend service → Custom Domain ekle
3. Frontend CORS'a custom domain'i ekle
```

### Monitoring Setup
```bash
1. Railway Dashboard → Service → Metrics
2. CPU, Memory, Network grafikleri
3. Logs → Real-time log streaming
4. Alerts → Slack/Discord webhook (Pro plan)
```

### Backup Stratejisi
```bash
# PostgreSQL backup
1. Railway → Postgres → "Backups" sekmesi
2. Manuel backup: "Create Backup"
3. Otomatik backup: Pro plan feature

# Manuel backup via CLI:
railway run pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

---

## 🎉 Tamamlandı!

Artık sisteminiz tamamen Railway'de çalışıyor:

- ✅ Backend: https://your-backend.up.railway.app
- ✅ Frontend: https://your-frontend.up.railway.app
- ✅ Database: PostgreSQL (internal)
- ✅ CI/CD: GitHub Actions → Railway
- ✅ SSL/HTTPS: Otomatik
- ✅ Monitoring: Railway Dashboard

**Herhangi bir sorun olursa Railway logs'ları kontrol edin:**
```bash
railway logs --service backend --tail 100
railway logs --service frontend --tail 100
```

İyi deploymentlar! 🚀
