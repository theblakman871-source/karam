import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  const booking = await req.json();
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
  if (!botToken || !chatId) return new Response(JSON.stringify({ok:false, reason:'Telegram secrets missing'}), {status:200});
  const text = `✂️ NY BOKNING – BLENDXO CUTS\n\nNamn: ${booking.customer_name}\nTelefon: ${booking.phone}\nTjänst: ${booking.service_name}\nPris: ${booking.price} kr\nDatum: ${booking.booking_date}\nTid: ${booking.booking_time}${booking.note ? `\nKommentar: ${booking.note}` : ''}`;
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text})});
  return new Response(await res.text(), {headers:{'Content-Type':'application/json'}});
});
