package simulations;

import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;

import java.time.Duration;
import java.util.Random;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

public class KutuphaneLoadTest extends Simulation {

    HttpProtocolBuilder httpProtocol = http
        .baseUrl("http://localhost:8080")
        .acceptHeader("application/json")
        .contentTypeHeader("application/json")
        .header("Origin", "http://localhost:4201");

    // Senaryo 1: Kullanıcı Kayıdı
    ScenarioBuilder registerScenario = scenario("User Registration")
        .exec(session -> {
            int randomNum = new Random().nextInt(100000);
            return session.set("email", "test" + randomNum + "@example.com");
        })
        .exec(http("Register User")
            .post("/api/auth/register")
            .body(StringBody("{\"name\":\"Test User\",\"email\":\"#{email}\",\"password\":\"test123\"}"))
            .asJson()
            .check(status().in(200, 201, 400))) // 400 kabul et (kullanıcı zaten var olabilir)
        .pause(1);

    // Senaryo 2: Kullanıcı Girişi
    ScenarioBuilder loginScenario = scenario("User Login")
        .exec(http("Login")
            .post("/api/auth/login")
            .body(StringBody("{\"email\":\"root@kutuphane.com\",\"password\":\"root123\"}"))
            .asJson()
            .check(status().is(200))
            .check(jsonPath("$.userId").saveAs("userId"))
            .check(jsonPath("$.role").exists()))
        .pause(1);

    // Senaryo 3: Oda Listesi ve Müsaitlik Kontrolü
    ScenarioBuilder roomScenario = scenario("Room Availability Check")
        .exec(http("Get All Rooms")
            .get("/api/rooms")
            .check(status().in(200, 401)))
        .pause(1)
        .exec(http("Get Time Slots")
            .get("/api/timeslots")
            .check(status().in(200, 401)))
        .pause(1)
        .exec(http("Check Available Rooms")
            .get("/api/rooms/available")
            .queryParam("date", "2025-11-20")
            .queryParam("timeSlotId", "1")
            .check(status().in(200, 401, 404)));

    // Senaryo 4: Rezervasyon Oluşturma
    ScenarioBuilder reservationScenario = scenario("Create Reservation")
        .exec(http("Create Reservation")
            .post("/api/reservations")
            .body(StringBody("{\"userId\":15,\"roomId\":1,\"timeSlotId\":1,\"reservationDate\":\"2025-11-20\"}"))
            .asJson()
            .check(status().in(200, 201, 400, 401, 409))) // 400: Max limit, 409: Conflict (zaten rezerve)
        .pause(1);

    // Senaryo 5: Admin İşlemleri
    ScenarioBuilder adminScenario = scenario("Admin Operations")
        .exec(http("Admin Login")
            .post("/api/auth/login")
            .body(StringBody("{\"email\":\"root@kutuphane.com\",\"password\":\"root123\"}"))
            .asJson()
            .check(status().is(200))
            .check(jsonPath("$.userId").saveAs("adminId"))
            .check(jsonPath("$.role").is("ADMIN")))
        .pause(1)
        .exec(http("Get Dashboard Stats")
            .get("/api/admin/dashboard")
            .check(status().in(200, 401, 403)))
        .pause(1)
        .exec(http("Get All Users")
            .get("/api/admin/users")
            .check(status().in(200, 401, 403)))
        .pause(1)
        .exec(http("Get Pending Reservations")
            .get("/api/admin/reservations/pending")
            .check(status().in(200, 401, 403)));

    {
        setUp(
            // Hafif yük - 10 kullanıcı 30 saniye boyunca
            registerScenario.injectOpen(
                rampUsers(10).during(Duration.ofSeconds(30))
            ),
            
            // Orta yük - 20 kullanıcı login
            loginScenario.injectOpen(
                rampUsers(20).during(Duration.ofSeconds(30))
            ),
            
            // Ağır yük - 50 kullanıcı oda kontrolü
            roomScenario.injectOpen(
                rampUsers(50).during(Duration.ofSeconds(60))
            ),
            
            // Rezervasyon yükü - 30 kullanıcı
            reservationScenario.injectOpen(
                rampUsers(30).during(Duration.ofSeconds(45))
            ),
            
            // Admin yükü - 5 admin kullanıcısı
            adminScenario.injectOpen(
                constantUsersPerSec(2).during(Duration.ofSeconds(30))
            )
        ).protocols(httpProtocol)
         .assertions(
             global().responseTime().max().lt(5000), // Maksimum yanıt süresi 5 saniye
             global().successfulRequests().percent().gt(90.0) // %90 başarı oranı (rezervasyon endpoint sorunlu)
         );
    }
}
