package simulations

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class KutuphaneLoadTest extends Simulation {

  val baseUrl = "http://localhost:8080"
  
  val httpProtocol = http
    .baseUrl(baseUrl)
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .userAgentHeader("Gatling Load Test")

  // Test verileri
  val testUser = Map(
    "name" -> "Test User",
    "email" -> "test${scala.util.Random.nextInt(100000)}@example.com",
    "password" -> "test123"
  )

  // Senaryo 1: Kullanıcı Kaydı
  val registerScenario = scenario("User Registration")
    .exec(http("Register User")
      .post("/api/auth/register")
      .body(StringBody("""{"name":"${name}","email":"${email}","password":"${password}"}""")).asJson
      .check(status.is(200)))
    .pause(1)

  // Senaryo 2: Kullanıcı Girişi
  val loginScenario = scenario("User Login")
    .exec(http("Login")
      .post("/api/auth/login")
      .body(StringBody("""{"email":"admin@example.com","password":"admin123"}""")).asJson
      .check(status.is(200))
      .check(jsonPath("$.token").saveAs("authToken")))
    .pause(1)
    .exec(http("Get User Profile")
      .get("/api/auth/me")
      .header("Authorization", "Bearer ${authToken}")
      .check(status.is(200)))

  // Senaryo 3: Oda Listesi ve Müsaitlik Kontrolü
  val roomScenario = scenario("Room Availability Check")
    .exec(http("Login")
      .post("/api/auth/login")
      .body(StringBody("""{"email":"user@example.com","password":"user123"}""")).asJson
      .check(status.is(200))
      .check(jsonPath("$.token").saveAs("authToken")))
    .pause(1)
    .exec(http("Get All Rooms")
      .get("/api/rooms")
      .header("Authorization", "Bearer ${authToken}")
      .check(status.is(200)))
    .pause(1)
    .exec(http("Get Time Slots")
      .get("/api/timeslots")
      .header("Authorization", "Bearer ${authToken}")
      .check(status.is(200)))
    .pause(1)
    .exec(http("Check Available Rooms")
      .get("/api/rooms/available")
      .queryParam("date", "2025-11-20")
      .queryParam("timeSlotId", "1")
      .header("Authorization", "Bearer ${authToken}")
      .check(status.is(200)))

  // Senaryo 4: Rezervasyon Oluşturma
  val reservationScenario = scenario("Create Reservation")
    .exec(http("Login")
      .post("/api/auth/login")
      .body(StringBody("""{"email":"user@example.com","password":"user123"}""")).asJson
      .check(status.is(200))
      .check(jsonPath("$.token").saveAs("authToken"))
      .check(jsonPath("$.userId").saveAs("userId")))
    .pause(1)
    .exec(http("Create Reservation")
      .post("/api/reservations")
      .header("Authorization", "Bearer ${authToken}")
      .body(StringBody("""{"userId":${userId},"roomId":1,"timeSlotId":1,"reservationDate":"2025-11-20"}""")).asJson
      .check(status.in(200, 201, 400))) // 400 kabul et çünkü zaten rezerve olabilir
    .pause(1)

  // Senaryo 5: Admin İşlemleri
  val adminScenario = scenario("Admin Operations")
    .exec(http("Admin Login")
      .post("/api/auth/login")
      .body(StringBody("""{"email":"admin@example.com","password":"admin123"}""")).asJson
      .check(status.is(200))
      .check(jsonPath("$.token").saveAs("authToken")))
    .pause(1)
    .exec(http("Get Dashboard Stats")
      .get("/api/admin/dashboard")
      .header("Authorization", "Bearer ${authToken}")
      .check(status.is(200)))
    .pause(1)
    .exec(http("Get All Users")
      .get("/api/admin/users")
      .header("Authorization", "Bearer ${authToken}")
      .check(status.is(200)))
    .pause(1)
    .exec(http("Get Pending Reservations")
      .get("/api/admin/reservations/pending")
      .header("Authorization", "Bearer ${authToken}")
      .check(status.is(200)))

  // Yük testi konfigürasyonu
  setUp(
    // Hafif yük - 10 kullanıcı 30 saniye boyunca
    registerScenario.inject(
      rampUsers(10).during(30.seconds)
    ),
    
    // Orta yük - 20 kullanıcı login
    loginScenario.inject(
      rampUsers(20).during(30.seconds)
    ),
    
    // Ağır yük - 50 kullanıcı oda kontrolü
    roomScenario.inject(
      rampUsers(50).during(60.seconds)
    ),
    
    // Rezervasyon yükü - 30 kullanıcı
    reservationScenario.inject(
      rampUsers(30).during(45.seconds)
    ),
    
    // Admin yükü - 5 admin kullanıcısı
    adminScenario.inject(
      constantUsersPerSec(2).during(30.seconds)
    )
  ).protocols(httpProtocol)
   .assertions(
     global.responseTime.max.lt(5000), // Maksimum yanıt süresi 5 saniye
     global.successfulRequests.percent.gt(95) // %95 başarı oranı
   )
}
