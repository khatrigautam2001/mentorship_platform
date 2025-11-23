import {
  users,
  skills,
  roadmapItems,
  progress,
  mockInterviewRequests,
  badges,
  payments,
  individualSkills,
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

  // Individual skill operations
  getIndividualSkillsByMenteeId(menteeId: string): Promise<any[]>;
  createIndividualSkill(menteeId: string, name: string, description?: string): Promise<any>;
  updateIndividualSkill(id: string, updates: { name: string; description?: string }): Promise<any>;
  deleteIndividualSkill(id: string): Promise<void>;

  // Individual roadmap item operations
  getIndividualRoadmapItemsByMenteeId(menteeId: string): Promise<any[]>;
  createIndividualRoadmapItem(item: InsertIndividualRoadmapItem): Promise<any>;
  deleteIndividualRoadmapItem(id: string): Promise<void>;
  deleteAllIndividualRoadmapItemsForMentee(menteeId: string): Promise<void>;
  deleteIndividualRoadmapItemsBySkillId(menteeId: string, skillId: string): Promise<void>;

  // Reorder operations
  reorderRoadmapItem(itemId: string, newOrder: number): Promise<void>;
  reorderSkill(skillId: string, newOrder: number): Promise<void>;
  reorderIndividualRoadmapItem(itemId: string, newOrder: number, menteeId: string): Promise<void>;
  reorderSkillForMentee(skillId: string, newOrder: number, menteeId: string): Promise<void>;
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

  async updateSkill(id: string, updates: Partial<InsertSkill>): Promise<Skill | undefined> {
    const [skill] = await db
      .update(skills)
      .set(updates)
      .where(eq(skills.id, id))
      .returning();
    return skill || undefined;
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

  async updateRoadmapItem(id: string, updates: Partial<InsertRoadmapItem>): Promise<RoadmapItem | undefined> {
    const [item] = await db
      .update(roadmapItems)
      .set(updates)
      .where(eq(roadmapItems.id, id))
      .returning();
    return item || undefined;
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

  async updateIndividualRoadmapItem(id: string, updates: Partial<InsertIndividualRoadmapItem>): Promise<any> {
    const [item] = await db
      .update(individualRoadmapItems)
      .set(updates)
      .where(eq(individualRoadmapItems.id, id))
      .returning();
    return item || undefined;
  }

  async deleteIndividualRoadmapItem(id: string): Promise<void> {
    await db.delete(individualRoadmapItems).where(eq(individualRoadmapItems.id, id));
  }

  async deleteAllIndividualRoadmapItemsForMentee(menteeId: string): Promise<void> {
    await db.delete(individualRoadmapItems).where(eq(individualRoadmapItems.menteeId, menteeId));
  }

  async deleteIndividualRoadmapItemsBySkillId(menteeId: string, skillId: string): Promise<void> {
    await db.delete(individualRoadmapItems).where(
      and(eq(individualRoadmapItems.menteeId, menteeId), eq(individualRoadmapItems.skillId, skillId))
    );
  }

  // Individual skill operations
  async getIndividualSkillsByMenteeId(menteeId: string): Promise<any[]> {
    return db.select().from(individualSkills).where(eq(individualSkills.menteeId, menteeId)).orderBy(individualSkills.order);
  }

  async createIndividualSkill(menteeId: string, name: string, description?: string): Promise<any> {
    const existingSkills = await db.select().from(individualSkills).where(eq(individualSkills.menteeId, menteeId));
    const [skill] = await db
      .insert(individualSkills)
      .values({
        menteeId,
        name,
        description: description || null,
        order: existingSkills.length,
      })
      .returning();
    return skill;
  }

  async updateIndividualSkill(id: string, updates: { name: string; description?: string }): Promise<any> {
    const [skill] = await db
      .update(individualSkills)
      .set(updates)
      .where(eq(individualSkills.id, id))
      .returning();
    return skill || undefined;
  }

  async deleteIndividualSkill(id: string): Promise<void> {
    const [skill] = await db.select().from(individualSkills).where(eq(individualSkills.id, id));
    if (skill) {
      await db.delete(individualRoadmapItems).where(eq(individualRoadmapItems.individualSkillId, id));
      await db.delete(individualSkills).where(eq(individualSkills.id, id));
    }
  }

  async reorderRoadmapItem(itemId: string, newOrder: number): Promise<void> {
    const [item] = await db.select().from(roadmapItems).where(eq(roadmapItems.id, itemId));
    if (!item) throw new Error("Item not found");
    
    // Get all items in the same skill
    const allItems = await db.select().from(roadmapItems).where(eq(roadmapItems.skillId, item.skillId));
    const oldOrder = item.order;
    
    if (newOrder > oldOrder) {
      // Moving down: shift items between oldOrder and newOrder
      const itemsToUpdate = allItems.filter(i => i.order > oldOrder && i.order <= newOrder);
      for (const i of itemsToUpdate) {
        await db.update(roadmapItems).set({ order: i.order - 1 }).where(eq(roadmapItems.id, i.id));
      }
    } else if (newOrder < oldOrder) {
      // Moving up: shift items between newOrder and oldOrder
      const itemsToUpdate = allItems.filter(i => i.order >= newOrder && i.order < oldOrder);
      for (const i of itemsToUpdate) {
        await db.update(roadmapItems).set({ order: i.order + 1 }).where(eq(roadmapItems.id, i.id));
      }
    }
    
    // Set the new order for the item being moved
    await db.update(roadmapItems).set({ order: newOrder }).where(eq(roadmapItems.id, itemId));
  }

  async reorderSkill(skillId: string, newOrder: number): Promise<void> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, skillId));
    if (!skill) throw new Error("Skill not found");
    
    const allSkills = await db.select().from(skills);
    const oldOrder = skill.order;
    
    if (newOrder > oldOrder) {
      const skillsToUpdate = allSkills.filter(s => s.order > oldOrder && s.order <= newOrder);
      for (const s of skillsToUpdate) {
        await db.update(skills).set({ order: s.order - 1 }).where(eq(skills.id, s.id));
      }
    } else if (newOrder < oldOrder) {
      const skillsToUpdate = allSkills.filter(s => s.order >= newOrder && s.order < oldOrder);
      for (const s of skillsToUpdate) {
        await db.update(skills).set({ order: s.order + 1 }).where(eq(skills.id, s.id));
      }
    }
    
    await db.update(skills).set({ order: newOrder }).where(eq(skills.id, skillId));
  }

  async reorderIndividualRoadmapItem(itemId: string, newOrder: number, menteeId: string): Promise<void> {
    // First check if item is in individualRoadmapItems (already customized)
    const [individualItem] = await db.select().from(individualRoadmapItems).where(eq(individualRoadmapItems.id, itemId));
    
    if (individualItem) {
      // Item is already individual, just reorder within the appropriate scope
      const isCustomSkill = individualItem.individualSkillId !== null;
      
      // Get all items for this skill/scope
      let allItems;
      if (isCustomSkill) {
        allItems = await db.select().from(individualRoadmapItems)
          .where(eq(individualRoadmapItems.individualSkillId, individualItem.individualSkillId))
          .orderBy(individualRoadmapItems.order);
      } else {
        allItems = await db.select().from(individualRoadmapItems)
          .where(eq(individualRoadmapItems.skillId, individualItem.skillId))
          .orderBy(individualRoadmapItems.order);
      }
      
      // Create a reordered list: remove item from current position, insert at new position
      const itemsWithoutDragged = allItems.filter(i => i.id !== itemId);
      const reorderedItems = [
        ...itemsWithoutDragged.slice(0, newOrder),
        individualItem,
        ...itemsWithoutDragged.slice(newOrder),
      ];
      
      // Update all items with their new order values
      for (let i = 0; i < reorderedItems.length; i++) {
        await db.update(individualRoadmapItems).set({ order: i }).where(eq(individualRoadmapItems.id, reorderedItems[i].id));
      }
    } else {
      // Item is from roadmapItems (global), need to convert all items in that skill to individual items first
      const [globalItem] = await db.select().from(roadmapItems).where(eq(roadmapItems.id, itemId));
      if (!globalItem) throw new Error("Item not found");
      
      // Check if there are already individual items for this skill
      const existingIndividualItems = await db.select().from(individualRoadmapItems)
        .where(and(eq(individualRoadmapItems.skillId, globalItem.skillId), eq(individualRoadmapItems.menteeId, menteeId)))
        .orderBy(individualRoadmapItems.order);
      
      if (existingIndividualItems.length === 0) {
        // Convert all global items of this skill to individual items
        const allGlobalItems = await db.select().from(roadmapItems)
          .where(eq(roadmapItems.skillId, globalItem.skillId))
          .orderBy(roadmapItems.order);
        
        const createdIndividualItems = await Promise.all(
          allGlobalItems.map(async (item, index) => {
            const [created] = await db.insert(individualRoadmapItems).values({
              menteeId,
              skillId: item.skillId,
              individualSkillId: null,
              title: item.title,
              resourceUrl: item.resourceUrl,
              isMockInterview: item.isMockInterview,
              order: index,
            }).returning();
            return created;
          })
        );
        
        // Find the newly created item that corresponds to the dragged item
        const draggedItemIndex = allGlobalItems.findIndex(i => i.id === itemId);
        const draggedCreatedItem = createdIndividualItems[draggedItemIndex];
        
        // Reorder the items using the same list-based approach
        const itemsWithoutDragged = createdIndividualItems.filter((_, idx) => idx !== draggedItemIndex);
        const reorderedItems = [
          ...itemsWithoutDragged.slice(0, newOrder),
          draggedCreatedItem,
          ...itemsWithoutDragged.slice(newOrder),
        ];
        
        // Update all items with their new order values
        for (let i = 0; i < reorderedItems.length; i++) {
          await db.update(individualRoadmapItems).set({ order: i }).where(eq(individualRoadmapItems.id, reorderedItems[i].id));
        }
      } else {
        // Individual items already exist for this skill, just update the order in the existing items
        const allItems = existingIndividualItems.sort((a, b) => a.order - b.order);
        
        // Find the individual item that corresponds to this global item
        const correspondingIndividualItem = allItems.find(i => i.title === globalItem.title && i.skillId === globalItem.skillId);
        if (!correspondingIndividualItem) throw new Error("Corresponding individual item not found");
        
        // Reorder the items using the same list-based approach
        const itemsWithoutDragged = allItems.filter(i => i.id !== correspondingIndividualItem.id);
        const reorderedItems = [
          ...itemsWithoutDragged.slice(0, newOrder),
          correspondingIndividualItem,
          ...itemsWithoutDragged.slice(newOrder),
        ];
        
        // Update all items with their new order values
        for (let i = 0; i < reorderedItems.length; i++) {
          await db.update(individualRoadmapItems).set({ order: i }).where(eq(individualRoadmapItems.id, reorderedItems[i].id));
        }
      }
    }
  }

  async reorderSkillForMentee(skillId: string, newOrder: number, menteeId: string): Promise<void> {
    // Check if this is an individual skill or a global skill
    const [individualSkill] = await db.select().from(individualSkills).where(eq(individualSkills.id, skillId));
    
    if (individualSkill && individualSkill.menteeId === menteeId) {
      // It's an individual skill, reorder it
      const allIndividualSkills = await db.select().from(individualSkills)
        .where(eq(individualSkills.menteeId, menteeId))
        .orderBy(individualSkills.order);
      
      // Build new order: remove from old position, insert at new position
      const skillsWithoutDragged = allIndividualSkills.filter(s => s.id !== skillId);
      const reorderedSkills = [
        ...skillsWithoutDragged.slice(0, newOrder),
        individualSkill,
        ...skillsWithoutDragged.slice(newOrder),
      ];
      
      // Update all skills with new order values
      for (let i = 0; i < reorderedSkills.length; i++) {
        await db.update(individualSkills).set({ order: i }).where(eq(individualSkills.id, reorderedSkills[i].id));
      }
    } else {
      // It's a global skill - check if we already have individual items for this skill
      const existingIndividualItems = await db.select().from(individualRoadmapItems)
        .where(and(
          eq(individualRoadmapItems.menteeId, menteeId),
          eq(individualRoadmapItems.skillId, skillId)
        ));
      
      const menteeIndividualSkills = await db.select().from(individualSkills)
        .where(eq(individualSkills.menteeId, menteeId))
        .orderBy(individualSkills.order);
      
      if (existingIndividualItems.length > 0) {
        // We already have an individual skill wrapper for this global skill - just reorder it
        const individualSkillWrapper = await db.select().from(individualSkills)
          .where(eq(individualSkills.id, existingIndividualItems[0].individualSkillId));
        
        if (individualSkillWrapper.length > 0) {
          const wrapperSkill = individualSkillWrapper[0];
          
          // Reorder the wrapper skill
          const skillsWithoutDragged = menteeIndividualSkills.filter(s => s.id !== wrapperSkill.id);
          const reorderedSkills = [
            ...skillsWithoutDragged.slice(0, newOrder),
            wrapperSkill,
            ...skillsWithoutDragged.slice(newOrder),
          ];
          
          for (let i = 0; i < reorderedSkills.length; i++) {
            await db.update(individualSkills).set({ order: i }).where(eq(individualSkills.id, reorderedSkills[i].id));
          }
        }
      } else {
        // First time reordering this global skill - create an individual wrapper
        const globalSkill = await storage.getSkillById(skillId);
        if (!globalSkill) throw new Error("Global skill not found");
        
        // Create a new individual skill wrapper
        const [newIndividualSkill] = await db.insert(individualSkills).values({
          menteeId,
          name: globalSkill.name,
          description: globalSkill.description,
          order: newOrder,
        }).returning();
        
        // Convert all global items of this skill to individual items (only once)
        const globalItems = await storage.getRoadmapItemsBySkillId(skillId);
        for (let i = 0; i < globalItems.length; i++) {
          await db.insert(individualRoadmapItems).values({
            menteeId,
            skillId: skillId,
            individualSkillId: newIndividualSkill.id,
            title: globalItems[i].title,
            resourceUrl: globalItems[i].resourceUrl,
            isMockInterview: globalItems[i].isMockInterview,
            order: i,
          });
        }
        
        // Update other individual skills' orders to shift them down
        const otherSkills = menteeIndividualSkills.slice(newOrder);
        for (let i = 0; i < otherSkills.length; i++) {
          await db.update(individualSkills).set({ order: newOrder + 1 + i }).where(eq(individualSkills.id, otherSkills[i].id));
        }
      }
    }
  }
}

export const storage = new DatabaseStorage();
