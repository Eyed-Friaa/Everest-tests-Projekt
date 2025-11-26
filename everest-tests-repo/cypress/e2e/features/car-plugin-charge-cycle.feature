Feature: Car Plugin Ladevorgang-Test
  Als Benutzer möchte ich das Car Plugin anschließen und wieder ausstecken können,
  damit ich die Ladefunktionalität der Anwendung verifizieren kann.

  Scenario: Vollständiger Ladezyklus - Plugin anschließen und ausstecken
    Given der Benutzer ist auf der Ladeseite
    When der Benutzer das Car Plugin aktiviert
    And der Benutzer wartet 10 Sekunden
    Then sollte der kW-Wert nicht mehr "0 kW" sein
    When der Benutzer das Car Plugin aussteckt
    And der Benutzer wartet 10 Sekunden
    Then sollte der kW-Wert "0 kW" sein 