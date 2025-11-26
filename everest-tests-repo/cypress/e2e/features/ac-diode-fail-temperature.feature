Feature: AC Diode Fail Test mit Temperatur-Überwachung
  Als Benutzer möchte ich das AC Diode Fail Verhalten testen
  und überprüfen, dass eine Temperatur-Störung erkannt wird.

  Scenario: AC Diode Fail verursacht Temperatur-Störung und verhindert Laden
    Given der Benutzer ist auf der Ladeseite
    When der Benutzer wählt Car Simulation "AC Diode Fail" aus
    And der Benutzer das Car Plugin aktiviert
    Then sollte die Temperatur zu hoch sein
    And sollte der Temperatur-Balken rot gefüllt sein
    Then sollte das Laden bei "0 kW" bleiben
