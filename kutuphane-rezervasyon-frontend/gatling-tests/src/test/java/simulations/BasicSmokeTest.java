package simulations;

import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

public class BasicSmokeTest extends Simulation {

    HttpProtocolBuilder httpProtocol = http
        .baseUrl("http://localhost:8080")
        .acceptHeader("application/json")
        .contentTypeHeader("application/json")
        .header("Origin", "http://localhost:4201");

    ScenarioBuilder scn = scenario("Basic Smoke Test")
        .exec(http("Health Check - Rooms")
            .get("/api/rooms")
            .check(status().is(200)))
        .pause(1)
        .exec(http("Health Check - Equipment")
            .get("/api/equipment")
            .check(status().is(200)))
        .pause(1)
        .exec(http("Health Check - Time Slots")
            .get("/api/timeslots")
            .check(status().is(200)))
        .pause(1)
        .exec(http("Login Test")
            .post("/api/auth/login")
            .body(StringBody("{\"email\":\"root@kutuphane.com\",\"password\":\"root123\"}"))
            .asJson()
            .check(status().is(200))
            .check(jsonPath("$.userId").exists())
            .check(jsonPath("$.role").is("ADMIN")));

    {
        setUp(
            scn.injectOpen(atOnceUsers(1))
        ).protocols(httpProtocol);
    }
}
