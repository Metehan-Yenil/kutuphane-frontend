# 🚀 GitHub Actions + Railway CI/CD Setup Guide

## 📋 Gerekli Adımlar

### 1️⃣ GitHub Secrets Oluşturma

GitHub repository → Settings → Secrets and variables → Actions → "New repository secret"

**Gerekli Secrets:**

| Secret Name | Açıklama | Nasıl Alınır |
|-------------|----------|--------------|
| `DOCKERHUB_USERNAME` | Docker Hub kullanıcı adınız | hub.docker.com |
| `DOCKERHUB_TOKEN` | Docker Hub access token | hub.docker.com → Account Settings → Security |
| `RAILWAY_TOKEN` | Railway API token | railway.app → Account → Tokens |

---

### 2️⃣ Docker Hub Setup

#### Docker Hub Hesabı Oluşturma
1. https://hub.docker.com adresine gidin
2. "Sign Up" ile hesap oluşturun
3. Email doğrulama yapın

#### Access Token Oluşturma
```bash
1. hub.docker.com → Account Settings
2. Security → New Access Token
3. Name: "github-actions"
4. Permissions: Read, Write, Delete
5. Generate Token
6. Token'ı kopyalayın (bir daha gösterilmeyecek!)
```

#### GitHub'a Token Ekleme
```bash
1. GitHub repo → Settings → Secrets → Actions
2. New repository secret
3. Name: DOCKERHUB_TOKEN
4. Value: (kopyaladığınız token)
5. Add secret
```

---

### 3️⃣ Railway Setup

#### Railway Hesabı Oluşturma
1. https://railway.app adresine gidin
2. "Login with GitHub" ile giriş yapın
3. GitHub hesabınızı bağlayın

#### Yeni Proje Oluşturma
```bash
1. Railway Dashboard → "New Project"
2. "Deploy from GitHub repo" seçin
3. Repository'nizi seçin
4. "Add variables" → Environment variables ekleyin
```

#### PostgreSQL Ekleme
```bash
1. Project içinde → "+ New"
2. "Database" → "Add PostgreSQL"
3. Otomatik oluşturulur
```

#### Railway Token Alma
```bash
1. Railway Dashboard → Account Settings
2. "Tokens" sekmesi
3. "Create New Token"
4. Name: "github-actions"
5. Token'ı kopyalayın
```

#### GitHub'a Token Ekleme
```bash
1. GitHub repo → Settings → Secrets → Actions
2. New repository secret
3. Name: RAILWAY_TOKEN
4. Value: (Railway token'ı)
5. Add secret
```

---

### 4️⃣ Railway Service Yapılandırması

#### Backend Service
```bash
Service Name: backend
Build Method: Dockerfile
Port: 8080
Health Check: /actuator/health

Environment Variables:
- SPRING_PROFILES_ACTIVE=prod
- SPRING_DATASOURCE_URL=${{DATABASE_URL}}
- SPRING_DATASOURCE_USERNAME=${{PGUSER}}
- SPRING_DATASOURCE_PASSWORD=${{PGPASSWORD}}
- CORS_ALLOWED_ORIGINS=https://your-frontend.up.railway.app
- SERVER_PORT=8080
```

#### Frontend Service
```bash
Service Name: frontend
Build Method: Dockerfile
Port: 80
Health Check: /

Environment Variables:
- NODE_ENV=production
- API_URL=https://your-backend.up.railway.app
```

---

### 5️⃣ GitHub Actions Workflow Test

#### İlk Deploy
```bash
# Değişiklik yap ve commit et
git add .
git commit -m "Add CI/CD pipeline"
git push origin main

# GitHub Actions'da takip et
# GitHub repo → Actions sekmesi
```

#### Workflow Adımları
1. ✅ Checkout code
2. ✅ Run tests
3. ✅ Build Docker image
4. ✅ Push to Docker Hub
5. ✅ Deploy to Railway
6. ✅ Health check
7. ✅ Notification

---

### 6️⃣ Secrets Kontrol Listesi

```bash
# Terminal'de kontrol edin
gh secret list

# Olması gerekenler:
✅ DOCKERHUB_USERNAME
✅ DOCKERHUB_TOKEN
✅ RAILWAY_TOKEN
```

---

## 🔧 Manuel Railway Deploy (İlk Kurulum)

Railway CLI ile ilk deploy:

```bash
# 1. Railway CLI kur
npm install -g @railway/cli

# 2. Login
railway login

# 3. Frontend proje oluştur
cd D:\kutuphane-frontend\kutuphane-rezervasyon-frontend
railway init
railway link  # Projeyi seç

# 4. Environment variables
railway variables set NODE_ENV=production
railway variables set API_URL=https://backend-url.up.railway.app

# 5. Deploy
railway up

# 6. Backend proje oluştur
cd D:\kutuphane
railway init
railway link

# 7. PostgreSQL ekle
railway add --database postgresql

# 8. Environment variables
railway variables set SPRING_PROFILES_ACTIVE=prod
railway variables set CORS_ALLOWED_ORIGINS=https://frontend-url.up.railway.app

# 9. Deploy
railway up
```

---

## 📊 Monitoring ve Logs

### Railway Dashboard
```bash
# Canlı loglar
railway logs --tail 100

# Metrics
Railway Dashboard → Service → Metrics

# Database queries
railway connect postgres
```

### GitHub Actions
```bash
# Workflow çalıştırma geçmişi
GitHub → Actions → Workflow seçin

# Log detayları
Action run → Job seçin → Step loglarını inceleyin
```

---

## 🐛 Sorun Giderme

### Docker Build Başarısız
```bash
# Lokal test
docker build -t test-image .
docker run -p 8080:8080 test-image
```

### Railway Deploy Başarısız
```bash
# Logları kontrol et
railway logs --tail 200

# Service'i restart et
railway restart

# Environment variables kontrol
railway variables
```

### GitHub Actions Başarısız
```bash
# Secrets doğru mu?
GitHub → Settings → Secrets → Actions

# Workflow syntax kontrol
https://github.com/your-repo/actions

# Re-run job
Actions → Failed run → "Re-run jobs"
```

---

## 🎯 Deployment Workflow

```mermaid
Developer → GitHub Push
    ↓
GitHub Actions Trigger
    ↓
Run Tests
    ↓
Build Docker Image
    ↓
Push to Docker Hub
    ↓
Deploy to Railway
    ↓
Health Check
    ↓
✅ Production Ready
```

---

## 📝 Checklist

Deployment öncesi kontrol listesi:

- [ ] Docker Hub hesabı oluşturuldu
- [ ] Docker Hub token alındı
- [ ] Railway hesabı oluşturuldu
- [ ] Railway token alındı
- [ ] GitHub secrets eklendi
- [ ] Railway projesi oluşturuldu
- [ ] PostgreSQL eklendi
- [ ] Environment variables ayarlandı
- [ ] Workflow dosyaları commit edildi
- [ ] İlk deploy test edildi
- [ ] Health check çalışıyor
- [ ] Frontend backend'e bağlanabiliyor

---

## 💰 Maliyet Tahmini

**Railway Pricing:**
- Starter Plan: $5/ay (500 saat)
- Database: Dahil
- Bandwidth: 100 GB dahil
- Tahmini maliyet: $5-15/ay

**Docker Hub:**
- Ücretsiz (public images için)

**GitHub Actions:**
- Public repo: Ücretsiz unlimited
- Private repo: 2000 dakika/ay ücretsiz

---

## 🚀 Sonraki Adımlar

1. ✅ GitHub secrets ekleyin
2. ✅ Railway projesi oluşturun
3. ✅ İlk deploy'u manuel yapın
4. ✅ GitHub Actions workflow'u test edin
5. ✅ Custom domain ekleyin (opsiyonel)
6. ✅ SSL/HTTPS'i doğrulayın
7. ✅ Monitoring setup yapın
8. ✅ Backup stratejisi belirleyin

**Hazır olduğunuzda bana bildirin, adım adım ilerleyelim!** 🎉
