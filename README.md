# Buildex Admin

Buildex.uz internet-do‘koni uchun admin panel.

**Stack:** React 19 · TypeScript · Vite · **Tailwind CSS v4** · **Ant Design v6** · TanStack Query · React Router · i18next  
**Backend:** Dommaster Admin API — https://api.buildex.uz/swagger/admin/

## Ishga tushirish

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
npm run typecheck    # tsc
npm run lint         # oxlint
npm run format       # prettier (+ tailwind class sorting)
```

Loyiha ildizida `.env` fayli kerak (git'ga kirmaydi, har kim o‘zi yaratadi):

```
VITE_API_URL=https://api.buildex.uz
```

`npm run dev` da so‘rovlar Vite proxy orqali (`/api` → `VITE_API_URL`) o‘tadi — lokalda CORS muammo yo‘q.
Production build to‘g‘ridan-to‘g‘ri `VITE_API_URL` ga murojaat qiladi (admin domeni backend CORS ro‘yxatida bo‘lishi kerak).

## Arxitektura (feature-based)

```
src/
├─ app/                      # ilovani yig‘ish: entry, provider'lar, router, antd theme
│  ├─ main.tsx
│  ├─ providers.tsx          # StyleProvider(layer) → ConfigProvider(theme, locale) → antd App → React Query → Router → Auth
│  └─ router.tsx             # lazy sahifalar + "tez orada" route'lar
│
├─ theme/                    # brand ranglari va shriftlar — yagona manba
│  ├─ colors.ts              # brand + tailwindColors
│  ├─ fonts.ts
│  ├─ antd.ts                # antd ConfigProvider theme + modalStyles
│  └─ tokens.css             # GENERATSIYA (vite/theme-tokens.ts) — Tailwind @theme, qo‘lda tahrirlanmaydi
│
├─ shared/                   # hech bir feature'ga bog‘liq bo‘lmagan qayta ishlatiladigan kod
│  ├─ api/                   # http client (JWT, token refresh, xatolar), session, umumiy tiplar
│  ├─ config/env.ts
│  ├─ i18n/                  # i18next + til ro‘yxati (antd/dayjs locale bilan), locales/uz|ru.ts
│  ├─ lib/                   # format, csv, hotkey, debounce, clsx, localized (uz/ru/en maydonlar)
│  └─ ui/                    # Logo, LanguageSwitcher, RecordsTable, EditorDrawer, LangTabs, LocalizedField,
│                            # RichTextEditor, ImageField, StatCard, WidgetCard
│
├─ features/                 # biznes modullar — har biri o‘z api / model / hooks / components ga ega
│  ├─ auth/
│  │  ├─ api/auth.api.ts     # login, me
│  │  ├─ model/              # AuthProvider, useAuth, tiplar
│  │  ├─ components/         # LoginForm, RequireAuth
│  │  └─ index.ts            # public API — tashqaridan faqat shu orqali import qilinadi
│  ├─ products/ attributes/ categories/ brands/ badges/ models/ partner-brands/
│  ├─ dashboard/ today/ banners/ publications/ ad-blocks/ push/
│  │                         # orders bilan bir xil tuzilma (api / model / hooks / lib / components)
│  └─ orders/
│     ├─ api/                # orders.api.ts, DTO tiplar, mapper'lar (API ↔ UI), query-keys
│     ├─ model/              # domen tiplari, konstantalar (statuslar, tablar, ranglar)
│     ├─ hooks/              # React Query hook'lari, URL'dagi ro‘yxat holati, export
│     ├─ lib/                # CSV export
│     ├─ components/
│     │  ├─ list/            # Toolbar, StatusTabs, FilterPanel, Table, BulkActionsBar
│     │  └─ order-modal/     # OrderModal va uning bloklari (Items, Progress, Customer, Fulfillment, Payment)
│     └─ index.ts
│
├─ layouts/admin/            # AdminLayout: Sidebar (desktop sider / mobil drawer), Header, GlobalSearch, UserMenu, navigation
└─ pages/                    # route sahifalari — feature komponentlarini yig‘adi, o‘zida biznes mantiq yo‘q
```

### Qoidalar

- **Qatlamlar:** `pages → layouts → features → shared`. Pastki qatlam yuqoridagisini import qilmaydi;
  feature'lar bir-birining ichiga emas, faqat `index.ts` (public API) orqali murojaat qiladi.
- **API ↔ UI ajratilgan:** komponentlar backend DTO'larini ko‘rmaydi. Hamma moslashtirish `*.mappers.ts` da
  (statuslar `0..4` → `"new" | "assembling" …`, `payment_type` + `payment_method` → `PayType` va h.k.).
- **Server holati — React Query:** kesh, loading/error, `keepPreviousData`, mutatsiyadan keyin invalidatsiya.
  Kalitlar bitta joyda — `query-keys.ts`.
- **Ro‘yxat holati URL'da:** tab, filtrlar, qidiruv, sahifa, saralash (`useOrderListState`) — havolani ulashish va
  qayta yuklashda saqlanadi.
- **Stil:** layout va mayda stil — Tailwind; tayyor komponentlar — Ant Design. antd stillari `@layer antd` da,
  shuning uchun Tailwind utility'lari doim ustun (`index.css`). Brand ranglari bir marta —
  `theme/colors.ts` da; antd (`theme/antd.ts`) va Tailwind (`theme/tokens.css`, generatsiya) shundan oladi.
  `colors.ts` o‘zgargach `npm run dev` ni qayta ishga tushiring.
- **i18n:** admin interfeysi uz / ru (kontent maydonlari — uz / ru / en); `Translation` tipi barcha tillarda kalitlar bir xilligini tekshiradi. antd va dayjs
  locale'lari til bilan birga almashadi.

## Ulangan endpointlar

| Joy                      | Endpoint                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------- |
| Login / profil / refresh | `POST /admin/auth/login/` · `GET /admin/auth/me/` · `POST /admin/auth/token/refresh/` |
| Buyurtmalar ro‘yxati     | `GET /admin/orders/` — filtr, qidiruv, saralash, pagination server tomonda            |
| Tab va sidebar raqamlari | `GET /admin/orders/stats/`                                                            |
| Buyurtma                 | `GET /admin/orders/{id}/` · `PATCH /admin/orders/{id}/` (`status`, `payment_status`)  |
| Mijoz (modalda)          | `GET /admin/customers/{id}/`                                                          |
| Filial filtri            | `GET /admin/branches/`                                                                |

Boshqa bo‘limlarning endpointlari o‘z feature'larining `api/*.api.ts` faylida: `products`, `categories`,
`brands`, `badges` (`product-badges`), `attributes`, `models`, `partner-brands`, `banners`, `dashboard`, `today`,
`publications` (`news`, `articles`, `videos`), `ad-blocks` (`adds-brands`), `push` (`notifications`).

Hali backendi yo‘q (sidebarda "Tez orada"): Bog‘lanmagan SKU, Moderatsiya, Bosh sahifa, Sahifalar, Media kutubxona,
Sozlamalar, shuningdek Push'dagi "Avtomatik (buyurtma holati)" tabi.
