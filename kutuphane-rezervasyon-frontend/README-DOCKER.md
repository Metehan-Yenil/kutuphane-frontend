# 🐳 Frontend Docker Deployment Guide

## 📋 Gereksinimler
- Docker Desktop (Windows/Mac) veya Docker Engine (Linux)
- Docker Compose v2.0+
- Backend ve PostgreSQL container'ları çalışıyor olmalı

## 🚀 Hızlı Başlangıç

### Seçenek 1: Sadece Frontend (Backend zaten çalışıyor)

```bash
cd D:\kutuphane-frontend\kutuphane-rezervasyon-frontend

# Frontend container'ını başlat
docker-compose up -d

# Logları izle
docker-compose logs -f

# Durumu kontrol et
docker-compose ps
```

**Frontend:** http://localhost:4200

### Seçenek 2: Tüm Sistem (PostgreSQL + Backend + Frontend)

```bash
cd D:\kutuphane-frontend\kutuphane-rezervasyon-frontend

# Tüm servisleri başlat
docker-compose -f docker-compose.full.yml up -d

# Logları izle
docker-compose -f docker-compose.full.yml logs -f

# Durumu kontrol et
docker-compose -f docker-compose.full.yml ps
```

**Erişim:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

## 🔧 Komutlar

### Container Yönetimi

```bash
# Frontend'i başlat
docker-compose up -d

# Frontend'i durdur
docker-compose down

# Frontend'i yeniden başlat
docker-compose restart

# Logları canlı izle
docker-compose logs -f frontend
```

### Image Yönetimi

```bash
# Frontend'i yeniden build et
docker-compose build

# Cache kullanmadan build et
docker-compose build --no-cache

# Build edip başlat
docker-compose up -d --build
```

### Kod Değişikliği Sonrası

```bash
# Angular kodunu değiştirdikten sonra
docker-compose build frontend
docker-compose up -d frontend

# veya tek komutla
docker-compose up -d --build frontend
```

## 🔍 Debug ve Test

### Container İçine Girme

```bash
# Frontend container'ına bash ile gir
docker exec -it kutuphane-frontend sh

# İçeride:
# ls -la /usr/share/nginx/html    # Build dosyalarını göster
# cat /etc/nginx/conf.d/default.conf  # Nginx config'i kontrol et
# exit                            # Çık
```

### Health Check

```bash
# Frontend sağlık kontrolü
curl http://localhost:4200

# Container health status
docker inspect kutuphane-frontend --format='{{.State.Health.Status}}'

# Nginx erişim logları
docker logs kutuphane-frontend
```

### Network Test

```bash
# Frontend'den backend'e bağlantı testi
docker exec kutuphane-frontend wget -O- http://backend:8080/actuator/health
```

## 🛠️ Sorun Giderme

### Frontend başlamıyor

```bash
# Logları kontrol et
docker-compose logs frontend

# Container'ı yeniden başlat
docker-compose restart frontend

# Image'ı yeniden build et
docker-compose up -d --build
```

### Build hatası (node_modules)

```bash
# node_modules'ü temizle
rm -rf node_modules package-lock.json

# Docker cache'i temizle
docker-compose build --no-cache

# Tekrar başlat
docker-compose up -d
```

### Port çakışması (4200 kullanımda)

```bash
# Kullanılan portları kontrol et
netstat -ano | findstr :4200

# docker-compose.yml'de portu değiştir:
# ports:
#   - "4201:80"  # 4200 yerine 4201 kullan
```

### Backend'e bağlanamıyor

```bash
# Network'ü kontrol et
docker network ls
docker network inspect kutuphane_kutuphane-network

# Backend çalışıyor mu?
docker ps | grep backend

# CORS ayarlarını kontrol et (backend tarafında)
# Backend'in CORS_ALLOWED_ORIGINS'e http://frontend eklenmiş olmalı
```

## 📊 Monitoring

### Container Resources

```bash
# CPU, Memory kullanımı
docker stats kutuphane-frontend

# Container detayları
docker inspect kutuphane-frontend
```

### Nginx Access Logs

```bash
# Erişim logları
docker logs kutuphane-frontend

# Son 50 satır
docker logs --tail=50 kutuphane-frontend

# Canlı izle
docker logs -f kutuphane-frontend
```

## 🔄 Güncelleme

### Frontend Kod Değişikliği

```bash
# Kodu değiştirdikten sonra:
git pull  # veya değişiklikleri yap

# Yeniden build ve deploy
docker-compose up -d --build
```

### Angular Bağımlılıkları Güncelleme

```bash
# package.json değiştirdikten sonra
docker-compose build --no-cache
docker-compose up -d
```

## 🧹 Temizlik

```bash
# Frontend container'ını durdur ve sil
docker-compose down

# Image'ları da sil
docker-compose down --rmi all

# Kullanılmayan image'ları temizle
docker image prune -a

# Tüm sistemi temizle
docker system prune -a
```

## 🌐 Production Deployment

### Environment Variables

Production'da kullanmak için `.env` dosyası oluşturun:

```bash
cp .env.example .env
# .env dosyasını düzenleyin
```

### Nginx SSL/TLS (HTTPS)

HTTPS için nginx.conf'a ekleyin:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Diğer ayarlar...
}
```

### Reverse Proxy ile Kullanım

Nginx reverse proxy arkasında kullanım:

```nginx
# /etc/nginx/sites-available/kutuphane
upstream frontend {
    server localhost:4200;
}

upstream backend {
    server localhost:8080;
}

server {
    listen 80;
    server_name kutuphane.example.com;

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
    }

    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
    }
}
```

## 📦 Multi-Stage Build Detayları

Dockerfile 2 aşamalı build kullanır:

1. **Build Stage (node:20-alpine)**
   - Angular uygulamasını derler
   - Production build oluşturur
   - ~1.2 GB boyut

2. **Production Stage (nginx:alpine)**
   - Sadece build edilmiş dosyaları içerir
   - Nginx ile serve eder
   - ~30 MB boyut (optimize edilmiş!)

## 🔐 Güvenlik

### Production Önerileri

1. ✅ Environment variables kullanın (API URL, etc.)
2. ✅ HTTPS kullanın (SSL sertifikası)
3. ✅ Security headers aktif (nginx.conf'da mevcut)
4. ✅ Gzip compression aktif (nginx.conf'da mevcut)
5. ✅ Static asset caching aktif (nginx.conf'da mevcut)
6. ✅ Health check yapılandırılmış
7. ✅ .dockerignore ile gereksiz dosyalar hariç tutuldu

## 📞 Destek

### Sık Karşılaşılan Sorunlar

**1. "Cannot find module..." hatası**
```bash
# node_modules'ü temizle ve yeniden build et
docker-compose build --no-cache
```

**2. "Connection refused" (Backend'e bağlanamıyor)**
```bash
# Backend container'ının çalıştığından emin olun
docker ps | grep backend

# Network bağlantısını kontrol edin
docker network inspect kutuphane_kutuphane-network
```

**3. "Port already in use"**
```bash
# docker-compose.yml'de portu değiştirin
# ports: "4201:80" gibi
```

## 🎯 Performans

### Build Süresi
- İlk build: ~5-10 dakika
- Değişiklik sonrası: ~2-5 dakika (cache sayesinde)

### Runtime
- Container başlangıç: ~5 saniye
- Uygulama yüklenme: ~1-2 saniye
- Memory kullanımı: ~50 MB

### Optimizasyon İpuçları

1. Multi-stage build kullanılıyor (optimize edilmiş!)
2. .dockerignore ile gereksiz dosyalar hariç tutulmuş
3. Nginx gzip compression aktif
4. Static asset caching yapılandırılmış
5. Alpine Linux kullanılıyor (minimal boyut)

---

**Hazır!** 🚀 Frontend container'ınız Docker'da çalışmaya hazır!
