# Kütüphane Rezervasyon Sistemi - Gatling Yük Testleri

Bu klasör, Kütüphane Rezervasyon Sistemi için Gatling yük testlerini içerir.

## Gereksinimler

- Java 17 veya üzeri
- Maven 3.6 veya üzeri
- Backend API'nin çalışır durumda olması (localhost:8080)

## Test Senaryoları

### 1. BasicSmokeTest
Basit bir smoke test. Tüm temel endpoint'lerin çalıştığını kontrol eder.
- Health check'ler
- Login testi
- **Kullanım**: Hızlı sistem kontrolü

### 2. KutuphaneLoadTest
Kapsamlı yük testi. Gerçek kullanıcı senaryolarını simüle eder.
- Kullanıcı kaydı (10 kullanıcı)
- Login işlemleri (20 kullanıcı)
- Oda müsaitlik kontrolü (50 kullanıcı)
- Rezervasyon oluşturma (30 kullanıcı)
- Admin işlemleri (5 admin)
- **Toplam**: ~115 eşzamanlı kullanıcı

### 3. StressTest
Stres testi. Sistemin limitlerini test eder.
- Kademeli yük artışı (10 → 50 kullanıcı)
- Yüksek frekanslı istekler
- **Amaç**: Sistemin çökme noktasını bulmak

## Kurulum

1. Gatling tests klasörüne gidin:
```bash
cd gatling-tests
```

2. Maven bağımlılıklarını yükleyin:
```bash
mvn clean install
```

## Testleri Çalıştırma

### Smoke Test (Hızlı Kontrol)
```bash
mvn gatling:test -Dgatling.simulationClass=simulations.BasicSmokeTest
```

### Yük Testi (Orta Seviye)
```bash
mvn gatling:test -Dgatling.simulationClass=simulations.KutuphaneLoadTest
```

### Stres Testi (Yüksek Yük)
```bash
mvn gatling:test -Dgatling.simulationClass=simulations.StressTest
```

### Tüm Testleri Çalıştır
```bash
mvn gatling:test
```

## Test Raporları

Testler tamamlandığında, detaylı HTML raporları şu klasörde oluşturulur:
```
gatling-tests/target/gatling/
```

Rapor içeriği:
- ✅ İstek sayıları ve yanıt süreleri
- ✅ Başarı/başarısızlık oranları
- ✅ Yanıt süresi dağılımı (percentile)
- ✅ İstek/saniye grafikleri
- ✅ Hata detayları

## Test Konfigürasyonu Özelleştirme

### Base URL Değiştirme
`KutuphaneLoadTest.scala` dosyasında:
```scala
val baseUrl = "http://localhost:8080"  // Burayı değiştirin
```

### Kullanıcı Sayısını Ayarlama
```scala
setUp(
  roomScenario.inject(
    rampUsers(50).during(60.seconds)  // 50 yerine istediğiniz sayıyı yazın
  )
)
```

### Test Süresi Uzatma
```scala
.maxDuration(5.minutes)  // 2 dakika yerine 5 dakika
```

## Test Öncesi Kontrol Listesi

- [ ] Backend API çalışıyor mu? (http://localhost:8080)
- [ ] Test kullanıcıları mevcut mu?
  - Admin: `admin@example.com` / `admin123`
  - User: `user@example.com` / `user123`
- [ ] Database temiz mi veya test verisi hazır mı?
- [ ] Yeterli kaynak var mı? (CPU, RAM, Network)

## Performans Metrikleri

### Hedef Değerler
- **Yanıt Süresi**: < 500ms (ortalama)
- **Maksimum Yanıt**: < 5000ms
- **Başarı Oranı**: > %95
- **Eşzamanlı Kullanıcı**: 100+
- **İstek/Saniye**: 50+

### Sorun Giderme

**Test başlamıyor:**
```bash
# Maven kurulumunu kontrol edin
mvn --version

# Dependencies'leri yeniden yükleyin
mvn clean install -U
```

**Connection refused hatası:**
```bash
# Backend'in çalıştığını kontrol edin
curl http://localhost:8080/api/rooms
```

**OutOfMemory hatası:**
```bash
# Maven'e daha fazla memory verin
export MAVEN_OPTS="-Xmx2048m -Xms512m"
mvn gatling:test
```

## Sonuçları Analiz Etme

1. **Response Time Chart**: Yanıt sürelerinin zaman içindeki değişimi
2. **Requests per Second**: Sistemin handle ettiği istek sayısı
3. **Response Time Distribution**: Yanıt sürelerinin dağılımı (P50, P95, P99)
4. **Active Users**: Eşzamanlı aktif kullanıcı sayısı

## İleri Seviye

### CI/CD Entegrasyonu
```yaml
# GitHub Actions örneği
- name: Run Gatling Tests
  run: |
    cd gatling-tests
    mvn gatling:test
    
- name: Upload Reports
  uses: actions/upload-artifact@v2
  with:
    name: gatling-reports
    path: gatling-tests/target/gatling/
```

### Jenkins Pipeline
```groovy
stage('Performance Test') {
    steps {
        sh 'cd gatling-tests && mvn gatling:test'
        gatlingArchive()
    }
}
```

## İletişim

Sorular için: metehan.yenil@example.com
