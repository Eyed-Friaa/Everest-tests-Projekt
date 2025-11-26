#!/usr/bin/env python3
# interactive_everest_test.py

import paho.mqtt.client as mqtt
import json
import time
import threading
import requests
from datetime import datetime
import sys
import select
import termios
import tty

class InteractiveEverestTester:
    def __init__(self):
        self.mqtt_host = "localhost"
        self.mqtt_port = 1883
        self.nodered_url = "http://localhost:1880/ui"
        self.client = mqtt.Client()
        
        # Test-Daten Sammeln
        self.test_data = {
            'start_time': None,
            'message_count': 0,
            'state_changes': [],
            'errors_detected': [],
            'user_actions': [],
            'session_phases': [],
            'charging_cycles': []
        }
        
        # Flags für interaktive Steuerung
        self.is_running = True
        self.current_phase = "Initialization"
        self.auto_stop_after_cycle = True
        self.cycle_start_time = None
        self.cycle_states = []
        self.last_state = None
        
        # Terminal-Einstellungen für bessere Eingabe
        self.old_settings = None
        
    def setup_terminal(self):
        """Stellt das Terminal für nicht-blockierende Eingabe ein"""
        try:
            self.old_settings = termios.tcgetattr(sys.stdin)
            tty.setcbreak(sys.stdin.fileno())
        except Exception as e:
            print(f"Terminal-Konfiguration fehlgeschlagen: {e}")

    def restore_terminal(self):
        """Stellt das Terminal wieder her"""
        if self.old_settings:
            try:
                termios.tcsetattr(sys.stdin, termios.TCSADRAIN, self.old_settings)
            except Exception as e:
                print(f"Terminal-Wiederherstellung fehlgeschlagen: {e}")

    def on_connect(self, client, userdata, flags, rc):
        print("✅ MQTT Broker verbunden")
        # Subscribe zu allen relevanten Topics
        client.subscribe("everest_api/#")
        client.subscribe("everest/modules/#")
        client.subscribe("everest_external/#")
        
    def on_message(self, client, userdata, msg):
        self.test_data['message_count'] += 1
        
        # Verarbeite wichtige Nachrichten
        try:
            payload = msg.payload.decode()
            data = json.loads(payload) if payload else {}
            
            # Zustandsänderungen erkennen
            if "session_info" in msg.topic and "state" in str(data):
                self.handle_state_change(msg.topic, data)
            
            # Fehler erkennen (mit verbesserter Filterung)
            if self.is_real_error(msg.topic, data):
                self.handle_error_detection(msg.topic, data)
                
            # Lade-Phasen erkennen
            if any(phase in str(data).lower() for phase in ["charging", "plug", "power", "session"]):
                self.handle_charging_phase(msg.topic, data)
                
        except Exception as e:
            pass

    def is_real_error(self, topic, data):
        """Erkennt echte Fehler, nicht normale System-Topics"""
        # Ignoriere normale System-Topics
        ignore_patterns = [
            "error_history/cmd",
            "errors/var/active_errors", 
            "evse_manager/var/session_info"
        ]
        
        if any(pattern in topic for pattern in ignore_patterns):
            return False
            
        # Echte Fehler am Inhalt erkennen
        if isinstance(data, dict):
            error_indicators = ["fault", "failure", "critical", "emergency"]
            for key, value in data.items():
                if any(indicator in str(key).lower() for indicator in error_indicators):
                    if value and value != "None" and value != "false":
                        return True
        return False

    def handle_state_change(self, topic, data):
        """Erkennt und protokolliert Zustandsänderungen"""
        if isinstance(data, dict) and 'state' in data:
            current_state = data['state']
            
            change = {
                'timestamp': datetime.now().isoformat(),
                'topic': topic,
                'state': current_state,
                'data': data,
                'phase': self.current_phase
            }
            self.test_data['state_changes'].append(change)
            
            # Zustandsverlauf für Zykluserkennung
            self.cycle_states.append(current_state)
            
            print(f"🔄 ZUSTANDSÄNDERUNG: {current_state}")
            
            # Zyklus-Start erkennen (Plug-in oder Charging beginnen)
            if current_state in ["Charging", "Preparing"] and self.cycle_start_time is None:
                self.cycle_start_time = time.time()
                print("🔋 LADEZYKLUS GESTARTET")
            
            # Zyklus-Ende erkennen (Ready nach Charging)
            elif current_state == "Ready" and self.last_state in ["Charging", "Finished"]:
                if self.cycle_start_time:
                    cycle_duration = time.time() - self.cycle_start_time
                    cycle_info = {
                        'start_time': self.cycle_start_time,
                        'end_time': time.time(),
                        'duration': cycle_duration,
                        'states': self.cycle_states.copy()
                    }
                    self.test_data['charging_cycles'].append(cycle_info)
                    print(f"✅ LADEZYKLUS BEENDET - Dauer: {cycle_duration:.1f}s")
                    
                    # Automatische Beendigung nach Zyklus
                    if self.auto_stop_after_cycle:
                        print("⏳ Beende Test in 10 Sekunden...")
                        threading.Timer(10.0, self.graceful_shutdown).start()
                    
                    self.cycle_start_time = None
                    self.cycle_states = []
            
            self.last_state = current_state

    def handle_error_detection(self, topic, data):
        """Erkennt und protokolliert echte Fehler"""
        error = {
            'timestamp': datetime.now().isoformat(),
            'topic': topic,
            'data': data,
            'phase': self.current_phase
        }
        self.test_data['errors_detected'].append(error)
        print(f"🚨 ECHTER FEHLER ERKANNT: {topic}")

    def handle_charging_phase(self, topic, data):
        """Erkennt Lade-Phasen"""
        phase_info = {
            'timestamp': datetime.now().isoformat(),
            'topic': topic,
            'data': data,
            'phase': self.current_phase
        }
        self.test_data['session_phases'].append(phase_info)

    def graceful_shutdown(self):
        """Elegantes Beenden des Tests"""
        print("\n" + "="*60)
        print("🔄 AUTOMATISCHE BEENDIGUNG NACH LADEZYKLUS")
        print("="*60)
        self.is_running = False

    def start_mqtt_listener(self):
        """Startet den MQTT Listener im Hintergrund"""
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        
        try:
            self.client.connect(self.mqtt_host, self.mqtt_port, 60)
            self.client.loop_start()
            return True
        except Exception as e:
            print(f"❌ MQTT Verbindung fehlgeschlagen: {e}")
            return False

    def check_system_status(self):
        """Prüft Systemstatus vor Teststart"""
        print("🔍 Prüfe Systemstatus...")
        
        checks = {
            "Node-RED UI": self.check_nodered(),
            "MQTT Broker": self.check_mqtt(),
            "EVerest Core": self.check_everest_active()
        }
        
        all_ok = True
        for service, status in checks.items():
            icon = "✅" if status else "❌"
            print(f"   {icon} {service}: {'Bereit' if status else 'Nicht bereit'}")
            if not status:
                all_ok = False
                
        return all_ok

    def check_nodered(self):
        try:
            response = requests.get(self.nodered_url, timeout=5)
            return response.status_code == 200
        except:
            return False

    def check_mqtt(self):
        try:
            client = mqtt.Client()
            client.connect(self.mqtt_host, self.mqtt_port, 5)
            client.disconnect()
            return True
        except:
            return False

    def check_everest_active(self):
        try:
            client = mqtt.Client()
            messages = []
            
            def temp_callback(client, userdata, msg):
                messages.append(msg.topic)
                
            client.on_message = temp_callback
            client.connect(self.mqtt_host, self.mqtt_port, 60)
            client.subscribe("everest_api/#")
            client.loop_start()
            time.sleep(3)
            client.loop_stop()
            
            return len(messages) > 0
        except:
            return False

    def print_real_time_stats(self):
        """Gibt Echtzeit-Statistiken aus"""
        current_time = datetime.now().strftime("%H:%M:%S")
        duration = time.time() - self.test_data['start_time']
        
        print(f"\n📊 LIVE-STATISTIK [{current_time}] - Laufzeit: {int(duration)}s")
        print(f"   📨 Nachrichten: {self.test_data['message_count']}")
        print(f"   🔄 Zustandsänderungen: {len(self.test_data['state_changes'])}")
        print(f"   🚨 Echte Fehler: {len(self.test_data['errors_detected'])}")
        print(f"   ⚡ Lade-Phasen: {len(self.test_data['session_phases'])}")
        print(f"   🔋 Komplette Zyklen: {len(self.test_data['charging_cycles'])}")
        print(f"   🎯 Aktuelle Phase: {self.current_phase}")
        
        if self.test_data['charging_cycles']:
            last_cycle = self.test_data['charging_cycles'][-1]
            print(f"   ⏱️  Letzter Zyklus: {last_cycle['duration']:.1f}s")

    def user_interaction_menu(self):
        """Zeigt Interaktions-Menü für Benutzer"""
        print("\n" + "="*60)
        print("🎮 INTERAKTIVE TEST-STEUERUNG")
        print("="*60)
        print("Mögliche Aktionen während des Tests:")
        print("   🔌 In Node-RED UI (http://localhost:1880/ui):")
        print("      - Fahrzeug einstecken (Plug-in)")
        print("      - Laden starten") 
        print("      - Fahrzeug ausstecken (Unplug)")
        print("      - Ladeleistung anpassen")
        print("   📟 Im EVerest Terminal:")
        print("      - Log-Nachrichten beobachten")
        print("      - Zustandsänderungen verfolgen")
        print("   🧪 Hier im Test-Terminal:")
        print("      - ENTER: Aktuelle Statistiken anzeigen")
        print("      - 's': Detaillierte Session-Info anzeigen")
        print("      - 'c': Ladezyklen-Report anzeigen")
        print("      - 'e': Fehler-Report anzeigen")
        print("      - 'p': Performance-Report anzeigen")
        print("      - 'a': Auto-Stop umschalten (aktuell: " + 
              ("✅ AN" if self.auto_stop_after_cycle else "❌ AUS") + ")")
        print("      - 'q': Test sofort beenden")
        print("="*60)
        print("💡 TIPP: Test endet automatisch 10s nach komplettem Ladezyklus")
        print("="*60)

    def wait_for_user_input(self):
        """Wartet auf Benutzereingabe ohne Blockierung - KORRIGIERTE VERSION"""
        try:
            # Verwende select mit kürzerem Timeout für bessere Reaktionszeit
            if select.select([sys.stdin], [], [], 0.1)[0]:
                char = sys.stdin.read(1)
                
                if char == '\n':  # ENTER
                    self.print_real_time_stats()
                    return True
                elif char == 's':
                    self.show_session_info()
                    return True
                elif char == 'c':
                    self.show_cycle_report()
                    return True
                elif char == 'e':
                    self.show_error_report()
                    return True
                elif char == 'p':
                    self.show_performance_report()
                    return True
                elif char == 'a':
                    self.auto_stop_after_cycle = not self.auto_stop_after_cycle
                    status = "✅ AN" if self.auto_stop_after_cycle else "❌ AUS"
                    print(f"\n🔄 Auto-Stop nach Zyklus: {status}")
                    return True
                elif char == 'q':
                    print("\n🛑 Test wird beendet...")
                    self.is_running = False
                    return False
                else:
                    # Unbekannte Eingabe - zeige Hilfetext
                    print(f"\n❌ Unbekannter Befehl: '{char}'")
                    print("   Verfügbare Befehle: ENTER, s, c, e, p, a, q")
                    return True
                    
        except Exception as e:
            # Fallback auf einfachere Eingabe bei Fehlern
            pass
            
        return True

    def show_session_info(self):
        """Zeigt detaillierte Session-Informationen"""
        print("\n📋 DETAILIERTE SESSION-INFORMATIONEN:")
        
        if self.test_data['session_phases']:
            print("   Letzte 5 Lade-Phasen:")
            for phase in self.test_data['session_phases'][-5:]:
                timestamp = phase['timestamp'][11:19]
                print(f"      ⏰ {timestamp} - {phase['topic']}")
                if isinstance(phase['data'], dict):
                    for key, value in list(phase['data'].items())[:3]:
                        print(f"         {key}: {value}")
        else:
            print("   Keine Session-Informationen verfügbar")

    def show_cycle_report(self):
        """Zeigt Ladezyklen-Report"""
        print("\n🔋 LADEZYKLEN-REPORT:")
        
        if self.test_data['charging_cycles']:
            for i, cycle in enumerate(self.test_data['charging_cycles'], 1):
                print(f"   Zyklus {i}: {cycle['duration']:.1f}s")
                states_str = " → ".join(cycle['states'][-5:])  # Letzte 5 Zustände
                print(f"      Zustände: {states_str}")
        else:
            print("   Noch keine kompletten Ladezyklen erfasst")

    def show_error_report(self):
        """Zeigt Fehler-Report"""
        print("\n🚨 FEHLER-REPORT:")
        
        if self.test_data['errors_detected']:
            print(f"   Echte Fehler erkannt: {len(self.test_data['errors_detected'])}")
            for error in self.test_data['errors_detected'][-3:]:
                timestamp = error['timestamp'][11:19]
                print(f"   ⏰ {timestamp} - {error['topic']}")
        else:
            print("   ✅ Keine echten Fehler erkannt")

    def show_performance_report(self):
        """Zeigt Performance-Report"""
        duration = time.time() - self.test_data['start_time']
        msg_rate = self.test_data['message_count'] / duration if duration > 0 else 0
        
        print("\n⚡ PERFORMANCE-REPORT:")
        print(f"   Laufzeit: {int(duration)} Sekunden")
        print(f"   Nachrichten: {self.test_data['message_count']}")
        print(f"   Nachrichten/Sekunde: {msg_rate:.2f}")
        print(f"   Zustandsänderungen: {len(self.test_data['state_changes'])}")
        print(f"   Ladezyklen: {len(self.test_data['charging_cycles'])}")
        
        # Bewertung
        if msg_rate > 50:
            rating = "🔴 SEHR HOHE AKTIVITÄT"
        elif msg_rate > 20:
            rating = "🟢 OPTIMALE AKTIVITÄT"
        elif msg_rate > 10:
            rating = "🟡 NORMALE AKTIVITÄT"
        else:
            rating = "⚪ GERINGE AKTIVITÄT"
            
        print(f"   BEWERTUNG: {rating}")

    def run_interactive_test(self):
        """Hauptfunktion für interaktiven Test"""
        print("🎬 STARTE INTERAKTIVEN EVEREST TEST")
        print("=" * 60)
        
        # Terminal für nicht-blockierende Eingabe einrichten
        self.setup_terminal()
        
        # Systemstatus prüfen
        if not self.check_system_status():
            print("❌ System nicht bereit - Test abgebrochen")
            self.restore_terminal()
            return False
        
        # MQTT Listener starten
        if not self.start_mqtt_listener():
            print("❌ MQTT Listener konnte nicht gestartet werden")
            self.restore_terminal()
            return False
        
        self.test_data['start_time'] = time.time()
        
        # Benutzer-Informationen anzeigen
        self.user_interaction_menu()
        
        print("\n🟢 TEST LÄUFT... Führe jetzt Aktionen in Node-RED UI durch!")
        print("   Tipp: Drücke ENTER für aktuelle Statistiken")
        print("   Tipp: Eingaben werden sofort erkannt (kein Enter nötig außer für Statistiken)")
        
        # Haupt-Loop
        last_stat_time = time.time()
        try:
            while self.is_running:
                # Alle 30 Sekunden automatisch Statistiken anzeigen
                current_time = time.time()
                if current_time - last_stat_time >= 30:
                    self.print_real_time_stats()
                    last_stat_time = current_time
                
                # Auf Benutzereingabe prüfen
                if not self.wait_for_user_input():
                    break
                    
                time.sleep(0.05)  # Kürzere Pause für bessere Reaktionszeit
                
        except KeyboardInterrupt:
            print("\n🛑 Test durch Benutzer abgebrochen")
        except Exception as e:
            print(f"\n💥 Unerwarteter Fehler: {e}")
        finally:
            # Test beenden und Terminal wiederherstellen
            self.client.loop_stop()
            self.restore_terminal()
            self.generate_final_report()
        
        return True

    def generate_final_report(self):
        """Generiert Abschluss-Report"""
        duration = time.time() - self.test_data['start_time']
        
        print("\n" + "="*60)
        print("🎓 ABSCHLUSSREPORT - INTERAKTIVER TEST")
        print("="*60)
        
        print(f"📈 TESTSTATISTIKEN:")
        print(f"   Gesamtdauer: {int(duration)} Sekunden")
        print(f"   Empfangene Nachrichten: {self.test_data['message_count']}")
        print(f"   Durchschnittliche Nachrichten/Sekunde: {self.test_data['message_count']/duration:.2f}")
        print(f"   Erfasste Zustandsänderungen: {len(self.test_data['state_changes'])}")
        print(f"   Echte Fehler erkannt: {len(self.test_data['errors_detected'])}")
        print(f"   Dokumentierte Lade-Phasen: {len(self.test_data['session_phases'])}")
        print(f"   Komplette Ladezyklen: {len(self.test_data['charging_cycles'])}")
        
        if self.test_data['charging_cycles']:
            print(f"\n🔋 LADEZYKLEN-ANALYSE:")
            total_cycle_time = sum(cycle['duration'] for cycle in self.test_data['charging_cycles'])
            avg_cycle_time = total_cycle_time / len(self.test_data['charging_cycles'])
            print(f"   Durchschnittliche Zyklusdauer: {avg_cycle_time:.1f}s")
            print(f"   Gesamte Ladezeit: {total_cycle_time:.1f}s")
        
        print(f"\n🎯 TESTBEWERTUNG:")
        
        # Bewertungskriterien
        criteria = {
            "Nachrichtenfluss": self.test_data['message_count'] > 100,
            "Zustandsänderungen": len(self.test_data['state_changes']) > 5,
            "Ladezyklen erfasst": len(self.test_data['charging_cycles']) > 0,
            "Fehlererkennung": len(self.test_data['errors_detected']) == 0
        }
        
        passed = sum(criteria.values())
        total = len(criteria)
        
        for criterion, met in criteria.items():
            status = "✅" if met else "❌"
            print(f"   {status} {criterion}")
        
        print(f"\n📊 ERGEBNIS: {passed}/{total} Kriterien erfüllt")
        
        if passed == total:
            print("🏆 AUSGEZEICHNET - System funktioniert einwandfrei!")
        elif passed >= total * 0.7:
            print("✅ GUT - System zeigt erwartetes Verhalten")
        else:
            print("⚠️  EINGESCHRÄNKT - Überprüfe Systemkonfiguration")

def main():
    """Hauptfunktion"""
    tester = InteractiveEverestTester()
    
    try:
        success = tester.run_interactive_test()
        if success:
            print("\n🎉 Test erfolgreich abgeschlossen!")
        else:
            print("\n❌ Test mit Problemen abgeschlossen")
            
    except Exception as e:
        print(f"\n💥 Unerwarteter Fehler: {e}")
        return 1
        
    return 0

if __name__ == "__main__":
    exit(main())