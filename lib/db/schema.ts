import { pgTable, uuid, text, boolean, timestamp, decimal, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// PROFILES TABLE (Multi-card support)
// ============================================
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  username: text('username').notNull().unique(),
  cardName: text('card_name').notNull().default('My Card'),
  isPrimary: boolean('is_primary').default(false),
  isPublic: boolean('is_public').default(true),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  displayName: text('display_name'),
  jobTitle: text('job_title'),
  company: text('company'),
  location: text('location'),
  bio: text('bio'),
  profileImageUrl: text('profile_image_url'),
  email: text('email'),
  phone: text('phone'),
  website: text('website'),
  address: text('address'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_profiles_user_id').on(table.userId),
  usernameIdx: uniqueIndex('idx_profiles_username').on(table.username),
  isPublicIdx: index('idx_profiles_is_public').on(table.isPublic),
  isPrimaryIdx: index('idx_profiles_is_primary').on(table.isPrimary),
}));

// ============================================
// CUSTOM LINKS TABLE
// ============================================
export const customLinks = pgTable('custom_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  imageUrl: text('image_url'),
  order: integer('order').default(0),
  enabled: boolean('enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  profileIdIdx: index('idx_custom_links_profile_id').on(table.profileId),
  orderIdx: index('idx_custom_links_order').on(table.order),
}));

// ============================================
// SOCIAL LINKS TABLE
// ============================================
export const socialLinks = pgTable('social_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(), // facebook, instagram, twitter, linkedin, youtube, spotify, etc.
  url: text('url').notNull(),
  enabled: boolean('enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  profileIdIdx: index('idx_social_links_profile_id').on(table.profileId),
}));

// ============================================
// SERVICES TABLE
// ============================================
export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  bullets: jsonb('bullets').$type<string[]>(),
  icon: text('icon'), // icon name or URL
  order: integer('order').default(0),
  enabled: boolean('enabled').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  profileIdIdx: index('idx_services_profile_id').on(table.profileId),
  orderIdx: index('idx_services_order').on(table.order),
}));

// ============================================
// WIDGET SETTINGS TABLE
// ============================================
export const widgetSettings = pgTable('widget_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  widgetType: text('widget_type').notNull(), // profile, bio, links, social, services, contact, map
  enabled: boolean('enabled').default(true),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  profileIdIdx: index('idx_widget_settings_profile_id').on(table.profileId),
  profileWidgetUnique: uniqueIndex('widget_settings_profile_id_widget_type_key').on(table.profileId, table.widgetType),
}));

// ============================================
// RELATIONS
// ============================================
export const profilesRelations = relations(profiles, ({ many }) => ({
  customLinks: many(customLinks),
  socialLinks: many(socialLinks),
  services: many(services),
  widgetSettings: many(widgetSettings),
}));

export const customLinksRelations = relations(customLinks, ({ one }) => ({
  profile: one(profiles, {
    fields: [customLinks.profileId],
    references: [profiles.id],
  }),
}));

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  profile: one(profiles, {
    fields: [socialLinks.profileId],
    references: [profiles.id],
  }),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  profile: one(profiles, {
    fields: [services.profileId],
    references: [profiles.id],
  }),
}));

export const widgetSettingsRelations = relations(widgetSettings, ({ one }) => ({
  profile: one(profiles, {
    fields: [widgetSettings.profileId],
    references: [profiles.id],
  }),
}));

// ============================================
// TYPES
// ============================================
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type CustomLink = typeof customLinks.$inferSelect;
export type NewCustomLink = typeof customLinks.$inferInsert;

export type SocialLink = typeof socialLinks.$inferSelect;
export type NewSocialLink = typeof socialLinks.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type WidgetSetting = typeof widgetSettings.$inferSelect;
export type NewWidgetSetting = typeof widgetSettings.$inferInsert;
