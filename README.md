# 🚗 PRAVA.UZ — Haydovchilik Guvohnomasi (Prava) Imtihon Tizimi

O'zbekiston Respublikasi Yo'l Harakati Qoidalari (YHQ) bo'yicha haydovchilik guvohnomasini (prava) olish uchun zamonaviy, to'liq funksional imtihon va tayyorgarlik platformasi.

---

## 🏛 Texnologiyalar Steki

### **Backend:**
- **Node.js** & **Express.js** — REST API server (Port: 5050)
- **PostgreSQL** — Ishonchli relyatsion ma'lumotlar bazasi
- **Knex.js** — SQL query builder va migratsiyalar / seed boshqaruvi
- **Bcrypt.js** — 4 xonali PIN parollarni xavfsiz heshlash
- **JSON Web Token (JWT)** — Xavfsiz sessiya va token avtorizatsiyasi
- **Multer** — Savollarning yo'l belgilari va chorraha rasmlarini yuklash (`/uploads`)

### **Frontend:**
- **Vite** + **React 19** — Yuqori tezlikdagi zamonaviy frontend (Port: 3000)
- **Tailwind CSS v4** — Dark mode va premium avtomaktab uslubidagi dizayn
- **Lucide React** — Chiroyli vektor piktogrammalar
- **Canvas-Confetti** — Imtihondan muvaffaqiyatli o'tganda animatsion tabrik
- **React Router Dom v7** — Talaba va alohida mustaqil Admin paneli marshrutlari

---

## 🔒 1. Alohida va Yashirin Admin Panel

- **Oddiy saytdan (Navbar, Footer, Profil) admin panelga hech qanday havola yoki tugma mavjud emas!**
- Talaba yoki tashrif buyuruvchi saytda admin borligini ko'rmaydi.
- Admin panelga kirish faqat brauzer manzil qatoriga (URL) qo'lda **`/admin`** yoki **`/admin/login`** yozish orqali amalga oshiriladi.
- Admin Panel mustaqil **`AdminLayout`** ga ega bo'lib, oddiy sayt navbar/footerlaridan butunlay ajratilgan.

---

## 📑 2. Haqiqiy Dashboard va Ochilib-Yopiladigan Sidebar

- Zamonaviy **ochilib-yopiladigan (collapsible) saydbar**:
  - Kengaytirilgan (expanded) holatda to'liq menyu, piktogrammalar, sarlavha va admin ma'lumotlari ko'rinadi.
  - Yopilgan (collapsed) holatda ixcham piktogrammali mini-saydbar rejimiga o'tadi.
  - Foydalanuvchining saydbar holati `localStorage` da saqlanib qoladi.
- **Admin Dashboard imkoniyatlari:**
  - 📊 **Savollar soni** — Bazadagi barcha umumiy savollar soni.
  - 👥 **Studentlar soni** — Ro'yxatdan o'tgan talabalar soni.
  - 📑 **Biletlar to'plami** — Biletlar va test guruhlari soni.
  - 📈 **O'tish ko'rsatkichi** — Topshirilgan testlar va foizlar monitoringi.

---

## 🎯 3. Savollar Turadigan Testlar (Biletlar Tizimi)

- **Savollar guruhlangan holda Biletlarda (Test to'plamlarida) saqlanadi.**
- **Muhim qoida ijrosi:**
  - Bitta savol xohlagancha testning ichiga joylashishi mumkin.
  - Lekin bitta testning ichida har doim **1 id dagi savoldan faqat bitta** bo'lishi shart (`UNIQUE(test_id, question_id)` orqali qat'iy kafolatlangan).
  - Admin testga savol biriktirganda, agar o'sha savol testda allaqachon mavjud bo'lsa, tizim uni rad etadi va ogohlantiradi.
- Admin istalgan biletga:
  - Bazadagi mavjud savollarni 1-click orqali biriktirishi mumkin.
  - Bilet ichidagi savollarni chiqarishi mumkin (savol bazadan o'chib ketmaydi).
  - Yangi bilet yaratishi yoki o'chirishi mumkin.

---

## ✏️ 4. Savollarni Qo'shish, Tahrirlash (Edit) va O'chirish

- **Yangi savol qo'shish:**
  - Multer orqali rasm yuklash (JPG, PNG, WEBP, SVG)
  - 2 dan 5 tagacha javob varianti (A, B, C, D, E)
  - Aynan 1 ta to'g'ri javobni tanlash
- **Savolni tahrirlash (Edit):**
  - Savol matni, tushuntirish va kategoriyani yangilash
  - Rasmini yangilash, almashtirish yoki butunlay o'chirish
  - Variantlar matnini o'zgartirish, variant qo'shish/o'chirish (2-5 ta) va to'g'ri javobni o'zgartirish.
- **Savolni o'chirish:**
  - Savol va unga tegishli variantlar, rasmlar xavfsiz o'chiriladi.

---

## 🧑‍🎓 5. Studentlar Uchun Biletlarni Tanlash va Tarix

- Student `/exam` sahifasiga kirganda, mavjud Biletlar ro'yxatini ko'radi:
  - Bilet nomi (masalan: *1-Bilet: Yo'l belgilari va chorrahalar*)
  - Savollar soni, vaqti va o'tish foizi
- Student istalgan biletni tanlab imtihon topshirishi mumkin.
- Imtihon topshirilgach, natija va aynan qaysi bilet topshirilgani (`test_title`) **talaba tarixiga yoziladi**.
- Talaba o'z tarixida barcha o'tgan biletlarini va qaysi savolga qanday javob berganini ko'rib chiqishi mumkin.

---

## 🔑 Dastlabki Sinov Hisoblari (Test Accounts)

### 👮‍♂️ Administrator:
- **Kirish URL:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login) *(Saytda hech qanday link yo'q, faqat URL ga yoziladi)*
- **Telefon:** `+998901234567`
- **PIN Parol:** `7777`

### 🧑‍🎓 Student:
- **Kirish URL:** [http://localhost:3000/login](http://localhost:3000/login)
- **Telefon:** `+998901112233`
- **PIN Parol:** `1234`
- *(Yoki `/register` sahifasida ism, +998 raqam va 4 xonali PIN bilan mustaqil ro'yxatdan o'tish mumkin).*
