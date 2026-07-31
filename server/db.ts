import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Event,
  Registration,
  Notification,
  Category,
  CmsSettings,
  Sponsor,
  Testimonial,
  FaqItem,
  ContactMessage,
  EventInquiry,
  Coupon,
  AuditLog,
  SecurityLog,
  UserGender,
  UserRole,
  CmsPage,
  BlogPost,
  Announcement,
} from '../src/types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export function getDefaultAvatarByGender(gender?: UserGender, seed: string = 'user'): string {
  if (gender === 'male') {
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';
  }
  if (gender === 'female') {
    return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80';
  }
  return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
}

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  events: Event[];
  registrations: Registration[];
  notifications: Notification[];
  favorites: { userId: string; eventId: string }[];
  categories: Category[];
  cms: CmsSettings;
  sponsors: Sponsor[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  contactMessages: ContactMessage[];
  eventInquiries: EventInquiry[];
  coupons: Coupon[];
  auditLogs: AuditLog[];
  securityLogs: SecurityLog[];
  newsletterSubscribers: string[];
  pages: CmsPage[];
  blogPosts: BlogPost[];
  announcements: Announcement[];
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Technology & AI', slug: 'technology-ai', icon: 'Cpu', description: 'Tech conferences, hackathons, and AI summits' },
  { id: 'cat-2', name: 'Business & Startup', slug: 'business-startup', icon: 'Briefcase', description: 'Leadership, venture funding, and keynotes' },
  { id: 'cat-3', name: 'Music & Concerts', slug: 'music-concerts', icon: 'Music', description: 'Live performances, music festivals, and shows' },
  { id: 'cat-4', name: 'Arts & Culture', slug: 'arts-culture', icon: 'Palette', description: 'Exhibitions, theater, gallery openings, and crafts' },
  { id: 'cat-5', name: 'Sports & Fitness', slug: 'sports-fitness', icon: 'Activity', description: 'Marathons, tournaments, yoga sessions, and fitness' },
  { id: 'cat-6', name: 'Education & Workshops', slug: 'education-workshops', icon: 'GraduationCap', description: 'Seminars, bootcamps, masterclasses, and lectures' },
  { id: 'cat-7', name: 'Networking & Social', slug: 'networking-social', icon: 'Users', description: 'Mixers, meetups, community gatherings, and socials' },
];

const DEFAULT_CMS: CmsSettings = {
  siteName: 'Hiruyan Event Platform',
  siteSlogan: 'Connecting Ethiopia & Beyond Through Unforgettable Events',
  siteTitle: 'Modern Ethiopian Event Management & Ticketing Platform',
  
  // Hero Section
  heroTitle: 'Create, Discover & Experience Extraordinary Events',
  heroSubtitle: 'Empowering organizers to host conferences, concerts, church events, university gatherings, and workshops with instant QR tickets and real-time analytics.',
  heroDescription: 'Real-time interactive location maps, instant QR ticket check-ins, organizer dashboards, and live attendee updates. Built for modern event creators.',
  heroImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  heroImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  heroBgUrl: '',
  heroCtaText: 'Explore Events',
  heroCtaLink: '/events',
  heroSecondaryCtaText: 'Create Event',
  heroSecondaryCtaLink: '/dashboard/create-event',
  heroOverlayColor: '#0f172a',
  heroOverlayOpacity: 0.7,
  showHeroSection: true,

  // Featured Events
  featuredTitle: 'Featured & Popular Events',
  featuredSubtitle: 'Handpicked summits, masterclasses, and entertainment experiences you cannot miss',
  featuredCount: 6,
  featuredSort: 'popular',
  showFeaturedEvents: true,

  // Upcoming Events
  upcomingTitle: 'Upcoming Gatherings',
  upcomingDescription: 'Discover upcoming events across tech, business, music, arts, and community workshops',
  upcomingCount: 8,
  showUpcomingEvents: true,

  // Categories Section
  categoriesTitle: 'Browse by Category',
  categoriesDescription: 'Find events tailored to your interests and professional career',
  showCategories: true,

  // About Section
  aboutHeading: 'About Hiruyan Event Platform',
  aboutText: 'Hiruyan Event Platform is a modern Ethiopian event management platform based in Adisketema, Dire Dawa. Our mission is to help organizers create, manage, and promote conferences, workshops, concerts, church events, university events, business gatherings, and community celebrations with ease.',
  aboutMission: 'To revolutionize event organizing and attendee engagement in East Africa through intuitive, secure, real-time ticketing technology.',
  aboutVision: 'Connecting millions of attendees with world-class events, conferences, and cultural festivals seamlessly.',
  aboutFounderMessage: 'Thank you for choosing Hiruyan to host your most memorable moments.',
  aboutImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
  aboutCtaText: 'Learn More About Us',
  aboutCtaLink: '/pages/about',
  showAboutSection: true,

  // Statistics Section
  statsMode: 'manual',
  statsEventsOrganized: '250+',
  statsHappyAttendees: '50,000+',
  statsVerifiedOrganizers: '120+',
  statsTicketsIssued: '85,000+',
  statsCitiesReached: '12+',
  statsYearsOfService: '5+',
  statsPartnerOrgs: '45+',
  showStatsEventsOrganized: true,
  showStatsHappyAttendees: true,
  showStatsVerifiedOrganizers: true,
  showStatsTicketsIssued: true,
  showStatsCitiesReached: true,
  showStatsYearsOfService: true,
  showStatsPartnerOrgs: true,
  showStatsSection: true,

  // Testimonials & Partners
  showTestimonials: true,
  showSponsors: true,
  showFaqSection: true,
  showContactSection: true,
  showFooter: true,
  showNewsletter: true,
  newsletterTitle: 'Stay Updated with Latest Events',
  newsletterDescription: 'Subscribe to our weekly digest of upcoming workshops, concerts, and tech summits.',
  newsletterPlaceholder: 'Enter your email address...',
  newsletterSuccessMsg: 'Thank you for subscribing to Hiruyan Events update newsletter!',

  // Contact Info
  contactOfficeName: 'Hiruyan Platform HQ',
  contactEmail: 'hiruyaninfo@gmail.com',
  contactPhone: '+251978760949',
  contactWhatsapp: '+251978760949',
  contactAddress: 'Adisketema, Dire Dawa, Ethiopia',
  contactCity: 'Dire Dawa',
  contactRegion: 'Dire Dawa Administration',
  contactCountry: 'Ethiopia',
  contactHours: 'Mon - Sat: 8:00 AM - 6:00 PM (EAT)',
  contactMapEmbedUrl: 'https://maps.google.com/maps?q=Dire+Dawa+Ethiopia&t=&z=13&ie=UTF8&iwloc=&output=embed',
  contactBannerUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  contactHeading: 'Get in Touch with Our Support Team',
  contactSubheading: 'Have questions about organizing an event or purchasing tickets? We are available 24/7.',

  // Footer & Social
  footerLogoUrl: '',
  footerDescription: 'Connecting organizers and participants across Ethiopia and beyond with secure ticketing, QR check-in, and real-time communication tools.',
  footerText: '© 2026 Hiruyan Event Platform. All Rights Reserved.',
  footerQuickLinks: [
    { label: 'Browse Events', url: '/events' },
    { label: 'Create Event', url: '/dashboard/create-event' },
    { label: 'About Us', url: '/pages/about' },
    { label: 'Contact Support', url: '/pages/contact' },
  ],
  footerAdditionalLinks: [
    { label: 'Privacy Policy', url: '/pages/privacy-policy' },
    { label: 'Terms & Conditions', url: '/pages/terms-and-conditions' },
    { label: 'Refund Policy', url: '/pages/refund-policy' },
    { label: 'Help Center', url: '/pages/help-center' },
  ],
  socialLinks: {
    whatsapp: 'https://wa.me/251978760949',
    instagram: 'https://instagram.com/hiruyan-event-organizer',
    telegram: 'https://t.me/hiruyan',
    tiktok: 'https://www.tiktok.com/@hiruyan',
    twitter: 'https://twitter.com/hiruyan',
    linkedin: 'https://linkedin.com/company/hiruyan',
    facebook: 'https://facebook.com/hiruyan',
    youtube: 'https://youtube.com/@hiruyan',
  },

  // Navbar & Branding
  logoUrl: '',
  faviconUrl: '',
  stickyNavbar: true,
  smoothScroll: true,
  navMenuItems: [
    { id: 'nav-1', label: 'Home', route: '/', visible: true, order: 1 },
    { id: 'nav-2', label: 'Events', route: '/events', visible: true, order: 2 },
    { id: 'nav-3', label: 'About', route: '/#about', visible: true, order: 3 },
    { id: 'nav-4', label: 'Contact', route: '/#contact', visible: true, order: 4 },
  ],

  // Appearance
  primaryColor: '#4f46e5',
  secondaryColor: '#7c3aed',
  accentColor: '#f59e0b',
  buttonStyle: 'rounded-xl',
  brandFont: 'Plus Jakarta Sans',
  borderRadius: '1rem',
  defaultTheme: 'light',
  loadingLogoUrl: '',

  // SEO CMS
  metaTitle: 'Hiruyan Event Platform - Adisketema, Dire Dawa, Ethiopia',
  metaDescription: 'Discover Ethiopian conferences, concerts, workshops, and gatherings with secure ticketing and QR check-in.',
  metaKeywords: 'Ethiopia events, Dire Dawa concerts, QR ticketing, Hiruyan events',
  ogImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  twitterCardUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  canonicalUrl: 'https://hiruyan.com',
  robotsTxt: 'User-agent: *\nAllow: /',
  sitemapEnabled: true,
  googleAnalyticsId: 'G-HIRUYAN2026',

  // System Config
  currency: 'ETB',
  currencySymbol: 'ETB',
  timezone: 'Africa/Addis_Ababa',
  language: 'English',
  dateFormat: 'YYYY-MM-DD',
  allowRegistrations: true,
  requireEmailVerification: false,
  maintenanceMode: false,
  maintenanceMessage: 'Platform is currently undergoing scheduled maintenance. Please check back shortly.',
  maxUploadMb: 10,
  allowedFileTypes: 'jpg,png,webp,pdf',
  paymentGatewaysEnabled: true,
  emailNotificationsEnabled: true,

  homepageSectionOrder: ['hero', 'stats', 'about', 'featured', 'categories', 'upcoming', 'testimonials', 'sponsors', 'faq', 'contact'],
  features: [
    { title: 'Instant QR Ticketing', description: 'Digital PDF tickets with dynamic scannable QR codes for fast venue check-in.', iconName: 'QrCode' },
    { title: 'Interactive Map View', description: 'Explore events visually with pinpoint GPS pin locations and venue directions.', iconName: 'MapPin' },
    { title: 'Role-Based Analytics', description: 'Tailored dashboards for Admin, Organizers, and Attendees to track performance.', iconName: 'BarChart' },
  ],
};

const DEFAULT_SPONSORS: Sponsor[] = [
  { id: 'sp-1', name: 'Vanguard AI', logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80', tier: 'platinum', websiteUrl: 'https://example.com' },
  { id: 'sp-2', name: 'Apex Cloud', logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80', tier: 'gold', websiteUrl: 'https://example.com' },
  { id: 'sp-3', name: 'Nexus Capital', logoUrl: 'https://images.unsplash.com/photo-1516876437184-593fda40c7ce?auto=format&fit=crop&w=200&q=80', tier: 'silver', websiteUrl: 'https://example.com' },
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: 't-1', name: 'Dr. Evelyn Carter', role: 'Global Tech Summit Director', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', content: 'Hiruyan completely transformed our annual tech conference. Check-ins were instantaneous with QR codes, and sales skyrocketed!', rating: 5 },
  { id: 't-2', name: 'Marcus Vance', role: 'Concert Organizer', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', content: 'The role-based dashboards and automated ticket verification saved our staff hundreds of hours. Outstanding platform!', rating: 5 },
];

const DEFAULT_FAQS: FaqItem[] = [
  { id: 'faq-1', question: 'How do attendees receive their event tickets?', answer: 'Immediately after registration or ticket purchase, digital PDF tickets with embedded scannable QR codes are generated in the Attendee Dashboard and emailed to the user.', category: 'Tickets' },
  { id: 'faq-2', question: 'Can event organizers scan tickets at the door?', answer: 'Yes! Organizers have access to a live mobile-friendly QR scanner in their Organizer Dashboard that verifies tickets in under 1 second.', category: 'Check-in' },
  { id: 'faq-3', question: 'How do gender-based default avatars work?', answer: 'During registration, users choose their gender (Male, Female, or Prefer not to say). The platform automatically assigns a high-quality gender-tailored default avatar, which can be customized anytime or restored with a single click.', category: 'Account' },
];

class JsonDatabase {
  private data: DatabaseSchema = {
    users: [],
    events: [],
    registrations: [],
    notifications: [],
    favorites: [],
    categories: DEFAULT_CATEGORIES,
    cms: DEFAULT_CMS,
    sponsors: DEFAULT_SPONSORS,
    testimonials: DEFAULT_TESTIMONIALS,
    faqs: DEFAULT_FAQS,
    contactMessages: [],
    eventInquiries: [],
    pages: [],
    blogPosts: [],
    announcements: [],
    coupons: [
      { id: 'coup-1', code: 'HIRUYAN20', discountPercentage: 20, maxUses: 500, usedCount: 42, expiryDate: '2026-12-31', active: true }
    ],
    auditLogs: [],
    securityLogs: [],
    newsletterSubscribers: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileData = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileData);
        this.data = {
          ...this.data,
          ...parsed,
          categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : DEFAULT_CATEGORIES,
          cms: { ...DEFAULT_CMS, ...(parsed.cms || {}) },
          sponsors: parsed.sponsors || DEFAULT_SPONSORS,
          testimonials: parsed.testimonials || DEFAULT_TESTIMONIALS,
          faqs: parsed.faqs || DEFAULT_FAQS,
          contactMessages: parsed.contactMessages || [],
          eventInquiries: parsed.eventInquiries || [],
          coupons: parsed.coupons || [],
          auditLogs: parsed.auditLogs || [],
          securityLogs: parsed.securityLogs || [],
          newsletterSubscribers: parsed.newsletterSubscribers || [],
        };
      } catch (err) {
        console.error('Error reading DB file, resetting to clean structure:', err);
        this.save();
      }
    } else {
      this.save();
    }

    // Ensure default Seed Accounts (Admin, Organizer, Attendee)
    this.ensureDefaultUsers();
  }

  private ensureDefaultUsers() {
    let changed = false;

    // 1. Super Admin
    const adminEmail = 'admin@hiruyan.com';
    let adminUser = this.data.users.find(u => u.email.toLowerCase() === adminEmail);
    if (!adminUser) {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync('admin123', salt);
      const genderAvatar = getDefaultAvatarByGender('male', 'admin');
      adminUser = {
        id: 'usr-admin-super',
        username: 'superadmin',
        email: adminEmail,
        fullName: 'Hiruyan Super Admin',
        role: 'admin',
        gender: 'male',
        status: 'active',
        passwordHash,
        genderAvatarUrl: genderAvatar,
        avatarUrl: genderAvatar,
        phoneNumber: '+1 (555) 019-2831',
        address: 'Hiruyan Global HQ, San Francisco, CA',
        verified: true,
        createdAt: new Date().toISOString(),
      };
      this.data.users.push(adminUser);
      changed = true;
    } else {
      if (!bcrypt.compareSync('admin123', adminUser.passwordHash)) {
        const salt = bcrypt.genSaltSync(10);
        adminUser.passwordHash = bcrypt.hashSync('admin123', salt);
        changed = true;
      }
    }

    // 2. Organizer
    const orgEmail = 'organizer@hiruyan.com';
    let orgUser = this.data.users.find(u => u.email.toLowerCase() === orgEmail);
    if (!orgUser) {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync('organizer123', salt);
      const genderAvatar = getDefaultAvatarByGender('female', 'organizer');
      orgUser = {
        id: 'usr-org-demo',
        username: 'tech_events_pro',
        email: orgEmail,
        fullName: 'Sarah Connor',
        role: 'organizer',
        gender: 'female',
        status: 'active',
        passwordHash,
        genderAvatarUrl: genderAvatar,
        avatarUrl: genderAvatar,
        phoneNumber: '+1 (555) 432-8899',
        address: 'Silicon Valley Events Inc, CA',
        verified: true,
        createdAt: new Date().toISOString(),
      };
      this.data.users.push(orgUser);
      changed = true;
    } else {
      if (!bcrypt.compareSync('organizer123', orgUser.passwordHash)) {
        const salt = bcrypt.genSaltSync(10);
        orgUser.passwordHash = bcrypt.hashSync('organizer123', salt);
        changed = true;
      }
    }

    // 3. Attendee
    const attendeeEmail = 'attendee@hiruyan.com';
    let attendeeUser = this.data.users.find(u => u.email.toLowerCase() === attendeeEmail);
    if (!attendeeUser) {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync('attendee123', salt);
      const genderAvatar = getDefaultAvatarByGender('male', 'attendee');
      attendeeUser = {
        id: 'usr-att-demo',
        username: 'john_doe',
        email: attendeeEmail,
        fullName: 'John Doe',
        role: 'attendee',
        gender: 'male',
        status: 'active',
        passwordHash,
        genderAvatarUrl: genderAvatar,
        avatarUrl: genderAvatar,
        phoneNumber: '+1 (555) 998-1122',
        address: 'New York City, NY',
        verified: false,
        createdAt: new Date().toISOString(),
      };
      this.data.users.push(attendeeUser);
      changed = true;
    } else {
      if (!bcrypt.compareSync('attendee123', attendeeUser.passwordHash)) {
        const salt = bcrypt.genSaltSync(10);
        attendeeUser.passwordHash = bcrypt.hashSync('attendee123', salt);
        changed = true;
      }
    }

    if (changed) {
      this.save();
      console.log('Seeded default role-based accounts (Admin, Organizer, Attendee)');
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write DB file:', err);
    }
  }

  // --- Users ---
  getUsers(): User[] {
    return this.data.users.map(({ passwordHash, ...user }) => user);
  }

  getUserById(id: string): User | undefined {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return undefined;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  getUserWithHashByEmail(email: string): (User & { passwordHash: string }) | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserByIdFull(id: string): (User & { passwordHash: string }) | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'> & { passwordHash: string }): User {
    const id = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const gender = userData.gender || 'prefer_not_to_say';
    const genderAvatar = getDefaultAvatarByGender(gender, userData.username);
    
    const newUser = {
      ...userData,
      id,
      gender,
      status: userData.status || 'active',
      genderAvatarUrl: genderAvatar,
      avatarUrl: userData.customAvatarUrl || genderAvatar,
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.save();

    this.addAuditLog(newUser.id, newUser.fullName, newUser.role, 'USER_REGISTERED', `User account created: ${newUser.email}`);
    this.addSecurityLog(newUser.email, 'login_success', '127.0.0.1', 'Browser Client');

    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  updateUser(id: string, updates: Partial<User & { passwordHash?: string }>): User | undefined {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;

    const current = this.data.users[index];
    const updatedGender = updates.gender || current.gender || 'prefer_not_to_say';
    const genderAvatar = getDefaultAvatarByGender(updatedGender, current.username);

    // Compute active avatarUrl: custom avatar takes precedence, otherwise gender avatar
    let activeAvatar = current.avatarUrl;
    if (updates.customAvatarUrl !== undefined) {
      activeAvatar = updates.customAvatarUrl ? updates.customAvatarUrl : genderAvatar;
    } else if (updates.gender !== undefined && !current.customAvatarUrl) {
      activeAvatar = genderAvatar;
    }

    this.data.users[index] = {
      ...current,
      ...updates,
      gender: updatedGender,
      genderAvatarUrl: genderAvatar,
      avatarUrl: activeAvatar,
      updatedAt: new Date().toISOString(),
    };
    this.save();

    this.addAuditLog(id, this.data.users[index].fullName, this.data.users[index].role, 'USER_UPDATED', `User profile updated`);

    const { passwordHash, ...safeUser } = this.data.users[index];
    return safeUser;
  }

  deleteUser(id: string): boolean {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    const deleted = this.data.users.splice(index, 1)[0];
    this.save();
    this.addAuditLog(id, deleted.fullName, deleted.role, 'USER_DELETED', `User account deleted: ${deleted.email}`);
    return true;
  }

  // --- Categories ---
  getCategories(): Category[] {
    return this.data.categories || [];
  }
  createCategory(catData: { name: string; icon?: string; description?: string }): Category {
    const slug = catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category: Category = {
      id: `cat-${Date.now()}`,
      name: catData.name,
      slug,
      icon: catData.icon || 'Folder',
      description: catData.description || '',
    };
    if (!this.data.categories) this.data.categories = [];
    this.data.categories.push(category);
    this.save();
    return category;
  }
  updateCategory(id: string, updates: Partial<Category>): Category | undefined {
    if (!this.data.categories) return undefined;
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return undefined;
    if (updates.name) {
      cat.name = updates.name;
      cat.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (updates.icon !== undefined) cat.icon = updates.icon;
    if (updates.description !== undefined) cat.description = updates.description;
    this.save();
    return cat;
  }
  deleteCategory(id: string): boolean {
    if (!this.data.categories) return false;
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.save();
    return true;
  }

  // --- CMS & Settings ---
  getCmsSettings(): CmsSettings {
    return this.data.cms;
  }

  updateCmsSettings(updates: Partial<CmsSettings>): CmsSettings {
    this.data.cms = { ...this.data.cms, ...updates };
    this.save();
    return this.data.cms;
  }

  // --- Sponsors ---
  getSponsors(): Sponsor[] {
    return this.data.sponsors;
  }
  addSponsor(sponsorData: Omit<Sponsor, 'id'>): Sponsor {
    const sponsor: Sponsor = { id: `sp-${Date.now()}`, ...sponsorData };
    this.data.sponsors.push(sponsor);
    this.save();
    return sponsor;
  }
  deleteSponsor(id: string): boolean {
    const idx = this.data.sponsors.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.data.sponsors.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Testimonials ---
  getTestimonials(): Testimonial[] {
    return this.data.testimonials;
  }
  addTestimonial(tData: Omit<Testimonial, 'id'>): Testimonial {
    const t: Testimonial = { id: `t-${Date.now()}`, ...tData };
    this.data.testimonials.push(t);
    this.save();
    return t;
  }
  deleteTestimonial(id: string): boolean {
    const idx = this.data.testimonials.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.data.testimonials.splice(idx, 1);
    this.save();
    return true;
  }

  // --- FAQs ---
  getFaqs(): FaqItem[] {
    return this.data.faqs;
  }
  addFaq(faqData: Omit<FaqItem, 'id'>): FaqItem {
    const faq: FaqItem = { id: `faq-${Date.now()}`, ...faqData };
    this.data.faqs.push(faq);
    this.save();
    return faq;
  }
  deleteFaq(id: string): boolean {
    const idx = this.data.faqs.findIndex(f => f.id === id);
    if (idx === -1) return false;
    this.data.faqs.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Contact Messages ---
  getContactMessages(): ContactMessage[] {
    return (this.data.contactMessages || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  addContactMessage(msgData: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): ContactMessage {
    if (!this.data.contactMessages) this.data.contactMessages = [];
    const msg: ContactMessage = {
      id: `msg-${Date.now()}`,
      ...msgData,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    this.data.contactMessages.push(msg);
    this.save();
    return msg;
  }
  updateContactMessageStatus(id: string, status: ContactMessage['status'], adminReply?: string): ContactMessage | undefined {
    if (!this.data.contactMessages) this.data.contactMessages = [];
    const msg = this.data.contactMessages.find(m => m.id === id);
    if (!msg) return undefined;
    msg.status = status;
    if (adminReply !== undefined) msg.adminReply = adminReply;
    this.save();
    return msg;
  }
  deleteContactMessage(id: string): boolean {
    if (!this.data.contactMessages) return false;
    const idx = this.data.contactMessages.findIndex(m => m.id === id);
    if (idx === -1) return false;
    this.data.contactMessages.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Event Inquiries & Organizer Communications ---
  getEventInquiries(): EventInquiry[] {
    return (this.data.eventInquiries || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  getOrganizerInquiries(organizerId: string): EventInquiry[] {
    return (this.data.eventInquiries || [])
      .filter(m => m.organizerId === organizerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  getAttendeeInquiries(attendeeId: string): EventInquiry[] {
    return (this.data.eventInquiries || [])
      .filter(m => m.attendeeId === attendeeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  addEventInquiry(inquiryData: Omit<EventInquiry, 'id' | 'createdAt' | 'status'>): EventInquiry {
    if (!this.data.eventInquiries) this.data.eventInquiries = [];
    const inquiry: EventInquiry = {
      id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...inquiryData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.data.eventInquiries.push(inquiry);
    this.save();
    return inquiry;
  }
  replyEventInquiry(id: string, organizerReply: string, newStatus?: EventInquiry['status']): EventInquiry | undefined {
    if (!this.data.eventInquiries) return undefined;
    const inq = this.data.eventInquiries.find(m => m.id === id);
    if (!inq) return undefined;
    inq.organizerReply = organizerReply;
    inq.status = newStatus || 'replied';
    inq.updatedAt = new Date().toISOString();
    this.save();
    return inq;
  }

  // --- Coupons ---
  getCoupons(): Coupon[] {
    return this.data.coupons;
  }
  addCoupon(cData: Omit<Coupon, 'id' | 'usedCount'>): Coupon {
    const coupon: Coupon = { id: `coup-${Date.now()}`, usedCount: 0, ...cData };
    this.data.coupons.push(coupon);
    this.save();
    return coupon;
  }
  deleteCoupon(id: string): boolean {
    const idx = this.data.coupons.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.coupons.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Newsletter ---
  addNewsletterSubscriber(email: string): boolean {
    if (!email || this.data.newsletterSubscribers.includes(email.toLowerCase())) return false;
    this.data.newsletterSubscribers.push(email.toLowerCase());
    this.save();
    return true;
  }
  getNewsletterSubscribers(): string[] {
    return this.data.newsletterSubscribers;
  }

  // --- Logs ---
  addAuditLog(userId: string, userName: string, userRole: string, action: string, details: string) {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      userId,
      userName,
      userRole,
      action,
      details,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 200) this.data.auditLogs.pop();
    this.save();
  }

  getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  addSecurityLog(email: string, eventType: SecurityLog['eventType'], ipAddress: string = '127.0.0.1', userAgent: string = 'Browser') {
    const log: SecurityLog = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      email,
      eventType,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
    };
    this.data.securityLogs.unshift(log);
    if (this.data.securityLogs.length > 200) this.data.securityLogs.pop();
    this.save();
  }

  getSecurityLogs(): SecurityLog[] {
    return this.data.securityLogs;
  }

  // --- Events ---
  getEvents(): Event[] {
    return this.data.events;
  }

  getEventById(id: string): Event | undefined {
    return this.data.events.find(e => e.id === id);
  }

  getEventBySlug(slug: string): Event | undefined {
    return this.data.events.find(e => e.slug === slug);
  }

  createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Event {
    const id = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newEvent: Event = {
      ...eventData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: 0,
      registeredCount: 0,
    };
    this.data.events.push(newEvent);
    this.save();
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<Event>): Event | undefined {
    const index = this.data.events.findIndex(e => e.id === id);
    if (index === -1) return undefined;

    this.data.events[index] = {
      ...this.data.events[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.events[index];
  }

  deleteEvent(id: string): boolean {
    const index = this.data.events.findIndex(e => e.id === id);
    if (index === -1) return false;
    this.data.events.splice(index, 1);
    // Also cleanup registrations
    this.data.registrations = this.data.registrations.filter(r => r.eventId !== id);
    this.save();
    return true;
  }

  // --- Registrations & Tickets ---
  getRegistrations(): Registration[] {
    return this.data.registrations;
  }

  getRegistrationById(id: string): Registration | undefined {
    return this.data.registrations.find(r => r.id === id);
  }

  getRegistrationByTicketNumber(ticketNumber: string): Registration | undefined {
    return this.data.registrations.find(r => r.ticketNumber === ticketNumber);
  }

  getUserRegistrations(userId: string): Registration[] {
    return this.data.registrations.filter(r => r.userId === userId);
  }

  getEventRegistrations(eventId: string): Registration[] {
    return this.data.registrations.filter(r => r.eventId === eventId);
  }

  createRegistration(regData: Omit<Registration, 'id' | 'ticketNumber' | 'registeredAt'>): Registration {
    const id = `reg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const newRegistration: Registration = {
      ...regData,
      id,
      ticketNumber,
      registeredAt: new Date().toISOString(),
    };
    
    this.data.registrations.push(newRegistration);
    
    // Update event registered count & ticket sold count
    const event = this.getEventById(regData.eventId);
    if (event) {
      const ticketTypeIndex = event.ticketTypes.findIndex(t => t.id === regData.ticketTypeId);
      if (ticketTypeIndex !== -1) {
        event.ticketTypes[ticketTypeIndex].soldCount = (event.ticketTypes[ticketTypeIndex].soldCount || 0) + 1;
      }
      event.registeredCount = (event.registeredCount || 0) + 1;
      this.updateEvent(event.id, event);
    }
    
    this.save();
    return newRegistration;
  }

  updateRegistration(id: string, updates: Partial<Registration>): Registration | undefined {
    const index = this.data.registrations.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    this.data.registrations[index] = {
      ...this.data.registrations[index],
      ...updates,
    };
    this.save();
    return this.data.registrations[index];
  }

  // --- Notifications ---
  getUserNotifications(userId: string): Notification[] {
    return this.data.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createNotification(notifData: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newNotif: Notification = {
      ...notifData,
      id,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.push(newNotif);
    this.save();
    return newNotif;
  }

  markNotificationRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id && n.userId === userId);
    if (!notif) return false;
    notif.read = true;
    this.save();
    return true;
  }

  markAllNotificationsRead(userId: string): void {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this.save();
  }

  // --- Favorites ---
  getUserFavorites(userId: string): string[] {
    return this.data.favorites.filter(f => f.userId === userId).map(f => f.eventId);
  }

  toggleFavorite(userId: string, eventId: string): boolean {
    const index = this.data.favorites.findIndex(f => f.userId === userId && f.eventId === eventId);
    let isFavorite = false;
    if (index !== -1) {
      this.data.favorites.splice(index, 1);
      isFavorite = false;
    } else {
      this.data.favorites.push({ userId, eventId });
      isFavorite = true;
    }
    this.save();
    return isFavorite;
  }

  // --- CMS Pages ---
  getPages(): CmsPage[] {
    return this.data.pages || [];
  }

  getPageBySlug(slug: string): CmsPage | undefined {
    return (this.data.pages || []).find(p => p.slug === slug);
  }

  savePage(pageData: Partial<CmsPage> & { title: string; slug: string }): CmsPage {
    if (!this.data.pages) this.data.pages = [];
    let page: CmsPage;
    if (pageData.id) {
      const idx = this.data.pages.findIndex(p => p.id === pageData.id);
      if (idx !== -1) {
        this.data.pages[idx] = {
          ...this.data.pages[idx],
          ...pageData,
          updatedAt: new Date().toISOString(),
        };
        page = this.data.pages[idx];
      } else {
        page = {
          id: pageData.id,
          title: pageData.title,
          slug: pageData.slug,
          content: pageData.content || '',
          metaDescription: pageData.metaDescription || '',
          published: pageData.published !== false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.data.pages.push(page);
      }
    } else {
      page = {
        id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: pageData.title,
        slug: pageData.slug,
        content: pageData.content || '',
        metaDescription: pageData.metaDescription || '',
        published: pageData.published !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.pages.push(page);
    }
    this.save();
    return page;
  }

  deletePage(id: string): boolean {
    if (!this.data.pages) return false;
    const idx = this.data.pages.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.pages.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Blog Posts ---
  getBlogPosts(): BlogPost[] {
    return this.data.blogPosts || [];
  }

  getBlogPostBySlug(slug: string): BlogPost | undefined {
    return (this.data.blogPosts || []).find(b => b.slug === slug);
  }

  saveBlogPost(postData: Partial<BlogPost> & { title: string; slug: string }): BlogPost {
    if (!this.data.blogPosts) this.data.blogPosts = [];
    let post: BlogPost;
    if (postData.id) {
      const idx = this.data.blogPosts.findIndex(b => b.id === postData.id);
      if (idx !== -1) {
        this.data.blogPosts[idx] = {
          ...this.data.blogPosts[idx],
          ...postData,
        };
        post = this.data.blogPosts[idx];
      } else {
        post = {
          id: postData.id,
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt || '',
          content: postData.content || '',
          coverImage: postData.coverImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
          category: postData.category || 'General',
          tags: postData.tags || [],
          authorName: postData.authorName || 'Hiruyan Team',
          published: postData.published !== false,
          publishedAt: postData.publishedAt || new Date().toISOString(),
        };
        this.data.blogPosts.push(post);
      }
    } else {
      post = {
        id: `blog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt || '',
        content: postData.content || '',
        coverImage: postData.coverImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
        category: postData.category || 'General',
        tags: postData.tags || [],
        authorName: postData.authorName || 'Hiruyan Team',
        published: postData.published !== false,
        publishedAt: new Date().toISOString(),
      };
      this.data.blogPosts.push(post);
    }
    this.save();
    return post;
  }

  deleteBlogPost(id: string): boolean {
    if (!this.data.blogPosts) return false;
    const idx = this.data.blogPosts.findIndex(b => b.id === id);
    if (idx === -1) return false;
    this.data.blogPosts.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Announcements ---
  getAnnouncements(): Announcement[] {
    return this.data.announcements || [];
  }

  saveAnnouncement(annData: Partial<Announcement> & { title: string; message: string }): Announcement {
    if (!this.data.announcements) this.data.announcements = [];
    let ann: Announcement;
    if (annData.id) {
      const idx = this.data.announcements.findIndex(a => a.id === annData.id);
      if (idx !== -1) {
        this.data.announcements[idx] = {
          ...this.data.announcements[idx],
          ...annData,
        };
        ann = this.data.announcements[idx];
      } else {
        ann = {
          id: annData.id,
          title: annData.title,
          message: annData.message,
          audience: annData.audience || 'all',
          startDate: annData.startDate || new Date().toISOString(),
          endDate: annData.endDate || new Date(Date.now() + 7 * 86400000).toISOString(),
          published: annData.published !== false,
          linkUrl: annData.linkUrl,
          createdAt: new Date().toISOString(),
        };
        this.data.announcements.push(ann);
      }
    } else {
      ann = {
        id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: annData.title,
        message: annData.message,
        audience: annData.audience || 'all',
        startDate: annData.startDate || new Date().toISOString(),
        endDate: annData.endDate || new Date(Date.now() + 7 * 86400000).toISOString(),
        published: annData.published !== false,
        linkUrl: annData.linkUrl,
        createdAt: new Date().toISOString(),
      };
      this.data.announcements.push(ann);
    }
    this.save();
    return ann;
  }

  deleteAnnouncement(id: string): boolean {
    if (!this.data.announcements) return false;
    const idx = this.data.announcements.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.data.announcements.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Backup & Restore ---
  exportBackup() {
    return JSON.stringify(this.data, null, 2);
  }

  restoreBackup(backupJson: string): boolean {
    try {
      const parsed = JSON.parse(backupJson);
      if (!parsed.users || !parsed.cms) {
        throw new Error('Invalid backup schema missing core tables');
      }
      this.data = parsed;
      this.save();
      return true;
    } catch (e) {
      console.error('Failed to restore database backup:', e);
      return false;
    }
  }
}

export const db = new JsonDatabase();
