import { User, Assistant, Document, InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private assistants: Map<number, Assistant>;
  private documents: Map<number, Document>;
  private currentId: number;
  private globalConfig: { defaultModel: string };
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.assistants = new Map();
    this.documents = new Map();
    this.currentId = 1;
    this.globalConfig = { defaultModel: "deepseek" };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Inicializar usuários padrão
    this.initializeDefaultUsers();
  }

  private async initializeDefaultUsers() {
    // Criar usuário administrador
    const adminId = this.currentId++;
    this.users.set(adminId, {
      id: adminId,
      username: "adm",
      password: "cd36b370a5a3bdd19b8798f6bd6ea6364ce52d516b51c95c5f6b9e883c8b3088.f8e1c0a45dd64c881f6d3c825360b684", // @adm123
      subscription: "admin",
      isAdmin: true,
    });

    // Criar usuário teste
    const testId = this.currentId++;
    this.users.set(testId, {
      id: testId,
      username: "teste",
      password: "d9a7921f41b96b52c98d22339e947ed134f2d1659028f58b7e0bcec07e399c69.e42cde6bc0e9480ab62b9d87c995e8f9", // @teste123
      subscription: "free",
      isAdmin: false,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, subscription: "free", isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  async getAssistant(id: number): Promise<Assistant | undefined> {
    return this.assistants.get(id);
  }

  async getAssistants(userId: number): Promise<Assistant[]> {
    return Array.from(this.assistants.values()).filter(
      (assistant) => assistant.userId === userId,
    );
  }

  async createAssistant(assistant: Omit<Assistant, "id">): Promise<Assistant> {
    const id = this.currentId++;
    const newAssistant = { ...assistant, id };
    this.assistants.set(id, newAssistant);
    return newAssistant;
  }

  async updateAssistant(id: number, update: Partial<Assistant>): Promise<Assistant> {
    const assistant = this.assistants.get(id);
    if (!assistant) throw new Error("Assistant not found");
    const updated = { ...assistant, ...update };
    this.assistants.set(id, updated);
    return updated;
  }

  async getDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.userId === userId,
    );
  }

  async createDocument(document: Omit<Document, "id">): Promise<Document> {
    const id = this.currentId++;
    const newDocument = { ...document, id };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async deleteDocument(id: number): Promise<void> {
    this.documents.delete(id);
  }

  // Implementação dos métodos administrativos
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async countUsers(): Promise<number> {
    return this.users.size;
  }

  async countActiveUsers(): Promise<number> {
    // Simplificado para demonstração
    return this.users.size;
  }

  async countAssistants(): Promise<number> {
    return this.assistants.size;
  }

  async countChats(): Promise<number> {
    // Simplificado para demonstração
    return 0;
  }

  async updateGlobalConfig(config: { defaultModel: string }): Promise<void> {
    this.globalConfig = { ...this.globalConfig, ...config };
  }
}

export const storage = new MemStorage();