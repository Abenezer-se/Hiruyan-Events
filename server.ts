import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { User, Event, TicketType, PaymentStatus, CheckInStatus, EventInquiry } from './src/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'hiruyan_secret_jwt_key_2026';
const PORT = 3000;

const app = express();

// Increase payload limit for base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads directory exists and serve static files
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Express Auth Middleware
export interface AuthRequest extends Request {
  user?: User;
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = db.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired user token' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token verification failed' });
  }
};

const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = db.getUserById(decoded.userId);
      if (user) req.user = user;
    } catch (e) {
      // Ignore token error for optional auth
    }
  }
  next();
};

const requireOrganizerOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'organizer' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Organizer or Administrator permissions required' });
  }
  next();
};

const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Super Admin permissions required' });
  }
  next();
};

// ==========================================
// 1. AUTHENTICATION & CMS PUBLIC API ROUTES
// ==========================================

// GET /api/cms - Public CMS Settings
app.get('/api/cms', (req: Request, res: Response) => {
  return res.json({ cms: db.getCmsSettings(), sponsors: db.getSponsors(), testimonials: db.getTestimonials(), faqs: db.getFaqs() });
});

// POST /api/contact-messages - Submit inquiry
app.post('/api/contact-messages', (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }
  const msg = db.addContactMessage({ name, email, phone: phone || '', subject: subject || 'General Inquiry', message });
  
  // Send notification to Admin users
  const adminUsers = db.getUsers().filter(u => u.role === 'admin');
  adminUsers.forEach(admin => {
    db.createNotification({
      userId: admin.id,
      title: 'New Contact Message 📩',
      message: `From ${name} (${email}): "${subject || 'General Inquiry'}"`,
      type: 'system',
      linkUrl: '/admin/marketing',
    });
  });
  console.log(`[EMAIL NOTIFICATION LOG] To Admin (${db.getCmsSettings().contactEmail}): New contact form submission from ${name} <${email}> regarding "${subject || 'General Inquiry'}"`);

  return res.status(201).json({ message: 'Message submitted successfully', msg });
});

// POST /api/newsletter/subscribe
app.post('/api/newsletter/subscribe', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const success = db.addNewsletterSubscriber(email);
  return res.json({ success, message: success ? 'Subscribed successfully' : 'Already subscribed' });
});

// POST /api/auth/register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName, role, gender, phoneNumber, address } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ error: 'Username, email, password, and full name are required' });
    }

    const existingUser = db.getUserWithHashByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const userRole = (role === 'organizer' || role === 'admin') ? role : 'attendee';
    const userGender = (gender === 'male' || gender === 'female') ? gender : 'prefer_not_to_say';

    const newUser = db.createUser({
      username,
      email: email.toLowerCase(),
      fullName,
      role: userRole,
      gender: userGender,
      status: 'active',
      passwordHash,
      phoneNumber: phoneNumber || '',
      address: address || '',
    });

    const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    // Send welcome notification
    db.createNotification({
      userId: newUser.id,
      title: 'Welcome to Hiruyan Event Platform! 🎉',
      message: `Hi ${fullName}, your account has been created. Explore upcoming events or manage your space!`,
      type: 'profile',
      linkUrl: '/dashboard',
    });

    return res.status(201).json({ user: newUser, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const fullUser = db.getUserWithHashByEmail(email);
    if (!fullUser) {
      db.addSecurityLog(email, 'login_failed', req.ip, req.headers['user-agent']);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (fullUser.status === 'suspended' || fullUser.status === 'banned') {
      db.addSecurityLog(email, 'account_suspended', req.ip, req.headers['user-agent']);
      return res.status(403).json({ error: `Your account is ${fullUser.status}. Please contact support.` });
    }

    const isMatch = bcrypt.compareSync(password, fullUser.passwordHash);
    if (!isMatch) {
      db.addSecurityLog(email, 'login_failed', req.ip, req.headers['user-agent']);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    db.addSecurityLog(email, 'login_success', req.ip, req.headers['user-agent']);

    const { passwordHash, ...user } = fullUser;
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ user, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
});

// PUT /api/auth/profile
app.put('/api/auth/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { username, fullName, email, phoneNumber, address, avatarUrl, gender, customAvatarUrl, restoreDefaultAvatar } = req.body;
    const userId = req.user!.id;

    if (email && email.toLowerCase() !== req.user!.email.toLowerCase()) {
      const existing = db.getUserWithHashByEmail(email);
      if (existing && existing.id !== userId) {
        return res.status(400).json({ error: 'Email is already in use by another user' });
      }
    }

    let updates: any = {
      ...(username && { username }),
      ...(fullName && { fullName }),
      ...(email && { email: email.toLowerCase() }),
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(address !== undefined && { address }),
      ...(gender && { gender }),
    };

    if (restoreDefaultAvatar) {
      updates.customAvatarUrl = '';
    } else if (customAvatarUrl !== undefined) {
      updates.customAvatarUrl = customAvatarUrl;
    } else if (avatarUrl !== undefined) {
      updates.customAvatarUrl = avatarUrl;
    }

    const updatedUser = db.updateUser(userId, updates);

    db.createNotification({
      userId,
      title: 'Profile Updated',
      message: 'Your profile details were updated successfully.',
      type: 'profile',
      linkUrl: '/dashboard/profile',
    });

    return res.json({ user: updatedUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Profile update failed' });
  }
});

// PUT /api/auth/change-password
app.put('/api/auth/change-password', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const fullUser = db.getUserByIdFull(userId);
    if (!fullUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = bcrypt.compareSync(currentPassword, fullUser.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password verification failed' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    db.updateUser(userId, { passwordHash });

    db.createNotification({
      userId,
      title: 'Security Alert: Password Changed',
      message: 'Your account password was updated. If you did not perform this change, please contact support.',
      type: 'password',
      linkUrl: '/dashboard/profile',
    });

    return res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Password change failed' });
  }
});

// ==========================================
// 2. CATEGORIES & UPLOAD ROUTES
// ==========================================

app.get('/api/categories', (req: Request, res: Response) => {
  return res.json({ categories: db.getCategories() });
});

app.post('/api/categories', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { name, icon, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const category = db.createCategory({ name, icon: icon || 'Calendar', description: description || '' });
    return res.status(201).json({ category });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Create category failed' });
  }
});

app.put('/api/categories/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { name, icon, description } = req.body;
    const category = db.updateCategory(req.params.id, { name, icon, description });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    return res.json({ category });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Update category failed' });
  }
});

app.delete('/api/categories/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const success = db.deleteCategory(req.params.id);
    if (!success) return res.status(404).json({ error: 'Category not found' });
    return res.json({ message: 'Category deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Delete category failed' });
  }
});

// POST /api/upload - Handle file / URL image uploads
app.post('/api/upload', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { base64Data, fileName } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'Base64 image data is required' });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid data URL format' });
    }

    const ext = matches[1].split('/')[1] || 'png';
    const buffer = Buffer.from(matches[2], 'base64');
    const safeName = `img-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(filePath, buffer);
    const fileUrl = `/uploads/${safeName}`;

    return res.json({ url: fileUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

// Geocoding Proxy (OpenStreetMap Nominatim)
app.get('/api/location/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.length < 2) {
      return res.json({ results: [] });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'HiruyanEventPlatform/1.0' },
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed with status ${response.status}`);
    }

    const data = await response.json();
    return res.json({ results: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Geocoding search failed' });
  }
});

app.get('/api/location/reverse', async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'HiruyanEventPlatform/1.0' },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed with status ${response.status}`);
    }

    const data = await response.json();
    return res.json({ result: data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Reverse geocoding failed' });
  }
});

// ==========================================
// 3. EVENT MANAGEMENT ROUTES
// ==========================================

// GET /api/events - Public list of published events with filters
app.get('/api/events', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const { search, category, dateRange, location, price, status, sortBy } = req.query;

    let events = db.getEvents();

    // Unless status parameter is explicitly requested by owner/admin, only return published events
    if (status) {
      events = events.filter(e => e.status === status);
    } else {
      events = events.filter(e => e.status === 'published');
    }

    // Filter by search text (title, venue, city, description)
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.venueName.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (category && typeof category === 'string' && category !== 'all') {
      events = events.filter(e => e.category.toLowerCase() === category.toLowerCase() || e.category === category);
    }

    // Filter by location (city or country)
    if (location && typeof location === 'string' && location.trim() !== '') {
      const loc = location.toLowerCase();
      events = events.filter(e => e.city.toLowerCase().includes(loc) || e.country.toLowerCase().includes(loc));
    }

    // Filter by price
    if (price === 'free') {
      events = events.filter(e => e.ticketTypes.some(t => t.price === 0));
    } else if (price === 'paid') {
      events = events.filter(e => e.ticketTypes.some(t => t.price > 0));
    }

    // Filter by date range
    const now = new Date();
    if (dateRange === 'today') {
      events = events.filter(e => new Date(e.startDate).toDateString() === now.toDateString());
    } else if (dateRange === 'this_week') {
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      events = events.filter(e => {
        const d = new Date(e.startDate);
        return d >= now && d <= nextWeek;
      });
    } else if (dateRange === 'this_month') {
      events = events.filter(e => {
        const d = new Date(e.startDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (dateRange === 'upcoming') {
      events = events.filter(e => new Date(e.endDate || e.startDate) >= now);
    } else if (dateRange === 'past') {
      events = events.filter(e => new Date(e.endDate || e.startDate) < now);
    }

    // Sorting
    if (sortBy === 'date_asc') {
      events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    } else if (sortBy === 'date_desc') {
      events.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    } else if (sortBy === 'name_asc') {
      events.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'popular') {
      events.sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0));
    } else {
      // Default: sort upcoming first
      events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }

    return res.json({ events });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Fetching events failed' });
  }
});

// GET /api/events/:idOrSlug
app.get('/api/events/:idOrSlug', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  let event = db.getEventById(idOrSlug);
  if (!event) {
    event = db.getEventBySlug(idOrSlug);
  }

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Increment views count
  db.updateEvent(event.id, { viewsCount: (event.viewsCount || 0) + 1 });

  return res.json({ event });
});

// POST /api/events - Create new event (Organizer/Admin)
app.post('/api/events', authenticateToken, requireOrganizerOrAdmin, (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      slug,
      description,
      category,
      tags,
      startDate,
      endDate,
      registrationDeadline,
      capacity,
      ticketTypes,
      coverImage,
      gallery,
      venueName,
      fullAddress,
      city,
      country,
      latitude,
      longitude,
      termsAndConditions,
      status,
    } = req.body;

    if (!title || !startDate || !endDate || !venueName || !city || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Title, start/end date, venue name, city, latitude, and longitude are required' });
    }

    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newEvent = db.createEvent({
      organizerId: req.user!.id,
      organizerName: req.user!.fullName,
      organizerAvatar: req.user!.avatarUrl,
      title,
      slug: `${generatedSlug}-${Date.now().toString(36)}`,
      description: description || '',
      category: category || 'General',
      tags: Array.isArray(tags) ? tags : [],
      startDate,
      endDate,
      registrationDeadline: registrationDeadline || startDate,
      capacity: Number(capacity) || 100,
      ticketTypes: Array.isArray(ticketTypes) && ticketTypes.length > 0 ? ticketTypes : [{ id: 'tkt-default', name: 'General Admission', price: 0, quantity: Number(capacity) || 100, soldCount: 0 }],
      coverImage: coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      gallery: Array.isArray(gallery) ? gallery : [],
      venueName,
      fullAddress: fullAddress || venueName,
      city,
      country: country || 'United States',
      latitude: Number(latitude),
      longitude: Number(longitude),
      termsAndConditions: termsAndConditions || '',
      status: status === 'draft' ? 'draft' : 'published',
    });

    db.createNotification({
      userId: req.user!.id,
      title: 'Event Created Successfully 🎯',
      message: `Your event "${title}" has been created as ${newEvent.status}.`,
      type: 'update',
      linkUrl: `/events/${newEvent.id}`,
    });

    return res.status(201).json({ event: newEvent });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Event creation failed' });
  }
});

// PUT /api/events/:id - Update event
app.put('/api/events/:id', authenticateToken, requireOrganizerOrAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existingEvent = db.getEventById(id);

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.organizerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'You can only edit your own events' });
    }

    const updatedEvent = db.updateEvent(id, req.body);
    return res.json({ event: updatedEvent });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Event update failed' });
  }
});

// POST /api/events/:id/duplicate - Duplicate event
app.post('/api/events/:id/duplicate', authenticateToken, requireOrganizerOrAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.getEventById(id);

    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existing.organizerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const duplicated = db.createEvent({
      ...existing,
      title: `${existing.title} (Copy)`,
      slug: `${existing.slug}-copy-${Date.now().toString(36)}`,
      status: 'draft',
      ticketTypes: existing.ticketTypes.map(t => ({ ...t, soldCount: 0 })),
    });

    return res.json({ event: duplicated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Duplication failed' });
  }
});

// DELETE /api/events/:id - Delete event
app.delete('/api/events/:id', authenticateToken, requireOrganizerOrAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.getEventById(id);

    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existing.organizerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    db.deleteEvent(id);
    return res.json({ message: 'Event deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Delete failed' });
  }
});

// GET /api/organizer/events - Get current user's created events
app.get('/api/organizer/events', authenticateToken, requireOrganizerOrAdmin, (req: AuthRequest, res: Response) => {
  try {
    const allEvents = db.getEvents();
    const myEvents = req.user!.role === 'admin' 
      ? allEvents 
      : allEvents.filter(e => e.organizerId === req.user!.id);
    return res.json({ events: myEvents });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Fetching organizer events failed' });
  }
});

// ==========================================
// 4. TICKET REGISTRATION & CHECK-IN API ROUTES
// ==========================================

// POST /api/registrations - Register / Purchase Ticket
app.post('/api/registrations', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, ticketTypeId, attendeeName, attendeeEmail, attendeePhone } = req.body;
    const userId = req.user!.id;

    if (!eventId || !ticketTypeId) {
      return res.status(400).json({ error: 'Event ID and ticket type are required' });
    }

    const event = db.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ error: 'This event is not open for registration' });
    }

    const ticketType = event.ticketTypes.find(t => t.id === ticketTypeId);
    if (!ticketType) {
      return res.status(404).json({ error: 'Invalid ticket type selected' });
    }

    if (ticketType.quantity > 0 && ticketType.soldCount >= ticketType.quantity) {
      return res.status(400).json({ error: 'Selected ticket type is sold out' });
    }

    if (event.capacity > 0 && (event.registeredCount || 0) >= event.capacity) {
      return res.status(400).json({ error: 'Event has reached maximum capacity' });
    }

    // Check duplicate active registration for the same event and ticket
    const existingRegs = db.getUserRegistrations(userId);
    const alreadyRegistered = existingRegs.find(r => r.eventId === eventId);
    if (alreadyRegistered) {
      return res.status(400).json({ error: 'You are already registered for this event. Check "My Tickets" in your dashboard.' });
    }

    const ticketNumber = `HIRU-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrPayload = JSON.stringify({
      tkt: ticketNumber,
      evt: event.id,
      usr: userId,
      name: attendeeName || req.user!.fullName,
    });

    // Generate real base64 QR Code image data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

    const registration = db.createRegistration({
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.startDate,
      eventVenue: event.venueName,
      eventCity: event.city,
      eventLatitude: event.latitude,
      eventLongitude: event.longitude,
      userId,
      userName: attendeeName || req.user!.fullName,
      userEmail: attendeeEmail || req.user!.email,
      userPhone: attendeePhone || req.user!.phoneNumber,
      ticketTypeId: ticketType.id,
      ticketTypeName: ticketType.name,
      ticketPrice: ticketType.price,
      paymentStatus: ticketType.price > 0 ? 'paid' : 'free',
      paymentId: ticketType.price > 0 ? `PAY-${Date.now()}` : undefined,
      checkInStatus: 'not_checked_in',
      qrCodeData: qrCodeDataUrl,
    });

    // Notification for Attendee
    db.createNotification({
      userId,
      title: 'Ticket Confirmed! 🎫',
      message: `You are registered for "${event.title}". View your ticket and directions in your dashboard.`,
      type: 'ticket',
      linkUrl: `/dashboard/tickets`,
    });

    // Notification for Event Organizer
    if (event.organizerId !== userId) {
      db.createNotification({
        userId: event.organizerId,
        title: 'New Event Registration 🎟️',
        message: `${attendeeName || req.user!.fullName} registered for "${event.title}".`,
        type: 'registration',
        linkUrl: `/dashboard/attendees?eventId=${event.id}`,
      });
    }

    return res.status(201).json({ registration });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// GET /api/registrations/my - Current user registered tickets
app.get('/api/registrations/my', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const regs = db.getUserRegistrations(req.user!.id);
    return res.json({ registrations: regs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Fetching tickets failed' });
  }
});

// GET /api/registrations/event/:eventId - Organizer event attendees
app.get('/api/registrations/event/:eventId', authenticateToken, requireOrganizerOrAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const event = db.getEventById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: You can only view attendees for your own events' });
    }

    const attendees = db.getEventRegistrations(eventId);
    return res.json({ attendees, event });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Fetching attendees failed' });
  }
});

// Check-in API: Manual
app.post('/api/checkin/manual', authenticateToken, requireOrganizerOrAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { registrationId, checkInStatus } = req.body;
    const registration = db.getRegistrationById(registrationId);

    if (!registration) {
      return res.status(404).json({ error: 'Registration ticket not found' });
    }

    const event = db.getEventById(registration.eventId);
    if (!event || (event.organizerId !== req.user!.id && req.user!.role !== 'admin')) {
      return res.status(403).json({ error: 'Unauthorized to manage check-in for this event' });
    }

    const newStatus: CheckInStatus = checkInStatus === 'checked_in' ? 'checked_in' : 'not_checked_in';
    const updated = db.updateRegistration(registrationId, {
      checkInStatus: newStatus,
      checkInTimestamp: newStatus === 'checked_in' ? new Date().toISOString() : undefined,
    });

    if (newStatus === 'checked_in') {
      db.createNotification({
        userId: registration.userId,
        title: 'Check-in Confirmed ✅',
        message: `Welcome to "${registration.eventTitle}"! You have been successfully checked in.`,
        type: 'checkin',
        linkUrl: '/dashboard/tickets',
      });
    }

    return res.json({ registration: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Check-in failed' });
  }
});

// Check-in API: QR Code scan
app.post('/api/checkin/qr', authenticateToken, requireOrganizerOrAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { qrCodeText, eventId } = req.body;
    if (!qrCodeText) {
      return res.status(400).json({ error: 'QR Code payload is required' });
    }

    let ticketNumber = qrCodeText.trim();
    // Check if JSON payload
    try {
      const parsed = JSON.parse(qrCodeText);
      if (parsed.tkt) ticketNumber = parsed.tkt;
    } catch (e) {
      // Plain text ticket number string
    }

    const reg = db.getRegistrationByTicketNumber(ticketNumber);
    if (!reg) {
      return res.status(404).json({ error: 'Invalid or unknown ticket code' });
    }

    if (eventId && reg.eventId !== eventId) {
      return res.status(400).json({ error: 'This ticket belongs to a different event' });
    }

    const event = db.getEventById(reg.eventId);
    if (!event || (event.organizerId !== req.user!.id && req.user!.role !== 'admin')) {
      return res.status(403).json({ error: 'Permission denied for this event ticket' });
    }

    if (reg.checkInStatus === 'checked_in') {
      return res.status(400).json({
        error: 'Ticket already checked in!',
        registration: reg,
        alreadyCheckedIn: true,
      });
    }

    const updated = db.updateRegistration(reg.id, {
      checkInStatus: 'checked_in',
      checkInTimestamp: new Date().toISOString(),
    });

    db.createNotification({
      userId: reg.userId,
      title: 'Ticket Checked-in Successfully ✅',
      message: `Your ticket #${reg.ticketNumber} for "${reg.eventTitle}" has been scanned and verified.`,
      type: 'checkin',
      linkUrl: '/dashboard/tickets',
    });

    return res.json({
      message: 'Check-in successful!',
      registration: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'QR Check-in failed' });
  }
});

// GET /api/checkin/stats/:eventId
app.get('/api/checkin/stats/:eventId', authenticateToken, requireOrganizerOrAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const event = db.getEventById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const attendees = db.getEventRegistrations(eventId);
    const checkedIn = attendees.filter(a => a.checkInStatus === 'checked_in');
    const totalReg = attendees.length;
    const remaining = Math.max(0, event.capacity - totalReg);
    const pct = totalReg > 0 ? Math.round((checkedIn.length / totalReg) * 100) : 0;

    return res.json({
      stats: {
        eventId,
        totalRegistered: totalReg,
        checkedInCount: checkedIn.length,
        remainingCapacity: remaining,
        checkInPercentage: pct,
        capacity: event.capacity,
      },
      recentCheckIns: checkedIn
        .sort((a, b) => new Date(b.checkInTimestamp || 0).getTime() - new Date(a.checkInTimestamp || 0).getTime())
        .slice(0, 10),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Stats calculation failed' });
  }
});

// ==========================================
// 5. NOTIFICATIONS & FAVORITES ROUTES
// ==========================================

app.get('/api/notifications', authenticateToken, (req: AuthRequest, res: Response) => {
  const notifs = db.getUserNotifications(req.user!.id);
  return res.json({ notifications: notifs });
});

app.put('/api/notifications/:id/read', authenticateToken, (req: AuthRequest, res: Response) => {
  const success = db.markNotificationRead(req.params.id, req.user!.id);
  return res.json({ success });
});

app.post('/api/notifications/read-all', authenticateToken, (req: AuthRequest, res: Response) => {
  db.markAllNotificationsRead(req.user!.id);
  return res.json({ success: true });
});

app.get('/api/favorites', authenticateToken, (req: AuthRequest, res: Response) => {
  const favIds = db.getUserFavorites(req.user!.id);
  const events = db.getEvents().filter(e => favIds.includes(e.id));
  return res.json({ favoriteIds: favIds, events });
});

app.post('/api/favorites/:eventId', authenticateToken, (req: AuthRequest, res: Response) => {
  const isFav = db.toggleFavorite(req.user!.id, req.params.eventId);
  return res.json({ isFavorite: isFav });
});

// ==========================================
// 6. SUPER ADMIN MANAGEMENT & CMS ENDPOINTS
// ==========================================

// GET /api/admin/stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const users = db.getUsers();
  const events = db.getEvents();
  const registrations = db.getRegistrations();
  const now = new Date();

  const totalUsers = users.length;
  const totalOrganizers = users.filter(u => u.role === 'organizer').length;
  const totalAttendees = users.filter(u => u.role === 'attendee').length;

  const totalEvents = events.length;
  const publishedEvents = events.filter(e => e.status === 'published').length;
  const draftEvents = events.filter(e => e.status === 'draft').length;
  const upcomingEvents = events.filter(e => new Date(e.startDate) >= now).length;
  const pastEvents = events.filter(e => new Date(e.endDate || e.startDate) < now).length;

  const totalRegistrations = registrations.length;
  const totalRevenue = registrations.reduce((sum, r) => sum + (r.ticketPrice || 0), 0);

  return res.json({
    stats: {
      totalUsers,
      totalOrganizers,
      totalAttendees,
      totalEvents,
      publishedEvents,
      draftEvents,
      upcomingEvents,
      pastEvents,
      totalRegistrations,
      totalTicketSales: totalRegistrations,
      totalRevenue,
      activeUsersToday: Math.max(1, Math.round(totalUsers * 0.6)),
      systemStatus: 'optimal',
    },
    recentRegistrations: registrations.slice(0, 5),
    recentAuditLogs: db.getAuditLogs().slice(0, 10),
  });
});

// GET & PUT /api/admin/cms
app.get('/api/admin/cms', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ cms: db.getCmsSettings() });
});

app.put('/api/admin/cms', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const updated = db.updateCmsSettings(req.body);
  db.addAuditLog(req.user!.id, req.user!.fullName, 'admin', 'CMS_UPDATED', 'Updated platform CMS content and settings');
  return res.json({ cms: updated });
});

// CONTACT MESSAGES MANAGEMENT
app.get('/api/admin/contact-messages', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ messages: db.getContactMessages() });
});

app.put('/api/admin/contact-messages/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { status, adminReply } = req.body;
  const updated = db.updateContactMessageStatus(req.params.id, status, adminReply);
  if (!updated) return res.status(404).json({ error: 'Message not found' });
  return res.json({ message: updated });
});

app.delete('/api/admin/contact-messages/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const success = db.deleteContactMessage(req.params.id);
  if (!success) return res.status(404).json({ error: 'Message not found' });
  return res.json({ success: true });
});

// PUBLIC PAGES & BLOG & ANNOUNCEMENTS
app.get('/api/pages', (req: Request, res: Response) => {
  const pages = db.getPages().filter(p => p.published);
  return res.json({ pages });
});

app.get('/api/pages/:slug', (req: Request, res: Response) => {
  const page = db.getPageBySlug(req.params.slug);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  return res.json({ page });
});

app.get('/api/admin/pages', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ pages: db.getPages() });
});

app.post('/api/admin/pages', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const page = db.savePage(req.body);
  return res.status(201).json({ page });
});

app.put('/api/admin/pages/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const page = db.savePage({ ...req.body, id: req.params.id });
  return res.json({ page });
});

app.delete('/api/admin/pages/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const success = db.deletePage(req.params.id);
  if (!success) return res.status(404).json({ error: 'Page not found' });
  return res.json({ success: true });
});

// BLOG ENDPOINTS
app.get('/api/blog', (req: Request, res: Response) => {
  const posts = db.getBlogPosts().filter(b => b.published);
  return res.json({ posts });
});

app.get('/api/blog/:slug', (req: Request, res: Response) => {
  const post = db.getBlogPostBySlug(req.params.slug);
  if (!post) return res.status(404).json({ error: 'Article not found' });
  return res.json({ post });
});

app.get('/api/admin/blog', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ posts: db.getBlogPosts() });
});

app.post('/api/admin/blog', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const post = db.saveBlogPost(req.body);
  return res.status(201).json({ post });
});

app.put('/api/admin/blog/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const post = db.saveBlogPost({ ...req.body, id: req.params.id });
  return res.json({ post });
});

app.delete('/api/admin/blog/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const success = db.deleteBlogPost(req.params.id);
  if (!success) return res.status(404).json({ error: 'Article not found' });
  return res.json({ success: true });
});

// ANNOUNCEMENTS ENDPOINTS
app.get('/api/announcements', (req: Request, res: Response) => {
  const active = db.getAnnouncements().filter(a => a.published);
  return res.json({ announcements: active });
});

app.get('/api/admin/announcements', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ announcements: db.getAnnouncements() });
});

app.post('/api/admin/announcements', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const ann = db.saveAnnouncement(req.body);
  return res.status(201).json({ announcement: ann });
});

app.put('/api/admin/announcements/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const ann = db.saveAnnouncement({ ...req.body, id: req.params.id });
  return res.json({ announcement: ann });
});

app.delete('/api/admin/announcements/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const success = db.deleteAnnouncement(req.params.id);
  if (!success) return res.status(404).json({ error: 'Announcement not found' });
  return res.json({ success: true });
});

// BACKUP & RESTORE
app.get('/api/admin/backup', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const jsonString = db.exportBackup();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="hiruyan-db-backup-${Date.now()}.json"`);
  return res.send(jsonString);
});

app.post('/api/admin/restore', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { backupJson } = req.body;
  if (!backupJson) return res.status(400).json({ error: 'backupJson payload is required' });
  const success = db.restoreBackup(typeof backupJson === 'string' ? backupJson : JSON.stringify(backupJson));
  if (!success) return res.status(400).json({ error: 'Restore failed. Invalid backup JSON schema.' });
  db.addAuditLog(req.user!.id, req.user!.fullName, 'admin', 'DB_RESTORED', 'Restored platform database from backup file');
  return res.json({ success: true, message: 'Database successfully restored from backup' });
});

// USER MANAGEMENT ENDPOINTS
app.get('/api/admin/users', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ users: db.getUsers() });
});

app.post('/api/admin/users', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password, fullName, role, gender, status } = req.body;
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ error: 'Username, email, password, and fullName are required' });
    }
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const user = db.createUser({
      username,
      email: email.toLowerCase(),
      fullName,
      role: role || 'attendee',
      gender: gender || 'prefer_not_to_say',
      status: status || 'active',
      passwordHash,
    });
    return res.status(201).json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Create user failed' });
  }
});

app.put('/api/admin/users/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updated = db.updateUser(id, req.body);
  if (!updated) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: updated });
});

app.put('/api/admin/users/:id/reset-password', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);
  db.updateUser(id, { passwordHash });
  db.addAuditLog(req.user!.id, req.user!.fullName, 'admin', 'RESET_USER_PASSWORD', `Reset password for user ID ${id}`);
  return res.json({ message: 'User password reset successfully' });
});

app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  if (req.params.id === req.user?.id) {
    return res.status(400).json({ error: 'You cannot delete your own active administrator account' });
  }
  const success = db.deleteUser(req.params.id);
  if (!success) return res.status(404).json({ error: 'User not found in database' });
  return res.json({ success: true, message: 'User account permanently deleted' });
});

// ADMIN SPONSORS
app.get('/api/admin/sponsors', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ sponsors: db.getSponsors() });
});
app.post('/api/admin/sponsors', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const sponsor = db.addSponsor(req.body);
  return res.status(201).json({ sponsor });
});
app.delete('/api/admin/sponsors/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const success = db.deleteSponsor(req.params.id);
  return res.json({ success });
});

// ADMIN TESTIMONIALS
app.get('/api/admin/testimonials', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ testimonials: db.getTestimonials() });
});
app.post('/api/admin/testimonials', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const testimonial = db.addTestimonial(req.body);
  return res.status(201).json({ testimonial });
});
app.delete('/api/admin/testimonials/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const success = db.deleteTestimonial(req.params.id);
  return res.json({ success });
});

// ADMIN FAQS
app.get('/api/admin/faqs', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ faqs: db.getFaqs() });
});
app.post('/api/admin/faqs', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const faq = db.addFaq(req.body);
  return res.status(201).json({ faq });
});
app.delete('/api/admin/faqs/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const success = db.deleteFaq(req.params.id);
  return res.json({ success });
});

// ADMIN CONTACT MESSAGES
app.get('/api/admin/contact-messages', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ messages: db.getContactMessages() });
});

app.put('/api/admin/contact-messages/:id/status', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, adminReply } = req.body;
  const updated = db.updateContactMessageStatus(id, status, adminReply);
  if (!updated) return res.status(404).json({ error: 'Contact message not found' });
  return res.json({ message: updated });
});

app.post('/api/admin/contact-messages/:id/reply', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { replyText } = req.body;
  if (!replyText) return res.status(400).json({ error: 'Reply text is required' });

  const updated = db.updateContactMessageStatus(id, 'replied', replyText);
  if (!updated) return res.status(404).json({ error: 'Contact message not found' });

  // If sender is a registered user, create in-app notification
  const targetUser = db.getUsers().find(u => u.email.toLowerCase() === updated.email.toLowerCase());
  if (targetUser) {
    db.createNotification({
      userId: targetUser.id,
      title: 'Reply from Hiruyan Support 📩',
      message: `Re: "${updated.subject}": ${replyText}`,
      type: 'system',
      linkUrl: '/contact',
    });
  }
  console.log(`[EMAIL NOTIFICATION LOG] To ${updated.email}: Support Reply to "${updated.subject}": "${replyText}"`);

  return res.json({ message: updated });
});

app.delete('/api/admin/contact-messages/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const success = db.deleteContactMessage(req.params.id);
  return res.json({ success });
});

// EVENT INQUIRIES & ORGANIZER COMMUNICATION ENDPOINTS
app.post('/api/events/:eventId/inquiries', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const { subject, message, type, attachmentUrl, attendeeName, attendeeEmail } = req.body;

    const event = db.getEventById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const name = req.user ? req.user.fullName : attendeeName;
    const email = req.user ? req.user.email : attendeeEmail;
    const attendeeId = req.user ? req.user.id : `guest-${Date.now()}`;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Name, email, subject, and message body are required' });
    }

    const inquiryType = type === 'cancellation_request' ? 'cancellation_request' : (type === 'organizer_ask' ? 'organizer_ask' : 'question');

    const inquiry = db.addEventInquiry({
      eventId: event.id,
      eventTitle: event.title,
      organizerId: event.organizerId,
      attendeeId,
      attendeeName: name,
      attendeeEmail: email,
      subject,
      message,
      attachmentUrl: attachmentUrl || '',
      type: inquiryType,
    });

    // Notify organizer in-app
    db.createNotification({
      userId: event.organizerId,
      title: inquiryType === 'cancellation_request' ? 'Cancellation Request Received ⚠️' : 'New Attendee Question 💬',
      message: `${name} sent a message regarding "${event.title}": "${subject}"`,
      type: 'event',
      linkUrl: '/dashboard/organizer/messages',
    });

    // Notify Super Admin as well
    const adminUsers = db.getUsers().filter(u => u.role === 'admin');
    adminUsers.forEach(admin => {
      if (admin.id !== event.organizerId) {
        db.createNotification({
          userId: admin.id,
          title: inquiryType === 'cancellation_request' ? 'Cancellation Request Received ⚠️' : 'Event Inquiry Received 💬',
          message: `[${event.title}] From ${name}: "${subject}"`,
          type: 'event',
          linkUrl: '/admin/marketing',
        });
      }
    });

    console.log(`[EMAIL NOTIFICATION LOG] To Organizer (${event.organizerName}): New inquiry for "${event.title}" from ${name} <${email}>: "${subject}"`);

    return res.status(201).json({ inquiry, message: 'Message sent to event organizer successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Sending message failed' });
  }
});

app.get('/api/organizer/inquiries', authenticateToken, requireOrganizerOrAdmin, (req: AuthRequest, res: Response) => {
  try {
    const inquiries = req.user!.role === 'admin' 
      ? db.getEventInquiries() 
      : db.getOrganizerInquiries(req.user!.id);
    return res.json({ inquiries });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Fetching inquiries failed' });
  }
});

app.get('/api/attendee/inquiries', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const inquiries = db.getAttendeeInquiries(req.user!.id);
    return res.json({ inquiries });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Fetching inquiries failed' });
  }
});

app.post('/api/inquiries/:id/reply', authenticateToken, requireOrganizerOrAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { organizerReply, action } = req.body; // action: 'replied' | 'approved' | 'rejected'

    const allInquiries = db.getEventInquiries();
    const inq = allInquiries.find(i => i.id === id);
    if (!inq) return res.status(404).json({ error: 'Inquiry not found' });

    if (inq.organizerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to manage this inquiry' });
    }

    let finalStatus: EventInquiry['status'] = action || 'replied';

    // Handle cancellation request approval/rejection
    if (inq.type === 'cancellation_request' && action === 'approved') {
      finalStatus = 'approved';
      // Find registration and update status to cancelled
      const reg = db.getUserRegistrations(inq.attendeeId).find(r => r.eventId === inq.eventId);
      if (reg) {
        db.updateRegistration(reg.id, { paymentStatus: 'refunded' });
        // Update event registered count
        const event = db.getEventById(inq.eventId);
        if (event && event.registeredCount > 0) {
          db.updateEvent(event.id, { registeredCount: Math.max(0, event.registeredCount - 1) });
        }
      }
    } else if (inq.type === 'cancellation_request' && action === 'rejected') {
      finalStatus = 'rejected';
    }

    const updated = db.replyEventInquiry(id, organizerReply || '', finalStatus);

    // Notify attendee in-app if registered user
    if (inq.attendeeId && !inq.attendeeId.startsWith('guest-')) {
      let notifTitle = `Reply from Organizer regarding "${inq.eventTitle}" 💬`;
      if (finalStatus === 'approved') notifTitle = `Registration Cancellation Approved ✅`;
      if (finalStatus === 'rejected') notifTitle = `Registration Cancellation Request Rejected ❌`;

      db.createNotification({
        userId: inq.attendeeId,
        title: notifTitle,
        message: organizerReply ? `Organizer Note: ${organizerReply}` : `Your request regarding "${inq.eventTitle}" was ${finalStatus}.`,
        type: 'event',
        linkUrl: '/dashboard/tickets',
      });
    }

    console.log(`[EMAIL NOTIFICATION LOG] To Attendee (${inq.attendeeEmail}): Organizer reply for "${inq.eventTitle}": ${organizerReply || finalStatus}`);

    return res.json({ inquiry: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Replying to inquiry failed' });
  }
});

// ADMIN COUPONS
app.get('/api/admin/coupons', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ coupons: db.getCoupons() });
});
app.post('/api/admin/coupons', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const coupon = db.addCoupon(req.body);
  return res.status(201).json({ coupon });
});
app.delete('/api/admin/coupons/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const success = db.deleteCoupon(req.params.id);
  return res.json({ success });
});

// ADMIN LOGS & NEWSLETTER
app.get('/api/admin/newsletter', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ subscribers: db.getNewsletterSubscribers() });
});
app.get('/api/admin/audit-logs', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ auditLogs: db.getAuditLogs() });
});
app.get('/api/admin/security-logs', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  return res.json({ securityLogs: db.getSecurityLogs() });
});

// ==========================================
// 7. VITE & PRODUCTION MIDDLEWARE SETUP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Hiruyan Event Platform backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
