package everest.api;

import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

/**
 * Tests for the full EVerest API functionality:
 *
 * 1. System ready       -> GET /api/system/ready
 * 2. Module list        -> GET /api/modules
 * 3. Module details     -> GET /api/modules/API
 * 4. Config update      -> POST /api/modules/API/config
 * 5. EVSE session info  -> GET /everest_api/evse_manager/var/session_info
 */
public class EverestFullApiTests {

    @BeforeAll
    static void setup() {
        RestAssured.baseURI = "http://127.0.0.1";
        RestAssured.port = 1880;   // Node-RED
        RestAssured.basePath = "";
    }

    // 1. System ready – Prüft, ob EVerest bereit ist
    @Test
    void testSystemReady() {
        when()
            .get("/api/system/ready")
        .then()
            .statusCode(200)
            .body("$", notNullValue())
            .body("ready", equalTo(true));
    }

    // 2. Module list – Prüft, ob Module geladen sind
    @Test
    void testGetModules() {
        when()
            .get("/api/modules")
        .then()
            .statusCode(200)
            .body("modules", notNullValue())
            .body("modules.size()", greaterThan(0))
            .body("modules[0].id", equalTo("API"))
            .body("modules[0].status", equalTo("running"));
    }

    // 3. Module details – Prüft Metadaten + Config des API-Moduls
    @Test
    void testGetModuleDetails() {
        String moduleId = "API";

        given()
            .pathParam("id", moduleId)
        .when()
            .get("/api/modules/{id}")
        .then()
            .statusCode(200)
            .body("id", equalTo(moduleId))
            .body("status", equalTo("running"))
            .body("config", notNullValue())
            .body("config.log_level", equalTo("info"));
    }

    // 4. Config update – Sendet neue Config an das API-Modul
    @Test
    void testConfigUpdate() {
        String moduleId = "API";

        String payload = """
        {
          "log_level": "debug"
        }
        """;

        given()
            .pathParam("id", moduleId)
            .header("Content-Type", "application/json")
            .body(payload)
        .when()
            .post("/api/modules/{id}/config")
        .then()
            .statusCode(200)
            .body("success", equalTo(true));
    }

    // 5. EVSE session_info – Energie, Leistung, Temperatur, Zeit
    @Test
    void testSessionInfo() {
        when()
            .get("/everest_api/evse_manager/var/session_info")
        .then()
            .statusCode(200)

            // bisher geladene Energie (kWh)
            .body("energy_session_kWh", notNullValue())
            .body("energy_session_kWh", greaterThanOrEqualTo(0.0f))

            // aktuelle Ladeleistung (kW)
            .body("power_session_kW", notNullValue())
            .body("power_session_kW", greaterThanOrEqualTo(0.0f))

            // Batterie-Temperatur (°C)
            .body("battery_temperature_C", notNullValue())
            .body("battery_temperature_C", allOf(
                    greaterThanOrEqualTo(-10.0f),
                    lessThanOrEqualTo(70.0f)
            ))

            // Ladezeit (Sekunden)
            .body("charging_time_s", notNullValue())
            .body("charging_time_s", greaterThanOrEqualTo(0));
    }
}
