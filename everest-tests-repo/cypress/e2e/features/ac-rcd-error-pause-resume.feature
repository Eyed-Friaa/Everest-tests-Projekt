Feature: Car Simulation und Pause/Resume Test
  Als Benutzer möchte ich verschiedene Car Simulation Modi testen
  und die Pause/Resume Funktionalität überprüfen.

  Scenario: Car Simulation mit AC RCD Error und Pause/Resume
    Given der Benutzer ist auf der Ladeseite
    When der Benutzer wählt Car Simulation "AC RCD Error" aus
    And der Benutzer das Car Plugin aktiviert
    And der Benutzer wartet 10 Sekunden
    Then sollte das Laden erfolgreich starten
    When der Benutzer klickt auf EV Pause
    Then sollte nichts passieren beim Pausieren
    When der Benutzer klickt auf EV Resume
    Then sollte nichts passieren beim Fortsetzen
