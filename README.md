# HIRUYAN EVENT PLATFORM

Modern Event Management System built with **Laravel, SQLite, Tailwind CSS, and Leaflet Maps**.

The platform allows organizers to create and manage events, attendees to register and receive QR tickets, and administrators to manage the entire website through a dynamic CMS without editing code.

---

## 🌍 Live Features

- Public event marketplace
- Organizer dashboard
- Attendee dashboard
- Super Admin dashboard
- Dynamic CMS
- Ticketing system
- QR code check-in
- Interactive maps
- Notifications
- Analytics
- Responsive design
- Dark / Light mode

---

# 🚀 Tech Stack

- **Backend:** Laravel 12+
- **Frontend:** Blade + Tailwind CSS + Alpine.js
- **Database:** SQLite
- **Maps:** Leaflet + OpenStreetMap
- **Build Tool:** Vite
- **Authentication:** Laravel Breeze / Jetstream
- **QR Codes:** Simple QR Code package
- **Deployment:** Vercel

---

# 👥 User Roles

## Super Admin

- Full platform control
- Dynamic CMS
- User management
- Organizer approval
- Event management
- Analytics
- Payments
- Website settings
- SEO settings
- Notifications
- Backup & restore

## Organizer

- Create events
- Edit events
- Manage tickets
- Manage attendees
- QR check-in
- Analytics
- Revenue tracking
- Send announcements

## Attendee

- Browse events
- Register for events
- Purchase tickets
- Download PDF tickets
- View QR codes
- Favorite events
- Manage profile
- Receive notifications

---

# 🛠️ Dynamic CMS

The Super Admin can change **all website content without touching code**:

- Homepage sections
- Hero banner
- About section
- Statistics counters
- Featured events
- Testimonials
- Sponsors
- FAQ
- Contact information
- Footer links
- Social media links
- SEO settings
- Colors and branding
- Logo and favicon

All changes are published instantly from the admin panel.

---

# 📍 Contact Information

**Hiruyan Event Platform**  
Adisketema, Dire Dawa, Ethiopia

- 📞 Phone: +251978760949
- 📧 Email: hiruyaninfo@gmail.com
- 💬 WhatsApp: https://wa.me/251978760949
- 📸 Instagram: https://instagram.com/hiruyan-event-organizer
- ✈️ Telegram: https://t.me/hiruyan
- 🎵 TikTok: https://www.tiktok.com/@hiruyan

All links are clickable and open the appropriate application on mobile and desktop devices.

---

# ✨ Key Features

## Event Management

- Public, private, and hybrid events
- Recurring events
- Multiple ticket types
- Capacity management
- Registration deadlines
- Event galleries
- Rich text descriptions

## Map & Location

- Address search
- Interactive map
- Draggable marker
- Latitude/longitude storage
- Google Maps navigation

## Ticketing

- Free and paid tickets
- QR code generation
- PDF ticket download
- Email delivery

## Check-In

- QR scanner
- Manual check-in
- Duplicate prevention
- Attendance tracking

## Communication

- Contact Admin form
- Attendee ↔ Organizer messaging
- Cancellation requests
- Event inquiries

## Notifications

- Registration confirmation
- Ticket issued
- Event reminder
- Event updates
- Organizer announcements
- Password reset

---

# 🖼️ Gender-Based Avatar System

During registration users select:

- Male
- Female
- Prefer not to say

The system automatically assigns a matching default avatar, which can later be replaced with a custom profile photo.

---

# 📊 Analytics

### Admin Analytics

- Total users
- Total organizers
- Total attendees
- Total events
- Total registrations
- Total revenue
- Growth charts

### Organizer Analytics

- Ticket sales
- Attendance rate
- Revenue
- Popular events

---

# 🔐 Security

- CSRF protection
- XSS protection
- SQL injection prevention
- Rate limiting
- Secure file uploads
- Role-based access control
- Audit logs
- Password hashing

---

# 📱 Responsive Design

The platform is optimized for:

- Desktop
- Tablet
- Mobile

Includes smooth navigation, skeleton loaders, toast notifications, and accessible UI components.

---

# 📂 Installation

## 1. Clone Repository

```bash
git clone https://github.com/your-username/hiruyan-event-platform.git
cd hiruyan-event-platform
```

## 2. Install PHP Dependencies

```bash
composer install
```

## 3. Install Node Dependencies

```bash
npm install
```

## 4. Copy Environment File

```bash
cp .env.example .env
```

## 5. Generate Application Key

```bash
php artisan key:generate
```

## 6. Configure SQLite

Create the database file:

```bash
touch database/database.sqlite
```

Update `.env`:

```env
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database/database.sqlite
```

## 7. Run Migrations

```bash
php artisan migrate
```

## 8. Seed Default Admin

```bash
php artisan db:seed
```

## 9. Start Development Server

```bash
php artisan serve
```

## 10. Start Vite

```bash
npm run dev
```

Open: `http://127.0.0.1:8000`

---

# 🔑 Default Admin Account

```text
Email: admin@hiruyan.com
Password: ChangeMe123!
```

⚠️ Change the password immediately after first login.

---

# 📁 Project Structure

```text
app/
bootstrap/
config/
database/
public/
resources/
routes/
storage/
tests/
```

---

# 🌐 Deployment on Vercel

## Build Command

```bash
npm run build
```

## Environment Variables

Set in Vercel dashboard:

- APP_NAME
- APP_ENV
- APP_KEY
- APP_URL
- DB_CONNECTION=sqlite
- DB_DATABASE=/tmp/database.sqlite

Include a proper `vercel.json` configuration for Laravel deployment.

---

# 🧪 Testing

Run tests:

```bash
php artisan test
```

---

# 📜 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Developed By

**Abenezer Samson Zewdu**  
Software Engineering Student – Dire Dawa University

For support or collaboration:

📧 **hiruyaninfo@gmail.com**

---

# ⭐ Support

If you like this project, please **star the repository on GitHub** and share it with others.
