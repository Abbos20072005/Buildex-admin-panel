# Mijozlar sahifasi: backend'dan kerak bo'lganlar

Admin panelda «Mijozlar» ro'yxati va mijoz sahifasi (`/customers/:id`) dizayn bo'yicha qurildi.
Swagger (`/schema/admin/`) bilan solishtirildi. Quyidagilar **hozir backend'da yo'q**, shuning uchun
frontend'da ular o'chirilgan holatda («Backend kutilmoqda» deb ko'rinadi). Tayyor bo'lgach frontend'da
`src/features/customers/model/capabilities.ts` ichida tegishli bayroqni `true` qilish kifoya.

Hammasi `/api/v1/admin/` ostida. Sana va vaqt — ISO 8601.

## Hozir ishlayotganlar (o'zgartirish shart emas)

`GET /customers/` (search, role, is_blocked, is_active, verified, has_orders, from_created, to_created),
`GET /customers/stats/`, `GET /customers/{id}/` (manzillar bilan), `PATCH /customers/{id}/`,
`POST /customers/{id}/role/`, `GET /customers/{id}/role-history/`, `GET /orders/?customer=`,
`GET /orders/stats/?customer=`, `GET /chats/?customer=`.

## 1. Ro'yxat va mijoz javobiga yangi maydonlar (`Customer`, `CustomerDetail`)

| Maydon | Tur | Nima uchun |
|---|---|---|
| `registration_channel` | `"site" \| "ios" \| "android"` | Ro'yxatdagi «Kanal» ustuni, «Ro'yxatdan o'tish kanali» filtri, mijoz sarlavhasi |
| `last_order_at` | datetime \| null | «Oxirgi buyurtma» ustuni va filtri |
| `returns_count` | integer | «Qaytarishlar» KPI va tab hisoblagichi |
| `segment` | `"regular" \| "big" \| "vip" \| null` | «Segment» kartochkasi, filtr |
| `tags` | string[] | «Teglar» |
| `language` | `"uz" \| "ru" \| "en"` | Profil → «Til» |
| `email` | string \| null | Profil → «Email» (hozir swagger'da yo'q) |
| `is_deleted` | boolean | «O'chirilgan» tab |
| `last_login_platform` | `"ios" \| "android" \| "site"` | Hisob → «Oxirgi kirish: sana · iOS» |
| `active_devices` | integer | Hisob → «Faol qurilmalar» |
| `consents` | `{ push, sms, email }`, har biri `{ enabled: bool, changed_at: datetime \| null }` | «Rozilik» kartochkasi (faqat o'qish: mijozning o'zi o'zgartiradi) |

`PATCH /customers/{id}/` quyidagilarni ham qabul qilsin: `segment`, `tags`, `email`, `language`.

`CustomerAddress` ga: `recipient_name` va `recipient_phone` (dizaynda manzil kartasida qabul qiluvchi ismi va
telefoni ko'rinadi; hozir frontend mijozning o'z ismi va telefonini ko'rsatib turibdi).

## Frontend'da nima «Backend kutilmoqda» deb turibdi

Quyidagi joylar hozir shu yozuv bilan turadi, ma'lumot kelgach o'zi to'ladi: «Buyurtma bergan (30 kun)» kartasi,
jadvaldagi «Kanal» va «Oxirgi buyurtma» ustunlari, mijoz sarlavhasidagi va «Hisob»dagi kanal, «Oxirgi kirish · platforma»,
«Faol qurilmalar», «Qaytarishlar» KPI va tabi, Email va Til, Segment/Teglar, Ichki izohlar, Rozilik, «O'chirilgan» tab,
filtrlar (Segment, Kanal, Buyurtmalar soni, Jami xarid, Oxirgi buyurtma sanasi, Qaytarishi bor) hamda murojaatlar
jadvalidagi Kanal / Buyurtma / Mas'ul ustunlari.

## 2. `GET /customers/` ga yangi filtrlar

`registration_channel` (`site`, `ios`, `android`; «Ilova» = `ios` + `android`, bir nechta qiymat qabul qilsin),
`segment`, `orders_min`, `orders_max`, `purchase_min`, `purchase_max`, `last_order_from`, `last_order_to`
(YYYY-MM-DD), `has_returns` (bool), `is_deleted` (bool).

Qidiruv (`search`) ism va telefondan tashqari **buyurtma raqami** (`#28598`) bo'yicha ham topsin.

Tartiblash: `ordering` ga `total_purchase`, `orders_count`, `last_order_at`, `created_at` qo'shilsin.

## 3. `GET /customers/stats/` ga yangi maydonlar

- `ordered_30d` — oxirgi 30 kunda buyurtma bergan mijozlar soni (karta: «Buyurtma bergan (30 kun)»);
- `deleted` — o'chirilgan mijozlar soni («O'chirilgan» tab hisoblagichi).

«Yangi (7 kun)» uchun yangi maydon shart emas: frontend uni `from_created` bilan o'zi sanaydi.

## 4. Ichki izohlar (xodimlar uchun, mijozga ko'rinmaydi)

- `GET /customers/{id}/notes/` — yangi izohlar birinchi: `{ id, author: { id, full_name }, text, created_at }`
- `POST /customers/{id}/notes/` — `{ text }`
- (ixtiyoriy) `DELETE /customers/{id}/notes/{note_id}/`

## 5. Qurilmalar

`POST /customers/{id}/logout-all/` — mijozning barcha qurilmalardagi sessiyalarini tugatadi
(refresh token'larni bekor qiladi, push token'larni o'chiradi). Javob: `204`.

## 6. Qaytarishlar

Admin API'da qaytarishlar umuman yo'q. Kerak: `GET /returns/?customer=<id>` (ro'yxat) va stats.
Mijoz sahifasidagi jadval: `{ id, number ("QR-0163"), order: { id }, created_at, amount, status }`.
Holatlar (dizayndan): «Ko'rib chiqilmoqda», va yakuniy holatlar. Statuslar ro'yxatini backend belgilaydi.

## 7. Murojaatlar (support tiketlari)

Hozir «Murojaatlar» tabi mijozning chatlarini ko'rsatadi (`/chats/?customer=`). Dizaynda esa tiket jadvali
bor: `MR-0420`, mavzu, kanal, buyurtma, holat (Yangi / Hal qilindi), mas'ul xodim, ochilgan vaqt.
Agar tiket tizimi rejada bo'lsa: `GET /tickets/?customer=<id>` —
`{ id, number, subject, channel, order: { id } \| null, status, assignee: { id, full_name } \| null, created_at }`.

## 8. Jurnal (audit)

Hozir «Jurnal» tabi faqat rol o'zgarishlarini (`role-history`) ko'rsatadi. Dizayndagi to'liq jurnal uchun:
`GET /customers/{id}/activity/` — `{ id, text, channel ("ios" \| "android" \| "site" \| "admin"), actor, created_at }`.
Misollar: «Hisob yaratildi, telefon SMS kod bilan tasdiqlandi», «Bloklandi», «Telefon ko'rsatildi».

## 9. Telefon raqamni ko'rsatish (maxfiylik)

Ro'yxatda va profilda raqam yashirin (`+998 90 *** ** 67`), «Ko'rsatish» bosilganda ochiladi. Hozir to'liq raqam
javobda keladi va yashirish faqat interfeysda. Tavsiya: to'liq raqamni faqat `POST /customers/{id}/reveal-phone/`
qaytarsin va u auditga yozilsin (kim, qachon ko'rgan).

## 10. Boshqa

- O'chirilgan mijoz: `DELETE` hozir qanday ishlashini aniqlashtiring (qattiq o'chirish yoki `is_deleted`).
  «O'chirilgan» tab ishlashi uchun yumshoq o'chirish (soft delete) kerak.
- `PATCH /customers/{id}/` `role` ni qabul qilmaydi (faqat `POST /role/`), shuning uchun yangi «PRO qilish» /
  «PROni bekor qilish» tugmalari `POST /role/` ni ishlatadi. Bu to'g'ri, o'zgartirish kerak emas.
