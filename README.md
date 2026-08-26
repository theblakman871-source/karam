# Blendxo Cuts v2 – produktion

Detta är versionen för GitHub Pages + Supabase.

## Det som är klart
- Professionell svart/lila design och ny graffiti-inspirerad Blendxo-logga.
- Riktig Supabase Auth för admin. Demo-lösenordet är borttaget.
- Admin kan byta lösenord och begära återställningslänk.
- Tjänster/priser kan ändras i admin.
- Bilder kan laddas upp/bytas/raderas via Supabase Storage.
- Bokade tider hämtas centralt från databasen och försvinner från kundens lista.
- Databasen har ett atomärt unikt index: två personer kan inte boka samma datum + tid, även om de klickar samtidigt.
- Avbokad tid blir bokningsbar igen.
- Hook för mobilnotiser via Supabase Edge Function finns i frontend och kan senare kopplas till WhatsApp/SMS.

## Aktivera
1. Skapa ett Supabase-projekt.
2. Kör hela `supabase.sql` i SQL Editor.
3. Skapa adminanvändaren i Authentication > Users.
4. Kör sedan i SQL Editor: `insert into public.admin_users(user_id) select id from auth.users where email='DIN-ADMIN-EPOST';`
5. Stäng av offentlig sign-up i Supabase Auth så att bara barberaren har adminåtkomst.
6. Kopiera Project URL och Publishable/anon key till `supabase-config.js`. Lägg aldrig service_role eller andra hemliga nycklar på GitHub.
7. Ladda upp filerna till GitHub och publicera via GitHub Pages.

## WhatsApp/SMS
`app.js` anropar Edge Function `notify-booking` efter lyckad bokning. Den ska innehålla leverantörens hemliga nycklar som Supabase Secrets, aldrig i GitHub Pages. Vi kan koppla Meta WhatsApp Cloud API eller en SMS-leverantör i nästa steg.
