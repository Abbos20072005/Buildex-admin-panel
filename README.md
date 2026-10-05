# Buildex Admin

Buildex.uz internet-doâ€˜koni uchun admin panel.

**Stack:** React 19 Â· TypeScript Â· Vite Â· **Tailwind CSS v4** Â· **Ant Design v6** Â· TanStack Query Â· React Router Â· i18next  
**Backend:** Dommaster Admin API â€” https://api.buildex.uz/swagger/admin/

## Ishga tushirish

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build â†’ dist/
npm run typecheck    # tsc
npm run lint         # oxlint
npm run format       # prettier (+ tailwind class sorting)
```

Loyiha ildizida `.env` fayli kerak (git'ga kirmaydi, har kim oâ€˜zi yaratadi):

```
VITE_API_URL=https://api.buildex.uz
```

`npm run dev` da soâ€˜rovlar Vite proxy orqali (`/api` â†’ `VITE_API_URL`) oâ€˜tadi â€” lokalda CORS muammo yoâ€˜q.
Production build toâ€˜gâ€˜ridan-toâ€˜gâ€˜ri `VITE_API_URL` ga murojaat qiladi (admin domeni backend CORS roâ€˜yxatida boâ€˜lishi kerak).

## Arxitektura (feature-based)

```
src/
â”œâ”€ app/                      # ilovani yigâ€˜ish: entry, provider'lar, router, antd theme
â”‚  â”œâ”€ main.tsx
â”‚  â”œâ”€ providers.tsx          # StyleProvider(layer) â†’ ConfigProvider(theme, locale) â†’ antd App â†’ React Query â†’ Router â†’ Auth
â”‚  â””â”€ router.tsx             # lazy sahifalar + "tez orada" route'lar
â”‚
â”œâ”€ theme/                    # brand ranglari va shriftlar â€” yagona manba
â”‚  â”œâ”€ colors.ts              # brand + tailwindColors
â”‚  â”œâ”€ fonts.ts
â”‚  â”œâ”€ antd.ts                # antd ConfigProvider theme + modalStyles
â”‚  â””â”€ tokens.css             # GENERATSIYA (vite/theme-tokens.ts) â€” Tailwind @theme, qoâ€˜lda tahrirlanmaydi
â”‚
â”œâ”€ shared/                   # hech bir feature'ga bogâ€˜liq boâ€˜lmagan qayta ishlatiladigan kod
â”‚  â”œâ”€ api/                   # http client (JWT, token refresh, xatolar), session, umumiy tiplar
â”‚  â”œâ”€ config/env.ts
â”‚  â”œâ”€ i18n/                  # i18next + til roâ€˜yxati (antd/dayjs locale bilan), locales/uz|ru.ts
â”‚  â”œâ”€ lib/                   # format, csv, hotkey, debounce, clsx, localized (uz/ru/en maydonlar)
â”‚  â””â”€ ui/                    # Logo, LanguageSwitcher, RecordsTable, EditorDrawer, LangTabs, LocalizedField,
â”‚                            # RichTextEditor, ImageField, StatCard, WidgetCard
â”‚
â”œâ”€ features/                 # biznes modullar â€” har biri oâ€˜z api / model / hooks / components ga ega
â”‚  â”œâ”€ auth/
â”‚  â”‚  â”œâ”€ api/auth.api.ts     # login, me
â”‚  â”‚  â”œâ”€ model/              # AuthProvider, useAuth, tiplar
â”‚  â”‚  â”œâ”€ components/         # LoginForm, RequireAuth
â”‚  â”‚  â””â”€ index.ts            # public API â€” tashqaridan faqat shu orqali import qilinadi
â”‚  â”œâ”€ products/ attributes/ categories/ brands/ badges/ models/ partner-brands/
â”‚  â”œâ”€ dashboard/ today/ banners/ publications/ ad-blocks/ push/ customers/ managers/
â”‚  â”‚                         # orders bilan bir xil tuzilma (api / model / hooks / lib / components)
â”‚  â””â”€ orders/
â”‚     â”œâ”€ api/                # orders.api.ts, DTO tiplar, mapper'lar (API â†” UI), query-keys
â”‚     â”œâ”€ model/              # domen tiplari, konstantalar (statuslar, tablar, ranglar)
â”‚     â”œâ”€ hooks/              # React Query hook'lari, URL'dagi roâ€˜yxat holati, export
â”‚     â”œâ”€ lib/                # CSV export
â”‚     â”œâ”€ components/
â”‚     â”‚  â”œâ”€ list/            # Toolbar, StatusTabs, FilterPanel, Table, BulkActionsBar
â”‚     â”‚  â””â”€ order-modal/     # OrderModal va uning bloklari (Items, Progress, Customer, Fulfillment, Payment)
â”‚     â””â”€ index.ts
â”‚
â”œâ”€ layouts/admin/            # AdminLayout: Sidebar (desktop sider / mobil drawer), Header, GlobalSearch, UserMenu, navigation
â””â”€ pages/                    # route sahifalari â€” feature komponentlarini yigâ€˜adi, oâ€˜zida biznes mantiq yoâ€˜q
```

### Qoidalar

- **Qatlamlar:** `pages â†’ layouts â†’ features â†’ shared`. Pastki qatlam yuqoridagisini import qilmaydi;
  feature'lar bir-birining ichiga emas, faqat `index.ts` (public API) orqali murojaat qiladi.
- **API â†” UI ajratilgan:** komponentlar backend DTO'larini koâ€˜rmaydi. Hamma moslashtirish `*.mappers.ts` da
  (statuslar `0..4` â†’ `"new" | "assembling" â€¦`, `payment_type` + `payment_method` â†’ `PayType` va h.k.).
- **Server holati â€” React Query:** kesh, loading/error, `keepPreviousData`, mutatsiyadan keyin invalidatsiya.
  Kalitlar bitta joyda â€” `query-keys.ts`.
- **Roâ€˜yxat holati URL'da:** tab, filtrlar, qidiruv, sahifa, saralash (`useOrderListState`) â€” havolani ulashish va
  qayta yuklashda saqlanadi.
- **Stil:** layout va mayda stil â€” Tailwind; tayyor komponentlar â€” Ant Design. antd stillari `@layer antd` da,
  shuning uchun Tailwind utility'lari doim ustun (`index.css`). Brand ranglari bir marta â€”
  `theme/colors.ts` da; antd (`theme/antd.ts`) va Tailwind (`theme/tokens.css`, generatsiya) shundan oladi.
  `colors.ts` oâ€˜zgargach `npm run dev` ni qayta ishga tushiring.
- **i18n:** admin interfeysi uz / ru (kontent maydonlari â€” uz / ru / en); `Translation` tipi barcha tillarda kalitlar bir xilligini tekshiradi. antd va dayjs
  locale'lari til bilan birga almashadi.

## Ulangan endpointlar

| Joy                      | Endpoint                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------- |
| Login / profil / refresh | `POST /admin/auth/login/` Â· `GET /admin/auth/me/` Â· `POST /admin/auth/token/refresh/` |
| Buyurtmalar roâ€˜yxati   | `GET /admin/orders/` â€” filtr, qidiruv, saralash, pagination server tomonda            |
| Tab va sidebar raqamlari | `GET /admin/orders/stats/`                                                              |
| Buyurtma                 | `GET /admin/orders/{id}/` Â· `PATCH /admin/orders/{id}/` (`status`, `payment_status`)   |
| Mijoz (modalda)          | `GET /admin/customers/{id}/`                                                            |
| Filial filtri            | `GET /admin/branches/`                                                                  |

Boshqa boâ€˜limlarning endpointlari oâ€˜z feature'larining `api/*.api.ts` faylida: `products`, `categories`,
`brands`, `badges` (`product-badges`), `attributes`, `models`, `partner-brands`, `banners`, `dashboard`, `today`,
`publications` (`news`, `articles`, `videos`), `ad-blocks` (`adds-brands`), `push` (`notifications`).

Hali backendi yoâ€˜q (sidebarda "Tez orada"): Bogâ€˜lanmagan SKU, Moderatsiya, Bosh sahifa, Sahifalar, Media kutubxona,
Sozlamalar, shuningdek Push'dagi "Avtomatik (buyurtma holati)" tabi.
