import { User, Assistant, Document, InsertUser } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { users, assistants, documents } from "@shared/schema";
import { scryptHash } from "./auth"; // Assuming scryptHash is defined here or imported

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAssistant(id: number): Promise<Assistant | undefined>;
  getAssistants(userId: number): Promise<Assistant[]>;
  createAssistant(assistant: Omit<Assistant, "id">): Promise<Assistant>;
  updateAssistant(id: number, assistant: Partial<Assistant>): Promise<Assistant>;

  getDocuments(userId: number): Promise<Document[]>;
  createDocument(document: Omit<Document, "id">): Promise<Document>;
  deleteDocument(id: number): Promise<void>;

  // Métodos administrativos
  getAllUsersWithDetails(): Promise<User[]>;
  getUsersBySubscription(): Promise<Record<string, number>>;
  getTotalInteractions(): Promise<number>;
  getUniqueUsers(): Promise<number>;
  countUsers(): Promise<number>;
  countActiveUsers(): Promise<number>;
  countAssistants(): Promise<number>;
  countChats(): Promise<number>;
  updateGlobalConfig(config: { defaultModel: string }): Promise<void>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });

    // Initialize default users
    this.initializeDefaultUsers();
  }

  private async initializeDefaultUsers() {
    // Check if admin user exists
    const adminUser = await this.getUserByUsername("adm");
    if (!adminUser) {
      const hashedPassword = await scryptHash("@adm123");
      await this.createUser({
        username: "adm",
        password: hashedPassword,
        subscription: "admin",
        isAdmin: true,
      });
    }

    // Check if test user exists
    const testUser = await this.getUserByUsername("teste");
    if (!testUser) {
      const hashedPassword = await scryptHash("@teste123");
      await this.createUser({
        username: "teste",
        password: hashedPassword,
        subscription: "free",
        isAdmin: false,
      });
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAssistant(id: number): Promise<Assistant | undefined> {
    const [assistant] = await db.select().from(assistants).where(eq(assistants.id, id));
    return assistant;
  }

  async getAssistants(userId: number): Promise<Assistant[]> {
    return db.select().from(assistants).where(eq(assistants.userId, userId));
  }

  async createAssistant(assistant: Omit<Assistant, "id">): Promise<Assistant> {
    const [newAssistant] = await db.insert(assistants).values(assistant).returning();
    return newAssistant;
  }

  async updateAssistant(id: number, data: Partial<Assistant>): Promise<Assistant> {
    const [updated] = await db
      .update(assistants)
      .set(data)
      .where(eq(assistants.id, id))
      .returning();
    return updated;
  }

  async getDocuments(userId: number): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.userId, userId));
  }

  async createDocument(document: Omit<Document, "id">): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async getAllUsersWithDetails(): Promise<User[]> {
    const result = await db.select().from(users);
    // Add additional user stats here when implementing metrics
    return result;
  }

  async getUsersBySubscription(): Promise<Record<string, number>> {
    const result = await db
      .select({ subscription: users.subscription })
      .from(users);

    const counts: Record<string, number> = {};
    result.forEach(user => {
      counts[user.subscription] = (counts[user.subscription] || 0) + 1;
    });
    return counts;
  }

  async getTotalInteractions(): Promise<number> {
    // Implement chat interactions count
    return 0;
  }

  async getUniqueUsers(): Promise<number> {
    // Implement unique users who had interactions
    return 0;
  }

  async countUsers(): Promise<number> {
    const [result] = await db
      .select({ count: sql`count(*)` })
      .from(users);
    return Number(result.count);
  }

  async countActiveUsers(): Promise<number> {
    // Por enquanto, retorna o total de usuários
    return this.countUsers();
  }

  async countAssistants(): Promise<number> {
    const [result] = await db
      .select({ count: sql`count(*)` })
      .from(assistants);
    return Number(result.count);
  }

  async countChats(): Promise<number> {
    // Implementar quando tivermos a tabela de chats
    return 0;
  }

  async updateGlobalConfig(config: { defaultModel: string }): Promise<void> {
    // Implementar quando tivermos a tabela de configurações
  }
}

export const storage = new DatabaseStorage();