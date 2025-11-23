import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  plainPassword: text("plain_password"),
  role: text("role").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  photo: text("photo"),
  mentorId: varchar("mentor_id").references(() => users.id, { onDelete: 'set null' }),
  totalFee: decimal("total_fee", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const skills = pgTable("skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  badgeIcon: text("badge_icon"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const roadmapItems = pgTable("roadmap_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  skillId: varchar("skill_id").notNull().references(() => skills.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  isMockInterview: boolean("is_mock_interview").default(false).notNull(),
  resourceUrl: text("resource_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const progress = pgTable("progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  menteeId: varchar("mentee_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemId: varchar("item_id").notNull().references(() => roadmapItems.id, { onDelete: 'cascade' }),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
});

export const mockInterviewRequests = pgTable("mock_interview_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  menteeId: varchar("mentee_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: varchar("skill_id").notNull().references(() => skills.id, { onDelete: 'cascade' }),
  status: text("status").notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  menteeId: varchar("mentee_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: varchar("skill_id").notNull().references(() => skills.id, { onDelete: 'cascade' }),
  awardedAt: timestamp("awarded_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  menteeId: varchar("mentee_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const individualRoadmapItems = pgTable("individual_roadmap_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  menteeId: varchar("mentee_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillId: varchar("skill_id").notNull().references(() => skills.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  isMockInterview: boolean("is_mock_interview").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  mentees: many(users, { relationName: "mentor_mentees" }),
  mentor: one(users, {
    fields: [users.mentorId],
    references: [users.id],
    relationName: "mentor_mentees",
  }),
  progress: many(progress),
  mockInterviewRequests: many(mockInterviewRequests),
  badges: many(badges),
  payments: many(payments),
  individualRoadmapItems: many(individualRoadmapItems),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  roadmapItems: many(roadmapItems),
  mockInterviewRequests: many(mockInterviewRequests),
  badges: many(badges),
  individualRoadmapItems: many(individualRoadmapItems),
}));

export const roadmapItemsRelations = relations(roadmapItems, ({ one, many }) => ({
  skill: one(skills, {
    fields: [roadmapItems.skillId],
    references: [skills.id],
  }),
  progress: many(progress),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  mentee: one(users, {
    fields: [progress.menteeId],
    references: [users.id],
  }),
  item: one(roadmapItems, {
    fields: [progress.itemId],
    references: [roadmapItems.id],
  }),
}));

export const mockInterviewRequestsRelations = relations(mockInterviewRequests, ({ one }) => ({
  mentee: one(users, {
    fields: [mockInterviewRequests.menteeId],
    references: [mockInterviewRequests.id],
  }),
  skill: one(skills, {
    fields: [mockInterviewRequests.skillId],
    references: [skills.id],
  }),
}));

export const badgesRelations = relations(badges, ({ one }) => ({
  mentee: one(users, {
    fields: [badges.menteeId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [badges.skillId],
    references: [skills.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  mentee: one(users, {
    fields: [payments.menteeId],
    references: [users.id],
  }),
}));

export const individualRoadmapItemsRelations = relations(individualRoadmapItems, ({ one }) => ({
  mentee: one(users, {
    fields: [individualRoadmapItems.menteeId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [individualRoadmapItems.skillId],
    references: [skills.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
});

export const insertRoadmapItemSchema = createInsertSchema(roadmapItems).omit({
  id: true,
  createdAt: true,
});

export const insertProgressSchema = createInsertSchema(progress).omit({
  id: true,
});

export const insertMockInterviewRequestSchema = createInsertSchema(mockInterviewRequests).omit({
  id: true,
  requestedAt: true,
  resolvedAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  awardedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertIndividualRoadmapItemSchema = createInsertSchema(individualRoadmapItems).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Skill = typeof skills.$inferSelect;
export type InsertRoadmapItem = z.infer<typeof insertRoadmapItemSchema>;
export type RoadmapItem = typeof roadmapItems.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progress.$inferSelect;
export type InsertMockInterviewRequest = z.infer<typeof insertMockInterviewRequestSchema>;
export type MockInterviewRequest = typeof mockInterviewRequests.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertIndividualRoadmapItem = z.infer<typeof insertIndividualRoadmapItemSchema>;
export type IndividualRoadmapItem = typeof individualRoadmapItems.$inferSelect;
