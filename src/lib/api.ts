import {
  User,
  Event,
  Registration,
  Notification,
  Category,
  EventFilterState,
  CheckInStats,
  SuperAdminStats,
  CmsSettings,
  Sponsor,
  Testimonial,
  FaqItem,
  ContactMessage,
  EventInquiry,
  Coupon,
  AuditLog,
  SecurityLog,
  CmsPage,
  BlogPost,
  Announcement,
} from '../types.js';

const TOKEN_KEY = 'hiruyan_auth_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => fetchApi<{ user: User; token: string }>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => fetchApi<{ user: User; token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => fetchApi<{ user: User }>('/api/auth/me'),
  getCurrentUser: () => fetchApi<{ user: User }>('/api/auth/me'),
  logout: () => removeAuthToken(),
  updateProfile: (body: any) => fetchApi<{ user: User }>('/api/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body: any) => fetchApi<{ message: string }>('/api/auth/change-password', { method: 'PUT', body: JSON.stringify(body) }),

  // Categories
  getCategories: () => fetchApi<{ categories: Category[] }>('/api/categories'),
  createCategory: (body: Partial<Category>) => fetchApi<{ category: Category }>('/api/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id: string, body: Partial<Category>) => fetchApi<{ category: Category }>(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCategory: (id: string) => fetchApi<{ message: string }>(`/api/categories/${id}`, { method: 'DELETE' }),

  // Location Geocoding
  searchLocation: (query: string) => fetchApi<{ results: any[] }>(`/api/location/search?q=${encodeURIComponent(query)}`),
  reverseGeocode: (lat: number, lng: number) => fetchApi<{ result: any }>(`/api/location/reverse?lat=${lat}&lng=${lng}`),

  // Events
  getEvents: (filters: Partial<EventFilterState> & { status?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.dateRange) params.set('dateRange', filters.dateRange);
    if (filters.location) params.set('location', filters.location);
    if (filters.price) params.set('price', filters.price);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.status) params.set('status', filters.status);
    return fetchApi<{ events: Event[] }>(`/api/events?${params.toString()}`);
  },
  getEvent: (idOrSlug: string) => fetchApi<{ event: Event }>(`/api/events/${idOrSlug}`),
  createEvent: (body: Partial<Event>) => fetchApi<{ event: Event }>('/api/events', { method: 'POST', body: JSON.stringify(body) }),
  updateEvent: (id: string, body: Partial<Event>) => fetchApi<{ event: Event }>(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  duplicateEvent: (id: string) => fetchApi<{ event: Event }>(`/api/events/${id}/duplicate`, { method: 'POST' }),
  deleteEvent: (id: string) => fetchApi<{ message: string }>(`/api/events/${id}`, { method: 'DELETE' }),
  getOrganizerEvents: () => fetchApi<{ events: Event[] }>('/api/organizer/events'),

  // Image Upload
  uploadImage: (base64Data: string, fileName?: string) => fetchApi<{ url: string }>('/api/upload', { method: 'POST', body: JSON.stringify({ base64Data, fileName }) }),

  // Registrations & Tickets
  registerTicket: (body: { eventId: string; ticketTypeId: string; attendeeName?: string; attendeeEmail?: string; attendeePhone?: string }) =>
    fetchApi<{ registration: Registration }>('/api/registrations', { method: 'POST', body: JSON.stringify(body) }),
  getMyTickets: () => fetchApi<{ registrations: Registration[] }>('/api/registrations/my'),
  getEventAttendees: (eventId: string) => fetchApi<{ attendees: Registration[]; event: Event }>(`/api/registrations/event/${eventId}`),

  // Check-In
  manualCheckIn: (registrationId: string, checkInStatus: 'checked_in' | 'not_checked_in') =>
    fetchApi<{ registration: Registration }>('/api/checkin/manual', { method: 'POST', body: JSON.stringify({ registrationId, checkInStatus }) }),
  qrCheckIn: (qrCodeText: string, eventId?: string) =>
    fetchApi<{ message: string; registration: Registration }>('/api/checkin/qr', { method: 'POST', body: JSON.stringify({ qrCodeText, eventId }) }),
  verifyCheckIn: (payload: string, eventId?: string) =>
    fetchApi<{ message: string; registration: Registration }>('/api/checkin/qr', { method: 'POST', body: JSON.stringify({ qrCodeText: payload, eventId }) }),
  getCheckInStats: (eventId: string) => fetchApi<{ stats: CheckInStats; recentCheckIns: Registration[] }>(`/api/checkin/stats/${eventId}`),

  // Analytics
  getAnalytics: () => fetchApi<{ stats: any }>('/api/analytics'),

  // Public CMS & Contact
  getCms: () => fetchApi<{ cms: CmsSettings; sponsors: Sponsor[]; testimonials: Testimonial[]; faqs: FaqItem[] }>('/api/cms'),
  submitContactMessage: (body: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    fetchApi<{ message: string; msg: ContactMessage }>('/api/contact-messages', { method: 'POST', body: JSON.stringify(body) }),
  subscribeNewsletter: (email: string) =>
    fetchApi<{ success: boolean; message: string }>('/api/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) }),

  // Event Inquiries & Organizer Communication
  sendEventInquiry: (eventId: string, body: { subject: string; message: string; type?: 'question' | 'organizer_ask' | 'cancellation_request'; attachmentUrl?: string; attendeeName?: string; attendeeEmail?: string }) =>
    fetchApi<{ inquiry: EventInquiry; message: string }>(`/api/events/${eventId}/inquiries`, { method: 'POST', body: JSON.stringify(body) }),
  getOrganizerInquiries: () => fetchApi<{ inquiries: EventInquiry[] }>('/api/organizer/inquiries'),
  getAttendeeInquiries: () => fetchApi<{ inquiries: EventInquiry[] }>('/api/attendee/inquiries'),
  replyEventInquiry: (id: string, body: { organizerReply?: string; action?: 'replied' | 'approved' | 'rejected' }) =>
    fetchApi<{ inquiry: EventInquiry }>(`/api/inquiries/${id}/reply`, { method: 'POST', body: JSON.stringify(body) }),

  // Super Admin API Methods
  getAdminStats: () => fetchApi<{ stats: SuperAdminStats; recentRegistrations: Registration[]; recentAuditLogs: AuditLog[] }>('/api/admin/stats'),
  getAdminCms: () => fetchApi<{ cms: CmsSettings }>('/api/admin/cms'),
  updateAdminCms: (body: Partial<CmsSettings>) => fetchApi<{ cms: CmsSettings }>('/api/admin/cms', { method: 'PUT', body: JSON.stringify(body) }),
  
  getAdminUsers: () => fetchApi<{ users: User[] }>('/api/admin/users'),
  createAdminUser: (body: any) => fetchApi<{ user: User }>('/api/admin/users', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminUser: (id: string, body: Partial<User>) => fetchApi<{ user: User }>(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  resetAdminUserPassword: (id: string, newPassword: string) => fetchApi<{ message: string }>(`/api/admin/users/${id}/reset-password`, { method: 'PUT', body: JSON.stringify({ newPassword }) }),
  deleteAdminUser: (id: string) => fetchApi<{ success: boolean; message?: string }>(`/api/admin/users/${id}`, { method: 'DELETE' }),
  
  getSponsors: () => fetchApi<{ sponsors: Sponsor[] }>('/api/admin/sponsors'),
  createSponsor: (body: Partial<Sponsor>) => fetchApi<{ sponsor: Sponsor }>('/api/admin/sponsors', { method: 'POST', body: JSON.stringify(body) }),
  deleteSponsor: (id: string) => fetchApi<{ success: boolean }>(`/api/admin/sponsors/${id}`, { method: 'DELETE' }),

  getTestimonials: () => fetchApi<{ testimonials: Testimonial[] }>('/api/admin/testimonials'),
  createTestimonial: (body: Partial<Testimonial>) => fetchApi<{ testimonial: Testimonial }>('/api/admin/testimonials', { method: 'POST', body: JSON.stringify(body) }),
  deleteTestimonial: (id: string) => fetchApi<{ success: boolean }>(`/api/admin/testimonials/${id}`, { method: 'DELETE' }),

  getFaqs: () => fetchApi<{ faqs: FaqItem[] }>('/api/admin/faqs'),
  createFaq: (body: Partial<FaqItem>) => fetchApi<{ faq: FaqItem }>('/api/admin/faqs', { method: 'POST', body: JSON.stringify(body) }),
  deleteFaq: (id: string) => fetchApi<{ success: boolean }>(`/api/admin/faqs/${id}`, { method: 'DELETE' }),

  getContactMessages: () => fetchApi<{ messages: ContactMessage[] }>('/api/admin/contact-messages'),
  updateContactMessageStatus: (id: string, status: ContactMessage['status'], adminReply?: string) =>
    fetchApi<{ message: ContactMessage }>(`/api/admin/contact-messages/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, adminReply }) }),
  replyContactMessage: (id: string, replyText: string) =>
    fetchApi<{ message: ContactMessage }>(`/api/admin/contact-messages/${id}/reply`, { method: 'POST', body: JSON.stringify({ replyText }) }),
  deleteContactMessage: (id: string) => fetchApi<{ success: boolean }>(`/api/admin/contact-messages/${id}`, { method: 'DELETE' }),

  getCoupons: () => fetchApi<{ coupons: Coupon[] }>('/api/admin/coupons'),
  createCoupon: (body: Partial<Coupon>) => fetchApi<{ coupon: Coupon }>('/api/admin/coupons', { method: 'POST', body: JSON.stringify(body) }),
  deleteCoupon: (id: string) => fetchApi<{ success: boolean }>(`/api/admin/coupons/${id}`, { method: 'DELETE' }),

  getNewsletterSubscribers: () => fetchApi<{ subscribers: string[] }>('/api/admin/newsletter'),
  getAuditLogs: () => fetchApi<{ auditLogs: AuditLog[] }>('/api/admin/audit-logs'),
  getSecurityLogs: () => fetchApi<{ securityLogs: SecurityLog[] }>('/api/admin/security-logs'),

  // Notifications
  getNotifications: () => fetchApi<{ notifications: Notification[] }>('/api/notifications'),
  markNotificationRead: (id: string) => fetchApi<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => fetchApi<{ success: boolean }>('/api/notifications/read-all', { method: 'POST' }),

  // Favorites
  getFavorites: () => fetchApi<{ favoriteIds: string[]; events: Event[] }>('/api/favorites'),
  toggleFavorite: (eventId: string) => fetchApi<{ isFavorite: boolean }>(`/api/favorites/${eventId}`, { method: 'POST' }),

  // CMS Pages
  getPublicPages: () => fetchApi<{ pages: CmsPage[] }>('/api/pages'),
  getPublicPageBySlug: (slug: string) => fetchApi<{ page: CmsPage }>(`/api/pages/${slug}`),
  getAdminPages: () => fetchApi<{ pages: CmsPage[] }>('/api/admin/pages'),
  createAdminPage: (body: Partial<CmsPage>) => fetchApi<{ page: CmsPage }>('/api/admin/pages', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminPage: (id: string, body: Partial<CmsPage>) => fetchApi<{ page: CmsPage }>(`/api/admin/pages/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAdminPage: (id: string) => fetchApi<{ success: boolean }>(`/api/admin/pages/${id}`, { method: 'DELETE' }),

  // Blog / News
  getPublicBlogPosts: () => fetchApi<{ posts: BlogPost[] }>('/api/blog'),
  getPublicBlogPostBySlug: (slug: string) => fetchApi<{ post: BlogPost }>(`/api/blog/${slug}`),
  getAdminBlogPosts: () => fetchApi<{ posts: BlogPost[] }>('/api/admin/blog'),
  createAdminBlogPost: (body: Partial<BlogPost>) => fetchApi<{ post: BlogPost }>('/api/admin/blog', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminBlogPost: (id: string, body: Partial<BlogPost>) => fetchApi<{ post: BlogPost }>(`/api/admin/blog/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAdminBlogPost: (id: string) => fetchApi<{ success: boolean }>(`/api/admin/blog/${id}`, { method: 'DELETE' }),

  // Platform Announcements
  getPublicAnnouncements: () => fetchApi<{ announcements: Announcement[] }>('/api/announcements'),
  getAdminAnnouncements: () => fetchApi<{ announcements: Announcement[] }>('/api/admin/announcements'),
  createAdminAnnouncement: (body: Partial<Announcement>) => fetchApi<{ announcement: Announcement }>('/api/admin/announcements', { method: 'POST', body: JSON.stringify(body) }),
  updateAdminAnnouncement: (id: string, body: Partial<Announcement>) => fetchApi<{ announcement: Announcement }>(`/api/admin/announcements/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAdminAnnouncement: (id: string) => fetchApi<{ success: boolean }>(`/api/admin/announcements/${id}`, { method: 'DELETE' }),

  // Backup & Restore
  restoreDatabaseBackup: (backupJson: any) => fetchApi<{ success: boolean; message: string }>('/api/admin/restore', { method: 'POST', body: JSON.stringify({ backupJson }) }),
};
