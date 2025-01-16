# Formilon - Formular-Management-System

Ein Next.js-System zur Erstellung und Verwaltung von Formularen mit erweiterten Funktionen wie Übersetzungen, Analysen und anpassbaren Designs.

## Systemvoraussetzungen

- Node.js (v18 oder höher)
- PostgreSQL (v14 oder höher)
- npm Paketmanager

## Umgebungseinrichtung

1. Erstellen Sie eine `.env` Datei im Hauptverzeichnis:
   - Kopieren Sie `.env.example` zu `.env`
   - Passen Sie die Werte entsprechend Ihrer Umgebung an

```env
# Beispiel für lokale Entwicklung
DATABASE_URL="postgresql://username:password@localhost:5432/formilon"
NEXTAUTH_URL="http://localhost:3000"
```

## Installationsschritte

1. Repository klonen:

```bash
git clone <repository-url>
cd formilon
```

2. Abhängigkeiten installieren:

```bash
npm install
```

3. Datenbank einrichten:

```bash
npm run setup-db
```

Dieser Befehl wird:

- Die Datenbankverbindung überprüfen
- Notwendige Tabellen erstellen
- Beispieldaten einfügen

4. Entwicklungsserver starten:

```bash
npm run dev
```

Die Anwendung ist dann unter `http://localhost:3000` verfügbar.

## Demo-Zugangsdaten

Nach der Installation können Sie sich mit folgenden Zugangsdaten einloggen:

- E-Mail: demo@formilon.de
- Passwort: demo123

## Verfügbare Skripte

- `npm run dev` - Entwicklungsserver starten
- `npm run build` - Produktionsversion erstellen
- `npm run start` - Produktionsserver starten
- `npm run setup-db` - Datenbank einrichten und Beispieldaten laden
- `npm run lint` - Code-Qualität prüfen

## Funktionen

- Formularerstellung und -verwaltung
- Verschiedene Fragetypen
- Echtzeit-Formularvorschau
- Formularanalysen und Ergebnisvisualisierung
- Mehrsprachenunterstützung
- Anpassbare Designs
- Benutzerauthentifizierung
- Responsives Design

## Projektstruktur

```
formilon/
├── prisma/              # Datenbankschema und Migrationen
├── public/              # Statische Dateien
├── src/
│   ├── components/      # React-Komponenten
│   ├── hooks/           # Benutzerdefinierte React-Hooks
│   ├── pages/           # Next.js-Seiten
│   ├── styles/          # Globale Styles
│   └── types/           # TypeScript-Typdefinitionen
├── scripts/             # Hilfsskripte
└── tests/               # Testdateien
```

## Datenbank-Schema

Die Anwendung verwendet Prisma ORM mit PostgreSQL. Die Hauptentitäten sind:

- Benutzer (Users)
- Formulare (Forms)
- Fragen (Questions)
- Einreichungen (Submissions)
- Antworten (Answers)

## Fehlerbehebung

Häufige Probleme und Lösungen:

1. Datenbankverbindungsprobleme:

   - Überprüfen Sie, ob PostgreSQL läuft
   - Überprüfen Sie die DATABASE_URL in der .env
   - Stellen Sie sicher, dass der Datenbankbenutzer die erforderlichen Rechte hat
   - Führen Sie `npm run setup-db` aus, um die Datenbank neu einzurichten

2. Build-Fehler:

   - .next-Verzeichnis löschen: `rm -rf .next`
   - node_modules löschen und neu installieren: `rm -rf node_modules && npm install`

3. Prisma-Fehler:
   - Prisma-Client neu generieren: `npx prisma generate`
   - Datenbank zurücksetzen: `npx prisma migrate reset`

## Kontakt und Support

Bei Fragen oder Problemen wenden Sie sich bitte an:
[Ihre Kontaktinformationen]
