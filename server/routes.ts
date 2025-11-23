import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { insertUserSchema, insertSkillSchema, insertRoadmapItemSchema, insertPaymentSchema } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Middleware to check if user is authenticated
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Middleware to check if user is a mentor
async function requireMentor(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "mentor") {
    return res.status(403).json({ message: "Forbidden - Mentor access only" });
  }
  next();
}

// Middleware to check if user is a mentee
async function requireMentee(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "mentee") {
    return res.status(403).json({ message: "Forbidden - Mentee access only" });
  }
  next();
}

// Generate random password
function generatePassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Mentor routes
  app.post("/api/mentor/create-mentee", requireMentor, async (req: Request, res: Response) => {
    try {
      const { name, email, phone, totalFee, initialPayment } = req.body;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const generatedPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      const mentee = await storage.createUser({
        email,
        password: hashedPassword,
        plainPassword: generatedPassword,
        role: "mentee",
        name,
        phone: phone || "",
        photo: "",
        mentorId: req.session.userId!,
        totalFee: totalFee ? String(totalFee) : null,
      });

      // Create initial payment if provided
      if (initialPayment && parseFloat(initialPayment) > 0) {
        await storage.createPayment({
          menteeId: mentee.id,
          amount: initialPayment,
          date: new Date(),
          notes: "Initial payment",
        });
      }

      res.json({
        mentee: { ...mentee, password: undefined, plainPassword: undefined },
        credentials: {
          email: mentee.email,
          password: generatedPassword,
        },
      });
    } catch (error) {
      console.error("Create mentee error:", error);
      res.status(500).json({ message: "Failed to create mentee" });
    }
  });

  app.get("/api/mentor/students", requireMentor, async (req: Request, res: Response) => {
    try {
      const mentees = await storage.getMenteesByMentorId(req.session.userId!);
      const allSkills = await storage.getAllSkills();

      const studentsWithProgress = await Promise.all(
        mentees.map(async (mentee) => {
          const progressRecords = await storage.getProgressByMenteeId(mentee.id);
          const badgesList = await storage.getBadgesByMenteeId(mentee.id);
          
          // Check if mentee has individual roadmap customization
          const individualItems = await storage.getIndividualRoadmapItemsByMenteeId(mentee.id);
          const hasIndividualCustomization = individualItems.length > 0;
          
          let skillsWithItems;
          if (hasIndividualCustomization) {
            // Use individual customized roadmap - include items with skillId
            skillsWithItems = await Promise.all(
              allSkills.map(async (skill) => {
                const items = individualItems.filter(item => item.skillId === skill.id);
                return { ...skill, items };
              })
            );
          } else {
            // Use global roadmap
            skillsWithItems = await Promise.all(
              allSkills.map(async (skill) => {
                const items = await storage.getRoadmapItemsBySkillId(skill.id);
                return { ...skill, items };
              })
            );
          }
          
          // Calculate progress
          const allItems = skillsWithItems.flatMap(s => s.items);
          const completedItems = progressRecords.filter(p => p.completed).length;
          const totalItems = allItems.length;
          const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

          // Find current skill - the first uncompleted item (iterate through skills and items sequentially)
          let currentSkill: string | undefined = undefined;
          for (const skill of skillsWithItems) {
            for (const item of skill.items) {
              const isCompleted = progressRecords.some(p => p.itemId === item.id && p.completed);
              if (!isCompleted) {
                currentSkill = skill.name;
                break;
              }
            }
            if (currentSkill) break;
          }

          return {
            ...mentee,
            password: undefined,
            progressPercentage,
            badgeCount: badgesList.length,
            currentSkill,
          };
        })
      );

      res.json(studentsWithProgress);
    } catch (error) {
      console.error("Get students error:", error);
      res.status(500).json({ message: "Failed to get students" });
    }
  });

  app.get("/api/mentor/students/:id/credentials", requireMentor, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const mentee = await storage.getUser(id);
      
      if (!mentee || mentee.mentorId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json({
        email: mentee.email,
        password: mentee.plainPassword || "Password not available",
      });
    } catch (error) {
      console.error("Get credentials error:", error);
      res.status(500).json({ message: "Failed to get credentials" });
    }
  });

  app.delete("/api/mentor/students/:id", requireMentor, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const mentee = await storage.getUser(id);
      
      if (!mentee || mentee.mentorId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Delete all related data (cascade is handled by DB constraints)
      await storage.deleteUser(id);

      res.json({ message: "Student removed successfully" });
    } catch (error) {
      console.error("Delete student error:", error);
      res.status(500).json({ message: "Failed to remove student" });
    }
  });

  app.get("/api/mentor/stats", requireMentor, async (req: Request, res: Response) => {
    try {
      const mentees = await storage.getMenteesByMentorId(req.session.userId!);
      const requests = await storage.getMockInterviewRequestsByMentorId(req.session.userId!);
      
      let totalRevenue = 0;
      let pendingDues = 0;

      for (const mentee of mentees) {
        const paymentsRecords = await storage.getPaymentsByMenteeId(mentee.id);
        const totalPaid = paymentsRecords.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
        const totalFee = mentee.totalFee ? parseFloat(mentee.totalFee.toString()) : 0;
        
        totalRevenue += totalPaid;
        pendingDues += totalFee - totalPaid;
      }

      // Calculate average completion
      const allRoadmapItems = await storage.getAllRoadmapItems();
      let totalProgress = 0;

      for (const mentee of mentees) {
        const progressRecords = await storage.getProgressByMenteeId(mentee.id);
        const completedItems = progressRecords.filter(p => p.completed).length;
        const percentage = allRoadmapItems.length > 0 ? (completedItems / allRoadmapItems.length) * 100 : 0;
        totalProgress += percentage;
      }

      const avgCompletion = mentees.length > 0 ? Math.round(totalProgress / mentees.length) : 0;

      res.json({
        totalMentees: mentees.length,
        totalRevenue,
        pendingDues,
        pendingRequests: requests.filter(r => r.status === "pending").length,
        avgCompletion,
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  app.get("/api/mentor/mock-requests", requireMentor, async (req: Request, res: Response) => {
    try {
      const requests = await storage.getMockInterviewRequestsByMentorId(req.session.userId!);
      const mentees = await storage.getMenteesByMentorId(req.session.userId!);
      const allSkills = await storage.getAllSkills();

      const requestsWithDetails = requests
        .filter(r => r.status === "pending")
        .map(request => {
          const mentee = mentees.find(m => m.id === request.menteeId);
          const skill = allSkills.find(s => s.id === request.skillId);

          return {
            ...request,
            menteeName: mentee?.name || "Unknown",
            menteePhoto: mentee?.photo || null,
            skillName: skill?.name || "Unknown",
          };
        });

      res.json(requestsWithDetails);
    } catch (error) {
      console.error("Get mock requests error:", error);
      res.status(500).json({ message: "Failed to get mock requests" });
    }
  });

  app.post("/api/mentor/mock-requests/:id/approve", requireMentor, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const request = await storage.updateMockInterviewRequest(id, {
        status: "approved",
      });

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      // Award badge
      await storage.createBadge({
        menteeId: request.menteeId,
        skillId: request.skillId,
      });

      // Mark the mock interview item as complete
      const skillItems = await storage.getRoadmapItemsBySkillId(request.skillId);
      const mockItem = skillItems.find(item => item.isMockInterview);
      
      if (mockItem) {
        const existingProgress = await storage.getProgressByMenteeId(request.menteeId);
        const mockProgress = existingProgress.find(p => p.itemId === mockItem.id);
        
        if (mockProgress) {
          await storage.updateProgress(mockProgress.id, {
            completed: true,
            completedAt: new Date(),
          });
        } else {
          await storage.createProgress({
            menteeId: request.menteeId,
            itemId: mockItem.id,
            completed: true,
            completedAt: new Date(),
          });
        }

        // Unlock the first item of the next skill
        const allSkills = await storage.getAllSkills();
        const currentSkillIndex = allSkills.findIndex(s => s.id === request.skillId);
        
        if (currentSkillIndex >= 0 && currentSkillIndex < allSkills.length - 1) {
          const nextSkill = allSkills[currentSkillIndex + 1];
          const nextSkillItems = await storage.getRoadmapItemsBySkillId(nextSkill.id);
          
          // The first item of the next skill is now unlocked (no action needed - it will be checked in the frontend)
          // The sequential unlock logic in complete-item endpoint will handle this
        }
      }

      res.json(request);
    } catch (error) {
      console.error("Approve request error:", error);
      res.status(500).json({ message: "Failed to approve request" });
    }
  });

  app.post("/api/mentor/mock-requests/:id/reject", requireMentor, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const request = await storage.updateMockInterviewRequest(id, {
        status: "rejected",
      });

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json(request);
    } catch (error) {
      console.error("Reject request error:", error);
      res.status(500).json({ message: "Failed to reject request" });
    }
  });

  app.get("/api/mentor/payment-portfolio", requireMentor, async (req: Request, res: Response) => {
    try {
      const mentees = await storage.getMenteesByMentorId(req.session.userId!);

      const portfolio = await Promise.all(
        mentees.map(async (mentee) => {
          const paymentsRecords = await storage.getPaymentsByMenteeId(mentee.id);
          const totalPaid = paymentsRecords.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
          const totalFee = mentee.totalFee ? parseFloat(mentee.totalFee.toString()) : 0;
          const lastPayment = paymentsRecords[0];

          return {
            menteeId: mentee.id,
            menteeName: mentee.name,
            totalFee,
            totalPaid,
            remaining: totalFee - totalPaid,
            lastPaymentDate: lastPayment ? lastPayment.date : null,
          };
        })
      );

      res.json(portfolio);
    } catch (error) {
      console.error("Get payment portfolio error:", error);
      res.status(500).json({ message: "Failed to get payment portfolio" });
    }
  });

  app.post("/api/mentor/add-payment", requireMentor, async (req: Request, res: Response) => {
    try {
      const { menteeId, amount, date, notes } = req.body;

      const payment = await storage.createPayment({
        menteeId,
        amount,
        date: new Date(date),
        notes: notes || null,
      });

      res.json(payment);
    } catch (error) {
      console.error("Add payment error:", error);
      res.status(500).json({ message: "Failed to add payment" });
    }
  });

  app.patch("/api/mentor/profile", requireMentor, async (req: Request, res: Response) => {
    try {
      const { name, phone, photo } = req.body;
      
      const user = await storage.updateUser(req.session.userId!, {
        name,
        phone: phone || null,
        photo: photo || null,
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Roadmap routes (accessible to mentors)
  app.get("/api/roadmap/global", requireMentor, async (req: Request, res: Response) => {
    try {
      const skills = await storage.getAllSkills();
      
      const skillsWithItems = await Promise.all(
        skills.map(async (skill) => {
          const items = await storage.getRoadmapItemsBySkillId(skill.id);
          return { ...skill, items };
        })
      );

      res.json(skillsWithItems);
    } catch (error) {
      console.error("Get global roadmap error:", error);
      res.status(500).json({ message: "Failed to get roadmap" });
    }
  });

  app.post("/api/roadmap/skills", requireMentor, async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      
      const allSkills = await storage.getAllSkills();
      const maxOrder = allSkills.length > 0 ? Math.max(...allSkills.map(s => s.order)) : -1;

      const skill = await storage.createSkill({
        name,
        description: description || null,
        order: maxOrder + 1,
        badgeIcon: null,
      });

      res.json(skill);
    } catch (error) {
      console.error("Create skill error:", error);
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  app.delete("/api/roadmap/skills/:id", requireMentor, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteSkill(id);
      res.json({ message: "Skill deleted" });
    } catch (error) {
      console.error("Delete skill error:", error);
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });

  app.patch("/api/roadmap/skills/:id", requireMentor, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      const skill = await storage.updateSkill(id, {
        name,
        description: description || null,
      });
      
      res.json(skill);
    } catch (error) {
      console.error("Update skill error:", error);
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  app.post("/api/roadmap/items", requireMentor, async (req: Request, res: Response) => {
    try {
      const { skillId, title, resourceUrl } = req.body;
      
      const existingItems = await storage.getRoadmapItemsBySkillId(skillId);
      const maxOrder = existingItems.length > 0 ? Math.max(...existingItems.map(i => i.order)) : -1;

      const item = await storage.createRoadmapItem({
        skillId,
        title,
        order: maxOrder + 1,
        isMockInterview: false,
        resourceUrl: resourceUrl || null,
      });

      res.json(item);
    } catch (error) {
      console.error("Create item error:", error);
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  app.patch("/api/roadmap/items/:id", requireMentor, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, resourceUrl } = req.body;
      
      const item = await storage.updateRoadmapItem(id, {
        title,
        resourceUrl: resourceUrl || null,
      });
      
      res.json(item);
    } catch (error) {
      console.error("Update item error:", error);
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  app.delete("/api/roadmap/items/:id", requireMentor, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteRoadmapItem(id);
      res.json({ message: "Item deleted" });
    } catch (error) {
      console.error("Delete item error:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  app.patch("/api/roadmap/skills/:id/reorder", requireMentor, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { order } = req.body;
      await storage.reorderSkill(id, order);
      res.json({ message: "Skill reordered" });
    } catch (error) {
      console.error("Reorder skill error:", error);
      res.status(500).json({ message: "Failed to reorder skill" });
    }
  });

  app.patch("/api/roadmap/items/:id/reorder", requireMentor, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { order } = req.body;
      await storage.reorderRoadmapItem(id, order);
      res.json({ message: "Item reordered" });
    } catch (error) {
      console.error("Reorder item error:", error);
      res.status(500).json({ message: "Failed to reorder item" });
    }
  });

  // Mentee routes
  app.get("/api/mentee/learning", requireMentee, async (req: Request, res: Response) => {
    try {
      const progressRecords = await storage.getProgressByMenteeId(req.session.userId!);
      const mockRequests = await storage.getMockInterviewRequestsByMenteeId(req.session.userId!);

      // Check if mentee has individual roadmap customization
      const individualItems = await storage.getIndividualRoadmapItemsByMenteeId(req.session.userId!);
      const individualSkills = await storage.getIndividualSkillsByMenteeId(req.session.userId!);
      
      let skillsWithItems;
      if (individualItems.length > 0 || individualSkills.length > 0) {
        // Return individual customized roadmap grouped by skill
        const globalSkills = await storage.getAllSkills();
        skillsWithItems = await Promise.all(
          globalSkills.map(async (skill) => {
            const items = individualItems.filter(item => item.skillId === skill.id);
            return { ...skill, items };
          })
        );
        
        // Add custom individual skills
        const individualSkillsWithItems = await Promise.all(
          individualSkills.map(async (skill) => {
            const items = await storage.getIndividualRoadmapItemsByMenteeId(req.session.userId!)
              .then(allItems => allItems.filter(item => item.individualSkillId === skill.id));
            return { ...skill, items };
          })
        );
        
        skillsWithItems = [...skillsWithItems, ...individualSkillsWithItems];
      } else {
        // Use global roadmap
        const skills = await storage.getAllSkills();
        skillsWithItems = await Promise.all(
          skills.map(async (skill) => {
            const items = await storage.getRoadmapItemsBySkillId(skill.id);
            return { ...skill, items };
          })
        );
      }

      // Calculate overall progress
      const allItems = skillsWithItems.flatMap(s => s.items);
      const completedCount = progressRecords.filter(p => p.completed).length;
      const overallProgress = allItems.length > 0 ? Math.round((completedCount / allItems.length) * 100) : 0;

      // Find next unlocked item - the first uncompleted item
      let nextUnlocked: string | null = null;
      for (const skill of skillsWithItems) {
        for (const item of skill.items) {
          const isCompleted = progressRecords.some(p => p.itemId === item.id && p.completed);
          if (!isCompleted) {
            nextUnlocked = item.id;
            break;
          }
        }
        if (nextUnlocked) break;
      }

      // If nothing is unlocked yet, unlock the first item
      if (!nextUnlocked && allItems.length > 0) {
        nextUnlocked = allItems[0].id;
      }

      // Mock interview statuses
      const mockInterviewStatuses: Record<string, string> = {};
      mockRequests.forEach(req => {
        if (req.status === "pending") {
          mockInterviewStatuses[req.skillId] = "pending";
        }
      });

      res.json({
        skills: skillsWithItems,
        progress: progressRecords,
        overallProgress,
        nextUnlocked,
        mockInterviewStatuses,
      });
    } catch (error) {
      console.error("Get learning data error:", error);
      res.status(500).json({ message: "Failed to get learning data" });
    }
  });

  app.post("/api/mentee/complete-item/:itemId", requireMentee, async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      
      // Get all skills and items to verify sequential order
      const skills = await storage.getAllSkills();
      const allItems: any[] = [];
      for (const skill of skills) {
        const items = await storage.getRoadmapItemsBySkillId(skill.id);
        allItems.push(...items);
      }

      // Find the item being completed
      const currentItem = allItems.find(item => item.id === itemId);
      if (!currentItem) {
        return res.status(404).json({ message: "Item not found" });
      }

      // Prevent completing mock interview items directly - they need approval
      if (currentItem.isMockInterview) {
        return res.status(400).json({ message: "Mock interview items require mentor approval. Please request approval instead." });
      }

      // Get current progress
      const existingProgress = await storage.getProgressByMenteeId(req.session.userId!);

      // Find the index of the current item in the global sequence
      const currentIndex = allItems.findIndex(item => item.id === itemId);
      
      // Verify that all previous items are complete
      for (let i = 0; i < currentIndex; i++) {
        const previousItem = allItems[i];
        const previousProgress = existingProgress.find(p => p.itemId === previousItem.id);
        
        if (!previousProgress || !previousProgress.completed) {
          return res.status(400).json({ 
            message: "You must complete previous items in sequence before completing this one" 
          });
        }
      }

      // Mark the item as complete
      const itemProgress = existingProgress.find(p => p.itemId === itemId);

      if (itemProgress) {
        await storage.updateProgress(itemProgress.id, {
          completed: true,
          completedAt: new Date(),
        });
      } else {
        await storage.createProgress({
          menteeId: req.session.userId!,
          itemId,
          completed: true,
          completedAt: new Date(),
        });
      }

      res.json({ message: "Progress updated" });
    } catch (error) {
      console.error("Complete item error:", error);
      res.status(500).json({ message: "Failed to complete item" });
    }
  });

  app.post("/api/mentee/request-mock-interview/:skillId", requireMentee, async (req: Request, res: Response) => {
    try {
      const { skillId } = req.params;

      // Check if there's already a pending request
      const existingRequests = await storage.getMockInterviewRequestsByMenteeId(req.session.userId!);
      const pendingRequest = existingRequests.find(
        r => r.skillId === skillId && r.status === "pending"
      );

      if (pendingRequest) {
        return res.status(400).json({ message: "Request already pending" });
      }

      const request = await storage.createMockInterviewRequest({
        menteeId: req.session.userId!,
        skillId,
        status: "pending",
      });

      res.json(request);
    } catch (error) {
      console.error("Request mock interview error:", error);
      res.status(500).json({ message: "Failed to request mock interview" });
    }
  });

  app.get("/api/mentee/badges", requireMentee, async (req: Request, res: Response) => {
    try {
      const badgesList = await storage.getBadgesByMenteeId(req.session.userId!);
      const allSkills = await storage.getAllSkills();

      const badgesWithSkills = badgesList.map(badge => {
        const skill = allSkills.find(s => s.id === badge.skillId);
        return {
          ...badge,
          skillName: skill?.name || "Unknown",
        };
      });

      res.json({
        earnedBadges: badgesWithSkills,
        allSkills,
      });
    } catch (error) {
      console.error("Get badges error:", error);
      res.status(500).json({ message: "Failed to get badges" });
    }
  });

  app.get("/api/mentee/profile", requireMentee, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const paymentsRecords = await storage.getPaymentsByMenteeId(user.id);
      const totalPaid = paymentsRecords.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
      const totalFee = user.totalFee ? parseFloat(user.totalFee.toString()) : 0;

      res.json({
        ...user,
        password: undefined,
        totalPaid,
        remaining: totalFee - totalPaid,
      });
    } catch (error) {
      console.error("Get mentee profile error:", error);
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  app.patch("/api/mentee/profile", requireMentee, async (req: Request, res: Response) => {
    try {
      const { name, phone, photo } = req.body;
      
      const user = await storage.updateUser(req.session.userId!, {
        name,
        phone: phone || null,
        photo: photo || null,
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Individual roadmap customization endpoints
  app.get("/api/roadmap/individual/:menteeId/skills", requireMentor, async (req: Request, res: Response) => {
    try {
      const { menteeId } = req.params;
      
      // Verify mentee belongs to this mentor
      const mentee = await storage.getUser(menteeId);
      if (!mentee || mentee.mentorId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden - Mentee does not belong to you" });
      }

      const skills = await storage.getIndividualSkillsByMenteeId(menteeId);
      res.json(skills);
    } catch (error) {
      console.error("Get individual skills error:", error);
      res.status(500).json({ message: "Failed to get skills" });
    }
  });

  app.get("/api/roadmap/individual/:menteeId", requireMentor, async (req: Request, res: Response) => {
    try {
      const { menteeId } = req.params;
      
      // Verify mentee belongs to this mentor
      const mentee = await storage.getUser(menteeId);
      if (!mentee || mentee.mentorId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden - Mentee does not belong to you" });
      }

      const individualItems = await storage.getIndividualRoadmapItemsByMenteeId(menteeId);
      const individualSkills = await storage.getIndividualSkillsByMenteeId(menteeId);
      
      if (individualItems.length > 0 || individualSkills.length > 0) {
        // Return individual customized roadmap grouped by skill
        const globalSkills = await storage.getAllSkills();
        const skillsWithItems = await Promise.all(
          globalSkills.map(async (skill) => {
            const items = individualItems.filter(item => item.skillId === skill.id);
            return { ...skill, items };
          })
        );
        
        // Add custom individual skills
        const individualSkillsWithItems = await Promise.all(
          individualSkills.map(async (skill) => {
            const items = await storage.getIndividualRoadmapItemsByMenteeId(menteeId)
              .then(allItems => allItems.filter(item => item.individualSkillId === skill.id));
            return { ...skill, items };
          })
        );
        
        res.json([...skillsWithItems, ...individualSkillsWithItems]);
      } else {
        // Return global roadmap for this mentee
        const skills = await storage.getAllSkills();
        const skillsWithItems = await Promise.all(
          skills.map(async (skill) => {
            const items = await storage.getRoadmapItemsBySkillId(skill.id);
            return { ...skill, items };
          })
        );
        res.json(skillsWithItems);
      }
    } catch (error) {
      console.error("Get individual roadmap error:", error);
      res.status(500).json({ message: "Failed to get roadmap" });
    }
  });

  app.post("/api/roadmap/individual/:menteeId/skills", requireMentor, async (req: Request, res: Response) => {
    try {
      const { menteeId } = req.params;
      const { name, description } = req.body;
      
      // Verify mentee belongs to this mentor
      const mentee = await storage.getUser(menteeId);
      if (!mentee || mentee.mentorId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden - Mentee does not belong to you" });
      }

      const skill = await storage.createIndividualSkill(menteeId, name, description);
      res.json(skill);
    } catch (error) {
      console.error("Create individual skill error:", error);
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  app.patch("/api/roadmap/individual/:menteeId/skills/:skillId", requireMentor, async (req: Request, res: Response) => {
    try {
      const { menteeId, skillId } = req.params;
      const { name, description } = req.body;
      
      // Verify mentee belongs to this mentor
      const mentee = await storage.getUser(menteeId);
      if (!mentee || mentee.mentorId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden - Mentee does not belong to you" });
      }

      const skill = await storage.updateIndividualSkill(skillId, { name, description });
      res.json(skill);
    } catch (error) {
      console.error("Update individual skill error:", error);
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  app.delete("/api/roadmap/individual/:menteeId/skills/:skillId", requireMentor, async (req: Request, res: Response) => {
    try {
      const { menteeId, skillId } = req.params;
      
      // Verify mentee belongs to this mentor
      const mentee = await storage.getUser(menteeId);
      if (!mentee || mentee.mentorId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden - Mentee does not belong to you" });
      }

      await storage.deleteIndividualSkill(skillId);
      res.json({ message: "Skill deleted" });
    } catch (error) {
      console.error("Delete individual skill error:", error);
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });

  app.post("/api/roadmap/individual/:menteeId/reset", requireMentor, async (req: Request, res: Response) => {
    try {
      const { menteeId } = req.params;
      
      // Verify mentee belongs to this mentor
      const mentee = await storage.getUser(menteeId);
      if (!mentee || mentee.mentorId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden - Mentee does not belong to you" });
      }

      await storage.deleteAllIndividualRoadmapItemsForMentee(menteeId);
      const individualSkills = await storage.getIndividualSkillsByMenteeId(menteeId);
      for (const skill of individualSkills) {
        await storage.deleteIndividualSkill(skill.id);
      }
      res.json({ message: "Individual roadmap reset to global" });
    } catch (error) {
      console.error("Reset individual roadmap error:", error);
      res.status(500).json({ message: "Failed to reset roadmap" });
    }
  });

  app.post("/api/roadmap/individual/:menteeId/items", requireMentor, async (req: Request, res: Response) => {
    try {
      const { menteeId } = req.params;
      const { skillId, individualSkillId, title, order, isMockInterview, resourceUrl } = req.body;
      
      // Verify mentee belongs to this mentor
      const mentee = await storage.getUser(menteeId);
      if (!mentee || mentee.mentorId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden - Mentee does not belong to you" });
      }

      const item = await storage.createIndividualRoadmapItem({
        menteeId,
        skillId: skillId || null,
        title,
        order: order !== undefined ? order : 0,
        isMockInterview: isMockInterview || false,
        individualSkillId: individualSkillId || null,
        resourceUrl: resourceUrl || null,
      });

      res.json(item);
    } catch (error) {
      console.error("Create individual item error:", error);
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  app.patch("/api/roadmap/individual/:menteeId/items/:itemId", requireMentor, async (req: Request, res: Response) => {
    try {
      const { menteeId, itemId } = req.params;
      const { title, resourceUrl } = req.body;
      
      // Verify mentee belongs to this mentor
      const mentee = await storage.getUser(menteeId);
      if (!mentee || mentee.mentorId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden - Mentee does not belong to you" });
      }

      const item = await storage.updateIndividualRoadmapItem(itemId, {
        title,
        resourceUrl: resourceUrl || null,
      });
      
      res.json(item);
    } catch (error) {
      console.error("Update individual item error:", error);
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  app.delete("/api/roadmap/individual/:menteeId/items/:itemId", requireMentor, async (req: Request, res: Response) => {
    try {
      const { menteeId, itemId } = req.params;
      
      // Verify mentee belongs to this mentor
      const mentee = await storage.getUser(menteeId);
      if (!mentee || mentee.mentorId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden - Mentee does not belong to you" });
      }

      await storage.deleteIndividualRoadmapItem(itemId);
      res.json({ message: "Item deleted" });
    } catch (error) {
      console.error("Delete individual item error:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  app.patch("/api/roadmap/individual/:menteeId/items/:itemId/reorder", requireMentor, async (req: Request, res: Response) => {
    try {
      const { menteeId, itemId } = req.params;
      const { order } = req.body;
      
      // Verify mentee belongs to this mentor
      const mentee = await storage.getUser(menteeId);
      if (!mentee || mentee.mentorId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden - Mentee does not belong to you" });
      }

      await storage.reorderIndividualRoadmapItem(itemId, order);
      res.json({ message: "Item reordered" });
    } catch (error) {
      console.error("Reorder individual item error:", error);
      res.status(500).json({ message: "Failed to reorder item" });
    }
  });

  // Payment portfolio endpoint
  app.get("/api/mentor/payment-portfolio", requireMentor, async (req: Request, res: Response) => {
    try {
      const mentees = await storage.getMenteesByMentorId(req.session.userId!);
      const portfolio = await Promise.all(
        mentees.map(async (mentee) => {
          const payments = await storage.getPaymentsByMenteeId(mentee.id);
          const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
          const totalFee = mentee.totalFee ? parseFloat(mentee.totalFee.toString()) : 0;
          
          return {
            menteeId: mentee.id,
            menteeName: mentee.name,
            totalFee,
            totalPaid,
            remaining: totalFee - totalPaid,
            lastPaymentDate: payments.length > 0 ? payments[0].date : null,
          };
        })
      );
      res.json(portfolio);
    } catch (error) {
      console.error("Get payment portfolio error:", error);
      res.status(500).json({ message: "Failed to get payment portfolio" });
    }
  });

  app.post("/api/mentor/add-payment", requireMentor, async (req: Request, res: Response) => {
    try {
      const { menteeId, amount, date, notes } = req.body;
      
      // Verify mentee belongs to this mentor
      const mentee = await storage.getUser(menteeId);
      if (!mentee || mentee.mentorId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden - Mentee does not belong to you" });
      }

      const payment = await storage.createPayment({
        menteeId,
        amount: String(parseFloat(amount)),
        date: new Date(date),
        notes: notes || "",
      });

      res.json(payment);
    } catch (error) {
      console.error("Add payment error:", error);
      res.status(500).json({ message: "Failed to add payment" });
    }
  });

  // Mentor profile endpoints
  app.get("/api/mentor/profile", requireMentor, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error("Get mentor profile error:", error);
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  app.patch("/api/mentor/profile", requireMentor, async (req: Request, res: Response) => {
    try {
      const { name, phone, photo } = req.body;
      
      const user = await storage.updateUser(req.session.userId!, {
        name,
        phone: phone || null,
        photo: photo || null,
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error("Update mentor profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
