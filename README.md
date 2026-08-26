# Karam Barber – komplett GitHub Pages-version

Detta paket är fristående. Du behöver inga filer från någon äldre version.

## Filer
- `index.html` – hela webbplatsens struktur
- `style.css` – all design och mobilanpassning
- `app.js` – bokning, WhatsApp, admin, tjänster, tider och export
- `config.js` – Supabase-konfiguration
- `database.js` – säker klientanslutning för att spara bokningar i Supabase
- `supabase-schema.sql` – databasens tabell, index och RLS-policy
- `404.html` – fallback för GitHub Pages
- `.gitignore` – filer som inte ska versionshanteras
- `README.md` – denna installationsguide

## Snabbstart utan databas
Ladda upp samtliga filer i repositoryts rot. Webbplatsen fungerar direkt med lokal lagring i webbläsaren och WhatsApp-flödet.

Standardlösenord för den lokala adminpanelen: `Karam2026!`
Byt lösenord direkt i Admin > Säkerhet.

## Koppla Supabase
1. Skapa/öppna ditt Supabase-projekt.
2. Öppna SQL Editor och kör hela `supabase-schema.sql`.
3. Öppna `config.js`.
4. Fyll i `SUPABASE_URL` och `SUPABASE_ANON_KEY` från Supabase Project Settings > API.
5. Ändra `USE_CLOUD_DATABASE` till `true`.
6. Commit/pusha `config.js` till GitHub.

ANVÄND INTE Supabase `service_role`-nyckeln i GitHub eller i webbläsaren. Anon-nyckeln är klientnyckeln och skyddas av Row Level Security-reglerna i SQL-filen.

När Supabase är aktiverat sparas nya bokningar både lokalt och i tabellen `bookings` innan/medan WhatsApp öppnas. Den publika besökaren kan skapa bokningar men får inte läsa databasen.

## WhatsApp
I adminpanelen anger du mottagarens nummer i internationellt format utan `+`, mellanslag eller bindestreck, exempelvis `46701234567`. Du kan använda ditt eget nummer under testet och sedan byta till salongens nummer.

## GitHub Pages
Repository > Settings > Pages > Deploy from a branch > `main` och `/ (root)`.
