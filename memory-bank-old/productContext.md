# Product Context: RainFow BD

## Target Audience
1. **International B2B Buyers**: Global businesses and importers sourcing verified physical products, raw materials, or manufactured goods from Bangladeshi factories and suppliers.
2. **Bangladeshi Entrepreneurs**: Local businesses, creators, and merchants looking to expand their footprint online, build e-commerce web applications, and sell locally or abroad.

## Core User Flows
1. **Product Browse & Cart Flow**:
   - User browses `index.html` or `products.html` → filters by category or search query → inspects product details on `product.html` → adds items to cart (`localStorage.rainfow_cart`) → reviews items on `cart.html` → generates WhatsApp order inquiry (`wa.me`) or completes checkout.
2. **Services & Business Solutions Flow**:
   - User visits `services.html` → interacts with the bilingual 30-second Business Discovery Survey (persisted in `localStorage.rainfow_survey`) → explores the 6 core services via accordion cards → reviews the step-by-step process → fills out the inquiry form or clicks service-specific inquiry buttons to prefill the WhatsApp message → connects instantly with RainFow support via WhatsApp.

## Bilingual Requirement (Services Page)
- Every visible string on `services.html` includes `data-en` and `data-bn` attributes.
- Language toggle persists user preference in `localStorage.rainfow_lang` ('en' or 'bn').
- Fonts: Inter (English) and Noto Sans Bengali (Bengali) loaded via Google Fonts.

## Survey Persistence
- Discovery survey answers on `services.html` are tracked across steps and stored in `localStorage.rainfow_survey` to remember user preferences for future visits or custom routing recommendations.
