# Smart Facility IoT

Ein System zur bedarfsgerechten Überwachung, Reinigung und Instandhaltung großer Gebäude (Büro-Campusse, Bahnhöfe, Flughäfen, Messegelände). Sensorik, Edge-Geräte, Reinigungsroboter und Backend arbeiten über definierte Protokolle zusammen und liefern dem Betriebspersonal eine einzige, konsolidierte Steuerungsoberfläche.

Die Geräteebene (Sensoren, ESP32, Roboter) ist im aktuellen Stand in Software simuliert, um die vollständige Datenverarbeitungs- und Entscheidungslogik ohne physische Hardware nachvollziehbar zu machen. Die Kommunikationsstruktur ist so entworfen, dass reale Geräte ohne Änderung der übrigen Logik eingebunden werden können.

## Inhalt

1. [Grundidee](#1-grundidee)
2. [Technologie-Kombination](#2-technologie-kombination)
3. [Kommunikationsprotokolle im Detail](#3-kommunikationsprotokolle-im-detail)
4. [Admin-Anwendung — Funktionsumfang](#4-admin-anwendung--funktionsumfang)
5. [Melde-Anwendung für Nutzer](#5-melde-anwendung-für-nutzer)
6. [Entscheidungslogik](#6-entscheidungslogik)
7. [Umweltnutzen](#7-umweltnutzen)
8. [Projektstand](#8-projektstand)

---

## 1. Grundidee

Reinigung und Kontrolle großer Anlagen erfolgen üblicherweise nach festem Zeitplan, unabhängig von der tatsächlichen Nutzung einer Zone. Dieses System ersetzt den Zeitplan durch drei kombinierte Datenquellen:

- **Sensordaten** (Bewegung je Zone)
- **Füllstandsdaten** (Mülleimer)
- **Nutzermeldungen** (Verschmutzung, Defekte, gemeldet direkt vor Ort)

Aus diesen drei Quellen wird je Zone eine Priorität berechnet. Auf dieser Grundlage entscheidet das System selbstständig, ob ein Reinigungsroboter entsendet oder Personal benachrichtigt wird.

## 2. Technologie-Kombination

Das System verbindet mehrere Technologieebenen, die jeweils eine klar abgegrenzte Aufgabe übernehmen:

| Ebene | Technologie | Aufgabe |
|---|---|---|
| Sensorik | Bewegungssensor (PIR/mmWave), Ultraschall-Füllstandssensor | Rohdaten erfassen |
| Edge-Gerät | ESP32 | Sensordaten auslesen, lokal vorverarbeiten, übertragen |
| Gateway | Raspberry Pi | Daten empfangen, persistieren, auswerten, Aktionen auslösen |
| Nachrichtenvermittlung | MQTT-Broker | Verteilung der Nachrichten zwischen Geräten, Backend und Robotern |
| Persistenz | PostgreSQL (Neon) | Speicherung von Messwerten, Meldungen, Zustandsverlauf |
| Backend/Logik | Node.js (Next.js API-Routen) | Prioritätsberechnung, Disposition, Schnittstelle zur Datenbank |
| Frontend Admin | Next.js (App Router), React, TypeScript, Canvas | Kartendarstellung, Live-Steuerung |
| Frontend Meldung | Next.js, responsives Web-Formular | QR-Code-basierte Meldeerfassung |
| Mobilfunkanbindung (optional) | NB-IoT, LTE-M | Übertragung an Standorten ohne WLAN-Abdeckung |

Der Raspberry Pi ist der zentrale Knotenpunkt: Er ist gleichzeitig Empfänger der Sensordaten, Absender der Robotik-Befehle und Datenquelle für das Dashboard. Anzeige und Aktion laufen parallel — eine Entscheidung (z. B. Roboterentsendung) wartet nicht darauf, dass sie zuerst im Dashboard sichtbar gemacht wurde.

## 3. Kommunikationsprotokolle im Detail

```
Sensor ──(GPIO / I2C)──► ESP32 ──(MQTT via WLAN/BLE)──► Raspberry Pi
                                                             │
                        ┌────────────────────────────────────┼───────────────────┐
                        ▼                                    ▼                   ▼
                Datenbank (SQL/TLS)                  Roboter (MQTT)      Personal (HTTPS Push)
                        │
                        ▼
              Admin-Dashboard (HTTPS/WebSocket)
```

| Strecke | Protokoll | Nutzdaten |
|---|---|---|
| Sensor → ESP32 | GPIO, I2C | Rohmesswert |
| ESP32 → Raspberry Pi | MQTT über WLAN, alternativ BLE | Telemetrie (JSON) |
| Raspberry Pi → Datenbank | SQL über TLS | Messwerte, Meldungen |
| Raspberry Pi → Roboter | MQTT | Auftrag (Zielzone, Aufgabentyp) |
| Roboter → Raspberry Pi | MQTT | Status, Akkustand, Position |
| Raspberry Pi → Personal | HTTPS (Push) | Benachrichtigung mit Standort |
| Melde-App → Backend | HTTPS (REST) | Meldung (Standort, Problemtyp) |
| Admin-Dashboard ↔ Backend | HTTPS, WebSocket | Live-Zustand, Steuerbefehle |
| Ohne lokale Netzabdeckung | NB-IoT, LTE-M | Telemetrie/Befehl über Mobilfunk |

**MQTT-Topic-Struktur** (hierarchisch nach Standort, erlaubt selektives Abonnieren auch bei sehr vielen Geräten):

```
{anlage}/{zone}/verkehr             Telemetrie Bewegungssensor
{anlage}/{zone}/muelleimer/{id}     Telemetrie Füllstand
{anlage}/{zone}/meldung             Nutzermeldung
{anlage}/roboter/{id}/befehl        Auftrag an Roboter
{anlage}/roboter/{id}/status        Statusmeldung des Roboters
{anlage}/personal/benachrichtigung  Benachrichtigung an Personal
```

Transportverschlüsselung durchgängig über TLS (MQTT Port 8883, HTTPS). Geräteauthentifizierung über Zugangsdaten bzw. Client-Zertifikate je Gerät; Topic-Berechtigungen beschränken jedes Gerät auf seine eigenen Kanäle.

## 4. Admin-Anwendung — Funktionsumfang

Die Admin-Oberfläche ist die zentrale Steuerungsansicht für Betriebspersonal und Disponenten. Sie ist in folgende Bereiche gegliedert:

**Live-Grundrisskarte**
Kartendarstellung der gesamten Anlage, gegliedert nach Terminal/Gebäudeteil und Etage. Über Filter lassen sich einzelne Datenebenen unabhängig ein- und ausblenden:
- Heatmap (Verkehrsaufkommen je Zone)
- Sensorstatus (aktiv/kein Signal)
- Prioritätsstufe je Zone (kritisch, hoch, mittel, niedrig)
- Mülleimer-Füllstand
- Roboterposition in Echtzeit

**Roboterflotte**
Übersicht aller Roboter mit Akkustand, Status (angedockt, unterwegs, im Einsatz, lädt), aktueller Aufgabe und Tagesstatistik (Anzahl Einsätze, zurückgelegte Strecke). Jeder Roboter ist einzeln zwischen zwei Betriebsarten umschaltbar:
- **Automatik** — Disposition erfolgt selbstständig auf Grundlage der Zonenpriorität
- **Manuell** — der Disponent wählt eine Zone direkt auf der Karte aus, der Roboter wird gezielt dorthin geschickt

**Mülleimer-Verwaltung**
Liste aller Mülleimer, sortiert nach Füllstand, mit Unterscheidung zwischen unkritischen und kritischen Behältern. Direkte Aktionen: als geleert markieren, oder gezielte Abholung anfordern (löst automatisch eine Roboterdisposition zur jeweiligen Zone aus).

**Meldungsübersicht**
Alle über die Melde-App eingegangenen Meldungen mit Standort, Problemtyp, Dringlichkeit und Bearbeitungsstatus. Meldungen lassen sich als bearbeitet markieren und fließen in die Prioritätsberechnung der jeweiligen Zone ein.

**Personalübersicht**
Status des eingesetzten Personals (aktiv, unterwegs, in Pause), aktuelle Aufgabe, Effizienzkennzahl und durchschnittliche Reaktionszeit — Grundlage für die Beurteilung, wo Personal effizient eingesetzt ist und wo zusätzliche Automatisierung sinnvoll wäre.

**Kennzahlenleiste**
Laufende Übersicht über kritische Zonen, Zonen mit hoher Priorität, volle Mülleimer, aktive Roboter und die Anzahl vermiedener Reinigungsfahrten seit Systemstart.

## 5. Melde-Anwendung für Nutzer

Eine zweite, eigenständige Anwendung für Besucher und Mitarbeitende vor Ort, ohne Installation nutzbar:

1. An jeder Zone ist ein QR-Code angebracht.
2. Scannen öffnet die Melde-App direkt im Browser, mit dem Standort der Zone bereits vorausgewählt.
3. Auswahl des Problemtyps aus einer festen Liste (Verschmutzung, Geruch, Defekt, Mülleimer voll, Sonstiges).
4. Optionale Freitextbeschreibung.
5. Nach dem Absenden wird die Meldung sofort der Prioritätsberechnung der Zone zugeführt und erscheint im Admin-Dashboard.

Die Melde-App erfordert keine Anmeldung und erfasst keine personenbezogenen Daten der meldenden Person.

## 6. Entscheidungslogik

Je Zone wird die Priorität aus drei Faktoren berechnet: aktuelles Verkehrsaufkommen, Füllstand der zugehörigen Mülleimer, offene Nutzermeldungen. Überschreitet die Priorität einen Schwellenwert, ermittelt das Backend den nächstgelegenen verfügbaren Roboter im Automatikmodus (Standort, Akkustand, aktueller Status) und sendet den Auftrag über MQTT. Roboter im manuellen Modus bleiben von der automatischen Disposition ausgenommen und werden ausschließlich durch den Disponenten gesteuert.

## 7. Umweltnutzen

Der bedarfsgerechte statt zeitplanbasierte Einsatz wirkt sich direkt auf den Ressourcenverbrauch aus:

- Weniger Reinigungsfahrten durch gezielte statt pauschale Zonenkontrolle
- Geringerer Wasser- und Reinigungsmittelverbrauch durch Vermeidung unnötiger Reinigungsvorgänge
- Geringerer Energieverbrauch der Roboter durch effizientere Routenplanung
- Weniger Kontrollgänge des Personals durch gezielte Mülleimer-Benachrichtigung statt pauschaler Prüfung

Die Kennzahl „vermiedene Reinigungsfahrten" wird im Dashboard laufend erfasst.

## 8. Projektstand

Sensoren, Sensorknoten und Roboter sind aktuell durch eine tickbasierte Simulationsengine ersetzt. Prioritätsberechnung, Disposition, Admin-Anwendung und Melde-App entsprechen der in diesem Dokument beschriebenen Zielarchitektur. Die Anbindung realer Geräte erfordert den Austausch der Simulation durch MQTT-Clients auf Geräte- und Backend-Seite; die übrige Systemlogik bleibt unverändert.

Demo-Version: *(Link folgt nach Hosting)*
