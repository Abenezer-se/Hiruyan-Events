export type UserRole = 'admin' | 'organizer' | 'attendee';
export type UserGender = 'male' | 'female' | 'prefer_not_to_say';
export type UserStatus = 'active' | 'suspended' | 'banned';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  gender?: UserGender;
  status?: UserStatus;
  avatarUrl?: string;
  customAvatarUrl?: string;
  genderAvatarUrl?: string;
  phoneNumber?: string;
  address?: string;
  verified?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface OrganizerProfile {
  id: string;
  userId: string;
  organizationName: string;
  bio?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  verified: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  soldCount: number;
  description?: string;
}

export type EventStatus = 'draft' | 'published' | 'unpublished';

export interface Event {
  id: string;
  organizerId: string;
  organizerName: string;
  organizerAvatar?: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  capacity: number;
  ticketTypes: TicketType[];
  coverImage: string;
  coverImageUrl?: string;
  featured?: boolean;
  gallery: string[];
  venueName: string;
  fullAddress: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  location?: {
    name: string;
    latitude: number;
    longitude: number;
    city: string;
  };
  termsAndConditions?: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  viewsCount?: number;
  registeredCount?: number;
}

export type PaymentStatus = 'paid' | 'free' | 'pending' | 'refunded';
export type CheckInStatus = 'checked_in' | 'not_checked_in';

export interface Registration {
  id: string;
  ticketNumber: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  eventCity: string;
  eventLatitude: number;
  eventLongitude: number;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  ticketTypeId: string;
  ticketTypeName: string;
  ticketPrice: number;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  checkInStatus: CheckInStatus;
  checkInTimestamp?: string;
  qrCodeData: string;
  registeredAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'registration' | 'ticket' | 'reminder' | 'update' | 'cancel' | 'announcement' | 'checkin' | 'profile' | 'password' | 'system' | 'event';
  read: boolean;
  createdAt: string;
  linkUrl?: string;
}

export interface CheckInStats {
  eventId: string;
  totalRegistered: number;
  checkedInCount: number;
  remainingCapacity: number;
  checkInPercentage: number;
}

export interface EventFilterState {
  search: string;
  category: string;
  dateRange: 'all' | 'today' | 'this_week' | 'this_month' | 'upcoming' | 'past';
  location: string;
  price: 'all' | 'free' | 'paid';
  sortBy: 'date_asc' | 'date_desc' | 'name_asc' | 'price_asc' | 'popular';
}

export interface NavMenuItem {
  id: string;
  label: string;
  route: string;
  visible: boolean;
  order: number;
  isExternal?: boolean;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  authorName: string;
  published: boolean;
  publishedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: 'all' | 'organizers' | 'attendees';
  startDate: string;
  endDate: string;
  published: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface CmsSettings {
  siteName: string;
  siteSlogan?: string;
  siteTitle: string;
  
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroDescription?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaLink?: string;
  heroImageUrl?: string;
  heroBgUrl?: string;
  heroOverlayColor?: string;
  heroOverlayOpacity?: number;
  showHeroSection: boolean;

  // Featured Events Section
  featuredTitle?: string;
  featuredSubtitle?: string;
  featuredCount?: number;
  featuredSort?: 'latest' | 'popular' | 'upcoming';
  showFeaturedEvents: boolean;

  // Upcoming Events Section
  upcomingTitle?: string;
  upcomingDescription?: string;
  upcomingCount?: number;
  showUpcomingEvents: boolean;

  // Categories Section
  categoriesTitle?: string;
  categoriesDescription?: string;
  showCategories: boolean;

  // About Section
  aboutHeading?: string;
  aboutText: string;
  aboutMission?: string;
  aboutVision?: string;
  aboutFounderMessage?: string;
  aboutImage: string;
  aboutCtaText?: string;
  aboutCtaLink?: string;
  showAboutSection: boolean;

  // Statistics Section
  statsMode?: 'manual' | 'auto';
  statsEventsOrganized?: string;
  statsHappyAttendees?: string;
  statsVerifiedOrganizers?: string;
  statsTicketsIssued?: string;
  statsCitiesReached?: string;
  statsYearsOfService?: string;
  statsPartnerOrgs?: string;
  showStatsEventsOrganized?: boolean;
  showStatsHappyAttendees?: boolean;
  showStatsVerifiedOrganizers?: boolean;
  showStatsTicketsIssued?: boolean;
  showStatsCitiesReached?: boolean;
  showStatsYearsOfService?: boolean;
  showStatsPartnerOrgs?: boolean;
  showStatsSection: boolean;

  // Testimonials, Sponsors, FAQ, Newsletter
  showTestimonials: boolean;
  showSponsors: boolean;
  showFaqSection: boolean;
  showContactSection: boolean;
  showFooter: boolean;
  showNewsletter?: boolean;
  newsletterTitle?: string;
  newsletterDescription?: string;
  newsletterPlaceholder?: string;
  newsletterSuccessMsg?: string;

  // Contact Page Details
  contactOfficeName?: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp?: string;
  contactAddress: string;
  contactCity?: string;
  contactRegion?: string;
  contactCountry?: string;
  contactHours?: string;
  contactMapEmbedUrl?: string;
  contactBannerUrl?: string;
  contactHeading?: string;
  contactSubheading?: string;

  // Footer CMS
  footerLogoUrl?: string;
  footerDescription?: string;
  footerText: string;
  footerQuickLinks?: { label: string; url: string }[];
  footerAdditionalLinks?: { label: string; url: string }[];

  // Social Links
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    whatsapp?: string;
    telegram?: string;
    tiktok?: string;
  };

  // Navigation Bar CMS
  logoUrl: string;
  faviconUrl: string;
  stickyNavbar?: boolean;
  smoothScroll?: boolean;
  navMenuItems?: NavMenuItem[];

  // Appearance CMS
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  buttonStyle?: 'rounded-xl' | 'rounded-full' | 'rounded-md';
  brandFont: string;
  borderRadius?: string;
  defaultTheme?: 'dark' | 'light';
  loadingLogoUrl?: string;

  // SEO CMS
  metaTitle: string;
  metaDescription: string;
  metaKeywords?: string;
  ogImageUrl?: string;
  twitterCardUrl?: string;
  canonicalUrl?: string;
  robotsTxt?: string;
  sitemapEnabled?: boolean;
  googleAnalyticsId: string;
  googleSearchConsoleKey?: string;
  facebookPixelId?: string;

  // System Settings CMS
  currency: string;
  currencySymbol: string;
  timezone: string;
  language: string;
  dateFormat?: string;
  allowRegistrations: boolean;
  requireEmailVerification?: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  maxUploadMb?: number;
  allowedFileTypes?: string;
  paymentGatewaysEnabled: boolean;
  emailNotificationsEnabled: boolean;

  // Ordering & Custom
  homepageSectionOrder?: string[];
  features?: { title: string; description: string; iconName?: string }[];
  draftSavedAt?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  tier: 'platinum' | 'gold' | 'silver' | 'partner';
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  content: string;
  rating: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  adminReply?: string;
  createdAt: string;
}

export interface EventInquiry {
  id: string;
  eventId: string;
  eventTitle: string;
  organizerId: string;
  attendeeId: string;
  attendeeName: string;
  attendeeEmail: string;
  subject: string;
  message: string;
  attachmentUrl?: string;
  type: 'question' | 'organizer_ask' | 'cancellation_request';
  status: 'pending' | 'replied' | 'approved' | 'rejected';
  organizerReply?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  maxUses: number;
  usedCount: number;
  expiryDate: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface SecurityLog {
  id: string;
  email: string;
  eventType: 'login_success' | 'login_failed' | 'password_reset' | 'account_suspended' | 'role_changed';
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface SuperAdminStats {
  totalUsers: number;
  totalOrganizers: number;
  totalAttendees: number;
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalRegistrations: number;
  totalTicketSales: number;
  totalRevenue: number;
  activeUsersToday: number;
  systemStatus: 'optimal' | 'warning' | 'maintenance';
}

