# SQL Console Backend Implementation

## ⚠️ GÜVENLİK UYARISI

SQL Console özelliği **ÇOK TEHLİKELİDİR**! Production ortamında kullanmadan önce:

1. **Sadece SELECT** sorgularına izin verin
2. **ADMIN rolü zorunlu** yapın
3. **Rate limiting** ekleyin
4. **SQL injection** koruması yapın
5. **Audit log** tutun

## 🔧 Backend Endpoint Oluşturma

### 1. SQL Console Controller Oluştur

`D:\kutuphane\src\main\java\com\kutuphanerezervasyon\controller\SqlConsoleController.java`:

```java
package com.kutuphanerezervasyon.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/sql")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class SqlConsoleController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/execute")
    public ResponseEntity<?> executeSql(@RequestBody SqlQueryRequest request) {
        try {
            String query = request.getQuery().trim().toUpperCase();
            
            // GÜVENLİK: Sadece SELECT sorgularına izin ver
            if (!query.startsWith("SELECT")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Sadece SELECT sorguları çalıştırılabilir!"));
            }
            
            // DML/DDL engelle
            if (query.contains("DROP") || query.contains("DELETE") || 
                query.contains("UPDATE") || query.contains("INSERT") || 
                query.contains("ALTER") || query.contains("CREATE") || 
                query.contains("TRUNCATE")) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "DML/DDL sorguları engellenmiştir!"));
            }

            List<Map<String, Object>> results = jdbcTemplate.queryForList(request.getQuery());
            
            if (results.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "columns", new ArrayList<>(),
                    "rows", new ArrayList<>(),
                    "rowCount", 0
                ));
            }

            // Sütun adlarını al
            Set<String> columns = results.get(0).keySet();
            
            // Satırları liste formatına çevir
            List<List<Object>> rows = new ArrayList<>();
            for (Map<String, Object> row : results) {
                List<Object> rowValues = new ArrayList<>();
                for (String column : columns) {
                    rowValues.add(row.get(column));
                }
                rows.add(rowValues);
            }

            return ResponseEntity.ok(Map.of(
                "columns", columns,
                "rows", rows,
                "rowCount", results.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "SQL Hatası: " + e.getMessage()));
        }
    }
}

class SqlQueryRequest {
    private String query;

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }
}
```

### 2. pom.xml'e JDBC Dependency Ekle (Zaten Var)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
```

### 3. Security Config Güncelle (Opsiyonel)

`SecurityConfig.java`'de endpoint'i admin'e özel yap:

```java
.requestMatchers("/api/admin/sql/**").hasRole("ADMIN")
```

## 🚀 Deployment

### Local Test:
```bash
cd D:\kutuphane
mvn spring-boot:run
```

### Railway'e Push:
```bash
git add .
git commit -m "Add SQL Console endpoint"
git push origin main
```

Railway otomatik deploy edecek!

## 🧪 Test

```bash
# PowerShell
$headers = @{
    'Content-Type' = 'application/json'
    'Authorization' = 'Bearer YOUR_ADMIN_TOKEN'
}

$body = @{
    query = 'SELECT * FROM users LIMIT 5;'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'https://backend-production-e7d0.up.railway.app/api/admin/sql/execute' `
    -Method Post `
    -Headers $headers `
    -Body $body
```

## 🔒 Güvenlik İyileştirmeleri

### 1. Rate Limiting Ekle:
```java
@RateLimiter(name = "sqlConsole", fallbackMethod = "rateLimitFallback")
public ResponseEntity<?> executeSql(@RequestBody SqlQueryRequest request)
```

### 2. Audit Log Tut:
```java
@Autowired
private AuditLogService auditLogService;

// Log her SQL sorgusunu
auditLogService.log(SecurityContextHolder.getContext()
    .getAuthentication().getName(), 
    "SQL_QUERY", 
    request.getQuery());
```

### 3. Query Timeout Ekle:
```java
jdbcTemplate.setQueryTimeout(5); // 5 saniye
```

### 4. Max Row Limit:
```java
if (results.size() > 1000) {
    results = results.subList(0, 1000);
}
```

## ✅ Tamamlandı!

Artık admin panelde SQL Console kullanabilirsiniz! 🎉

**NOT:** Production'da mutlaka güvenlik önlemlerini uygulayın!
