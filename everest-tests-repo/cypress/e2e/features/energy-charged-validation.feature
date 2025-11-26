Feature: Energy Charged Validierung
  Als Benutzer möchte ich überprüfen, dass Energy Charged korrekt angezeigt wird,
  wenn das Laden gestartet wird.

  Scenario: Energy Charged erhöht sich nach dem Ladestart
    Given der Benutzer ist auf der Ladeseite
    When der Benutzer das Car Plugin aktiviert
    And der Benutzer wartet 5 Sekunden
    Then sollte Energy Charged angezeigt werden
    And sollte Energy Charged mehr als "0.00 kWh" sein
