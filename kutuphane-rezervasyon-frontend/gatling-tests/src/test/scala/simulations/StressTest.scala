package simulations

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class StressTest extends Simulation {

  val baseUrl = "http://localhost:8080"
  
  val httpProtocol = http
    .baseUrl(baseUrl)
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")

  // Stres testi - Sistemin limitlerini test eder
  val stressScenario = scenario("Stress Test - High Load")
    .exec(http("Login")
      .post("/api/auth/login")
      .body(StringBody("""{"email":"user@example.com","password":"user123"}""")).asJson
      .check(status.is(200))
      .check(jsonPath("$.token").saveAs("authToken")))
    .pause(1)
    .repeat(10) {
      exec(http("Rapid Room Check")
        .get("/api/rooms/available")
        .queryParam("date", "2025-11-20")
        .queryParam("timeSlotId", "1")
        .header("Authorization", "Bearer ${authToken}")
        .check(status.in(200, 429, 500))) // 429: Too Many Requests, 500: Server Error
      .pause(100.milliseconds)
    }

  setUp(
    stressScenario.inject(
      // Kademeli olarak kullanıcı sayısını artır
      rampUsers(10).during(10.seconds),
      constantUsersPerSec(5).during(20.seconds),
      rampUsers(50).during(30.seconds),
      constantUsersPerSec(20).during(40.seconds)
    )
  ).protocols(httpProtocol)
   .maxDuration(2.minutes)
   .assertions(
     global.responseTime.max.lt(10000),
     global.successfulRequests.percent.gt(80)
   )
}
