# Mijozlar sahifasi: backend bilan holat

Backend mijozlar API'sini tayyorladi (2026-10-28), admin panel unga ulandi. Hammasi `/api/v1/admin/` ostida.

## Ulangan

- `GET customers/`: `registration_channel`, `last_order_at`, `returns_count`, `segment`, `tags`, `language`, `last_login_platform`, `active_devices`; filtrlar `registration_channel`, `segment`, `tag`, `orders_min/max`, `purchase_min/max`, `last_order_from/to`, `has_returns`, `is_deleted`; qidiruv ism, telefon, email va buyurtma raqami (`#28598`) bo'yicha.
- `GET customers/stats/`: `ordered_30d`, `deleted`.
- `PATCH customers/<id>/`: `segment`, `tags`, `language`, `email`.
- Telefon ro'yxatda va kartada maskalangan; to'liq raqam `POST customers/<id>/reveal-phone/` bilan (jurnalga yoziladi).
- Ichki izohlar: `GET/POST customers/<id>/notes/`, `DELETE customers/<id>/notes/<note_id>/` (muallif yoki superadmin, boshqasiga 403).
- Jurnal: `GET customers/<id>/activity/` (deploydan boshlanadi; undan oldingi rol o'zgarishlari `role-history/` dan qo'shiladi).
- `POST customers/<id>/logout-all/`: barcha qurilmalardan chiqarish.
- `DELETE customers/<id>/`: yumshoq o'chirish (`is_deleted`), "O'chirilgan" tabi `?is_deleted=true` bilan.
- Manzil: `recipient_name`, `recipient_phone` (bo'sh bo'lsa mijozning o'zi ko'rsatiladi).

## Admin panelda qanday ko'rsatiladi

- **Qaytarishlar:** qaytarish modeli yo'q, shuning uchun KPI va tab mijozning bekor qilingan buyurtmalarini (`status=4`, `returns_count`) ko'rsatadi: `GET orders/?customer=<id>&status=4`.
- **Murojaatlar:** tiket tizimi yo'q, tab mijozning chatlarini ko'rsatadi: `GET chats/?customer=<id>`.

## Hali backend'da yo'q

- Rozilik (push / sms / email): saqlanmaydi, kartochka "Backend kutilmoqda" bo'lib turadi (`CUSTOMER_API.consents` bayrog'i `src/features/customers/model/capabilities.ts` da).
- Qaytarishlar modeli (`/returns/`) va tiketlar (`/tickets/`): reja bo'lsa, shunda alohida ulanadi.
