# GlowUp Salon — Booking Website

A complete starter for a salon booking website with:
- Modern HTML/CSS/JS front end
- Node.js + Express backend
- JSON file storage (no database needed)
- Availability check + booking endpoint
- Optional email notifications (via SMTP)

## Quick Start

```bash
# 1) Extract and enter the folder
cd salon-booking

# 2) Install dependencies
npm install

# 3) Run the server
npm start
# Open http://localhost:3000
```

> For auto-reload during development:
```bash
npm run dev
```

## Project Structure

```
salon-booking/
  public/
    index.html
    styles.css
    app.js
  data/
    bookings.json           # auto-created
  server.js
  package.json
  .env.example
  README.md
```

## API

- `POST /api/availability` — body: `{ date, time, staff }` → `{ ok, available }`
- `POST /api/bookings` — body: `{ name, phone, email?, service, staff, date, time, notes? }` → `{ ok, booking }`
- `GET  /api/bookings` — returns all bookings

## Enable Email Notifications (optional)

1. Copy `.env.example` → `.env` and fill values:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_TO=your_email@gmail.com
```
2. Restart the server. When a booking is created, you’ll receive an email summary.

> For Gmail, create an **App Password** under Google Account → Security → 2‑Step Verification → App passwords.

## Deploy Notes

- On **Render/Heroku/Railway**, set the same env vars, build runs `npm i`, start runs `npm start`.
- Serve static files from `/public` (already configured), so the site works on a single server.

## Change Services/Staff

Edit the `<select>` options in `public/index.html`:
```html
<select name="service">
  <!-- add/remove options here -->
</select>
<select name="staff">
  <!-- add/remove staff here -->
</select>
```

Enjoy! ✂️
