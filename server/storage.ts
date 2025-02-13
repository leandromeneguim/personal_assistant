import { User, Assistant, Document, InsertUser } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { users, assistants, documents } from "@shared/schema";

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
  getAllUsers(): Promise<User[]>;
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
      await this.createUser({
        username: "adm",
        password: "7f5e02a4d9c6b8a3f1d7e9c4a2b5d8f6e3a9c7b4d1e8f2a5c9b6d3a7e4f1b8.a1b2c3d4e5f6", // @adm123
        subscription: "admin",
        isAdmin: true,
      });
    }

    // Check if test user exists
    const testUser = await this.getUserByUsername("teste");
    if (!testUser) {
      await this.createUser({
        username: "teste",
        password: "9d8f2e5c6b4a7f3d1e9c5b8a4f2d7e3c6b9a4f1d8e2c5b7a3f6d9e4c1b8a5.f1e2d3c4b5a6", // @teste123
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

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
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