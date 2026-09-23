/* =========================================================
   RainFow — supabase-client.js
   Loads @supabase/supabase-js from jsdelivr and exposes
   window.RAINFOW_DB (the initialized client).
   ========================================================= */
(function () {
  'use strict';

  const cfg = window.RAINFOW_SUPABASE || {};

  if (!cfg.url || !cfg.anonKey) {
    console.error('[supabase-client] Missing window.RAINFOW_SUPABASE config.');
    console.error('[supabase-client] Got:', cfg);
    window.RAINFOW_DB = null;
    window.RAINFOW_DB_READY = Promise.resolve(null);
    return;
  }

  console.log('[supabase-client] Initializing with URL:', cfg.url);

  // jsdelivr is more reliable than esm.sh behind some networks
  window.RAINFOW_DB_READY = import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
    .then(({ createClient }) => {
      const client = createClient(cfg.url, cfg.anonKey, {
        auth: { persistSession: false }   // public site: no auth
      });
      window.RAINFOW_DB = client;
      console.log('[supabase-client] Client ready.');
      return client;
    })
    .catch(err => {
      console.error('[supabase-client] Failed to load Supabase JS:', err);
      window.RAINFOW_DB = null;
      return null;
    });
})();