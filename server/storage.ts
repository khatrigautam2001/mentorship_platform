import {
  users,
  skills,
  roadmapItems,
  progress,
  mockInterviewRequests,
  badges,
  payments,
  individualRoadmapItems,
  type User,
  type InsertUser,
  type Skill,
  type InsertSkill,
  type RoadmapItem,
  type InsertRoadmapItem,
  type Progress,
  type InsertProgress,
  type MockInterviewRequest,
  type InsertMockInterviewRequest,
  type Badge,
  type InsertBadge,
  type Payment,
  type InsertPayment,
  type InsertIndividualRoadmapItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getMenteesByMentorId(mentorId: string): Promise<User[]>;

  // Skill operations
  getAllSkills(): Promise<Skill[]>;
  getSkillById(id: string): Promise<Skill | undefined>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  deleteSkill(id: string): Promise<void>;

  // Roadmap item operations
  getRoadmapItemsBySkillId(skillId: string): Promise<RoadmapItem[]>;
  getAllRoadmapItems(): Promise<RoadmapItem[]>;
  createRoadmapItem(item: InsertRoadmapItem): Promise<RoadmapItem>;
  deleteRoadmapItem(id: string): Promise<void>;

  // Progress operations
  getProgressByMenteeId(menteeId: string): Promise<Progress[]>;
  createProgress(progress: InsertProgress): Promise<Progress>;
  updateProgress(id: string, updates: Partial<InsertProgress>): Promise<Progress | undefined>;

  // Mock interview request operations
  getMockInterviewRequestsByMentorId(mentorId: string): Promise<MockInterviewRequest[]>;
  getMockInterviewRequestsByMenteeId(menteeId: string): Promise<MockInterviewRequest[]>;
  createMockInterviewRequest(request: InsertMockInterviewRequest): Promise<MockInterviewRequest>;
  updateMockInterviewRequest(id: string, updates: Partial<InsertMockInterviewRequest>): Promise<MockInterviewRequest | undefined>;

  // Badge operations
  getBadgesByMenteeId(menteeId: string): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;

  // Payment operations
  getPaymentsByMenteeId(menteeId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;

  // Individual roadmap item operations
  getIndividualRoadmapItemsByMenteeId(menteeId: string): Promise<any[]>;
  createIndividualRoadmapItem(item: InsertIndividualRoadmapItem): Promise<any>;
  deleteIndividualRoadmapItem(id: string): Promise<void>;
  deleteAllIndividualRoadmapItemsForMentee(menteeId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getMenteesByMentorId(mentorId: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.mentorId, mentorId));
  }

  // Skill operations
  async getAllSkills(): Promise<Skill[]> {
    return db.select().from(skills).orderBy(skills.order);
  }

  async getSkillById(id: string): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill || undefined;
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const [skill] = await db
      .insert(skills)
      .values(insertSkill)
      .returning();
    return skill;
  }

  async deleteSkill(id: string): Promise<void> {
    await db.delete(roadmapItems).where(eq(roadmapItems.skillId, id));
    await db.delete(skills).where(eq(skills.id, id));
  }

  // Roadmap item operations
  async getRoadmapItemsBySkillId(skillId: string): Promise<RoadmapItem[]> {
    return db.select().from(roadmapItems).where(eq(roadmapItems.skillId, skillId)).orderBy(roadmapItems.order);
  }

  async getAllRoadmapItems(): Promise<RoadmapItem[]> {
    return db.select().from(roadmapItems).orderBy(roadmapItems.order);
  }

  async createRoadmapItem(insertItem: InsertRoadmapItem): Promise<RoadmapItem> {
    const [item] = await db
      .insert(roadmapItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async deleteRoadmapItem(id: string): Promise<void> {
    await db.delete(roadmapItems).where(eq(roadmapItems.id, id));
  }

  // Progress operations
  async getProgressByMenteeId(menteeId: string): Promise<Progress[]> {
    return db.select().from(progress).where(eq(progress.menteeId, menteeId));
  }

  async createProgress(insertProgress: InsertProgress): Promise<Progress> {
    const [prog] = await db
      .insert(progress)
      .values(insertProgress)
      .returning();
    return prog;
  }

  async updateProgress(id: string, updates: Partial<InsertProgress>): Promise<Progress | undefined> {
    const [prog] = await db
      .update(progress)
      .set(updates)
      .where(eq(progress.id, id))
      .returning();
    return prog || undefined;
  }

  // Mock interview request operations
  async getMockInterviewRequestsByMentorId(mentorId: string): Promise<MockInterviewRequest[]> {
    const mentees = await this.getMenteesByMentorId(mentorId);
    const menteeIds = mentees.map(m => m.id);
    
    if (menteeIds.length === 0) return [];
    
    return db
      .select()
      .from(mockInterviewRequests)
      .where(inArray(mockInterviewRequests.menteeId, menteeIds))
      .orderBy(desc(mockInterviewRequests.requestedAt));
  }

  async getMockInterviewRequestsByMenteeId(menteeId: string): Promise<MockInterviewRequest[]> {
    return db
      .select()
      .from(mockInterviewRequests)
      .where(eq(mockInterviewRequests.menteeId, menteeId))
      .orderBy(desc(mockInterviewRequests.requestedAt));
  }

  async createMockInterviewRequest(insertRequest: InsertMockInterviewRequest): Promise<MockInterviewRequest> {
    const [request] = await db
      .insert(mockInterviewRequests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async updateMockInterviewRequest(id: string, updates: Partial<InsertMockInterviewRequest>): Promise<MockInterviewRequest | undefined> {
    const [request] = await db
      .update(mockInterviewRequests)
      .set(updates)
      .where(eq(mockInterviewRequests.id, id))
      .returning();
    return request || undefined;
  }

  // Badge operations
  async getBadgesByMenteeId(menteeId: string): Promise<Badge[]> {
    return db.select().from(badges).where(eq(badges.menteeId, menteeId));
  }

  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const [badge] = await db
      .insert(badges)
      .values(insertBadge)
      .returning();
    return badge;
  }

  // Payment operations
  async getPaymentsByMenteeId(menteeId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.menteeId, menteeId)).orderBy(desc(payments.date));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values(insertPayment)
      .returning();
    return payment;
  }

  // Individual roadmap item operations
  async getIndividualRoadmapItemsByMenteeId(menteeId: string): Promise<any[]> {
    return db.select().from(individualRoadmapItems).where(eq(individualRoadmapItems.menteeId, menteeId)).orderBy(individualRoadmapItems.order);
  }

  async createIndividualRoadmapItem(insertItem: InsertIndividualRoadmapItem): Promise<any> {
    const [item] = await db
      .insert(individualRoadmapItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async deleteIndividualRoadmapItem(id: string): Promise<void> {
    await db.delete(individualRoadmapItems).where(eq(individualRoadmapItems.id, id));
  }

  async deleteAllIndividualRoadmapItemsForMentee(menteeId: string): Promise<void> {
    await db.delete(individualRoadmapItems).where(eq(individualRoadmapItems.menteeId, menteeId));
  }
}

export const storage = new DatabaseStorage();
