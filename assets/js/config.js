/* ============================================
   RainFow — Config
   ============================================ */

window.RAINFOW_CONFIG = {
    // Formspree
    FORMSPREE_ID: "YOUR_FORM_ID_HERE",

    // Content JSON
    CONTENT_URL: "data/content.json",

    // WhatsApp
    WHATSAPP_NUMBER: "8801876757033",
    WHATSAPP_MESSAGE: "Hi RainFow! I'd like to discuss a project."
};

/* ============================================
   Supabase (public — safe to expose, RLS protects writes)
   ============================================ */
window.RAINFOW_SUPABASE = {
    url:     "https://yezuhifmbhwaumfodjev.supabase.co",
    anonKey: "sb_publishable_HPxgDCQNlyus_KegGKUwSQ_N95CFHL5"
};