(function () {
  const cfg = window.KARAM_CONFIG || {};
  const configured = Boolean(
    cfg.USE_CLOUD_DATABASE &&
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    window.supabase
  );
  const client = configured
    ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)
    : null;

  async function insertBooking(booking) {
    if (!client) return { ok: false, skipped: true, reason: 'cloud-disabled' };
    const row = {
      client_id: booking.id,
      customer_name: booking.name,
      customer_phone: booking.phone,
      service_id: booking.serviceId,
      service_name: booking.serviceName,
      price: Number(booking.price || 0),
      barber: booking.barber,
      booking_date: booking.date,
      booking_time: booking.time,
      note: booking.note || '',
      status: booking.status || 'Skickad till WhatsApp',
      created_at: booking.createdAt || new Date().toISOString()
    };
    const { error } = await client.from('bookings').insert(row);
    if (error) {
      console.warn('KaramDB: bokningen kunde inte sparas i Supabase.', error.message);
      return { ok: false, error };
    }
    return { ok: true };
  }

  async function listBookings() {
    if (!client) return { ok: false, skipped: true, data: [] };
    const { data, error } = await client
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    return error ? { ok: false, error, data: [] } : { ok: true, data: data || [] };
  }

  window.KaramDB = {
    configured,
    client,
    insertBooking,
    listBookings
  };
})();
