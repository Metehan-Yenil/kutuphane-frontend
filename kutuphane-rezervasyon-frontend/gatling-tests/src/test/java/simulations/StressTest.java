package simulations;

import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;

import java.time.Duration;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

public class StressTest extends Simulation {

    HttpProtocolBuilder httpProtocol = http
        .baseUrl("http://localhost:8080")
        .acceptHeader("application/json")
        .contentTypeHeader("application/json")
        .header("Origin", "http://localhost:4201");

    // Stres testi - Sistemin limitlerini test eder
    ScenarioBuilder stressScenario = scenario("Stress Test - High Load")
        .exec(http("Login")
            .post("/api/auth/login")
            .body(StringBody("{\"email\":\"root@kutuphane.com\",\"password\":\"root123\"}"))
            .asJson()
            .check(status().is(200))
            .check(jsonPath("$.userId").exists()))
        .pause(1)
        .repeat(10).on(
            exec(http("Rapid Room Check")
                .get("/api/rooms/available")
                .queryParam("date", "2025-11-20")
                .queryParam("timeSlotId", "1")
                .check(status().in(200, 401, 429, 500))) // 429: Too Many Requests, 500: Server Error
            .pause(Duration.ofMillis(100))
        );

    {
        setUp(
            stressScenario.injectOpen(
                // Kademeli olarak kullanıcı sayısını artır
                rampUsers(10).during(Duration.ofSeconds(10)),
                constantUsersPerSec(5).during(Duration.ofSeconds(20)),
                rampUsers(50).during(Duration.ofSeconds(30)),
                constantUsersPerSec(20).during(Duration.ofSeconds(40))
            )
        ).protocols(httpProtocol)
         .maxDuration(Duration.ofMinutes(2))
         .assertions(
             global().responseTime().max().lt(10000),
             global().successfulRequests().percent().gt(80.0)
         );
    }
}
