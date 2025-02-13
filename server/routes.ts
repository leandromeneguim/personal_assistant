import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAssistantSchema, insertDocumentSchema } from "@shared/schema";
import { handleChat } from "./llm";

function isAdmin(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (!req.user?.isAdmin) return res.sendStatus(403);
  next();
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Rotas administrativas
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    const stats = {
      totalUsers: await storage.countUsers(),
      activeUsers: await storage.countActiveUsers(),
      totalAssistants: await storage.countAssistants(),
      totalChats: await storage.countChats(),
    };
    res.json(stats);
  });

  app.get("/api/admin/users", isAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.post("/api/admin/config", isAdmin, async (req, res) => {
    const { defaultModel } = req.body;
    await storage.updateGlobalConfig({ defaultModel });
    res.sendStatus(200);
  });

  // Assistants endpoints
  app.get("/api/assistants", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const assistants = await storage.getAssistants(req.user.id);
    res.json(assistants);
  });

  app.post("/api/assistants", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertAssistantSchema.parse(req.body);
    const assistant = await storage.createAssistant({
      ...parsed,
      userId: req.user.id,
    });
    res.json(assistant);
  });

  // Documents endpoints
  app.get("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const documents = await storage.getDocuments(req.user.id);
    res.json(documents);
  });

  app.post("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertDocumentSchema.parse(req.body);
    const document = await storage.createDocument({
      ...parsed,
      userId: req.user.id,
    });
    res.json(document);
  });

  app.delete("/api/documents/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteDocument(parseInt(req.params.id));
    res.sendStatus(200);
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { message, assistantId } = req.body;

    // Pegar o assistente do banco
    const assistant = await storage.getAssistant(assistantId);
    if (!assistant) {
      return res.status(404).json({ message: "Assistente não encontrado" });
    }

    try {
      const response = await handleChat(message, assistant);
      res.json({ response });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      res.status(500).json({ message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}