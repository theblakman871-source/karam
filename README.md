# Blendxo Cuts

Professionell GitHub Pages-kompatibel barberarsida med bokning och adminpanel.

## Demo nu
Öppna `index.html`. Admin finns på `admin.html`.
Demo-login: `admin@blendxo.se` / `blendxo`.
I demo sparas bokningar, priser och uppladdade bilder i webbläsarens localStorage.

## Produktion – rekommenderad arkitektur
- Frontend: GitHub Pages.
- Backend/databas/auth/storage: Supabase.
- Mobilnotis: Supabase Edge Function → Telegram (kan bytas till e-post/SMS).
- Bilder: Supabase Storage, redigeras från adminpanelen.

## Aktivera Supabase
1. Skapa ett Supabase-projekt.
2. Kör `supabase.sql` i SQL Editor.
3. Skapa Storage bucket `site-images` och gör den publik för läsning. Ge authenticated-användare rätt att ladda upp/radera.
4. Skapa admin-användaren under Authentication → Users.
5. Fyll `supabaseUrl` och `supabaseAnonKey` i `supabase-config.js`, sätt `mode: 'supabase'`.
6. Deploya Edge Function `notify-booking` och lägg secrets `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`.
7. Push hela mappen till GitHub och aktivera Pages i repository-inställningarna.

## Viktigt
Lägg aldrig service-role-nyckel, Telegram-token eller andra hemligheter i GitHub Pages. Endast Supabase anon key får ligga i frontend tillsammans med korrekt RLS.
