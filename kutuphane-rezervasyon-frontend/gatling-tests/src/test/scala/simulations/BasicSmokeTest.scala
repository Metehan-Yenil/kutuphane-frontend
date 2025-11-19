package simulations

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class BasicSmokeTest extends Simulation {

  val baseUrl = "http://localhost:8080"
  
  val httpProtocol = http
    .baseUrl(baseUrl)
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")

  // Basit Smoke Test - Tüm endpoint'lerin çalıştığını kontrol eder
  val smokeTest = scenario("Basic Smoke Test")
    .exec(http("Health Check - Rooms")
      .get("/api/rooms")
      .check(status.in(200, 401))) // 401 da kabul edilebilir (auth gerekli)
    .pause(1)
    .exec(http("Health Check - Equipment")
      .get("/api/equipment")
      .check(status.in(200, 401)))
    .pause(1)
    .exec(http("Health Check - Time Slots")
      .get("/api/timeslots")
      .check(status.in(200, 401)))
    .pause(1)
    .exec(http("Login Test")
      .post("/api/auth/login")
      .body(StringBody("""{"email":"admin@example.com","password":"admin123"}""")).asJson
      .check(status.is(200))
      .check(jsonPath("$.token").exists))

  setUp(
    smokeTest.inject(atOnceUsers(1))
  ).protocols(httpProtocol)
}
