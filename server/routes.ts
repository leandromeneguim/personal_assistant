import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, scryptHash } from "./auth";
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

  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    const stats = {
      totalUsers: await storage.countUsers(),
      activeUsers: await storage.countActiveUsers(),
      totalAssistants: await storage.countAssistants(),
      totalChats: await storage.countChats(),
      usersBySubscription: await storage.getUsersBySubscription(),
      totalInteractions: await storage.getTotalInteractions(),
      uniqueUsers: await storage.getUniqueUsers(),
    };
    res.json(stats);
  });

  app.get("/api/admin/users", isAdmin, async (req, res) => {
    const users = await storage.getAllUsersWithDetails();
    res.json(users);
  });

  app.post("/api/admin/config", isAdmin, async (req, res) => {
    const { defaultModel } = req.body;
    await storage.updateGlobalConfig({ defaultModel });
    res.sendStatus(200);
  });

  app.post("/api/admin/users/:id", isAdmin, async (req, res) => {
    const { maxAssistants, allowedPlatforms, subscription } = req.body;
    await storage.updateUser(parseInt(req.params.id), {
      maxAssistants,
      allowedPlatforms,
      subscription
    });
    res.json({ success: true });
  });

  app.post("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const hashedPassword = await scryptHash(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        isAdmin: false,
        maxAssistants: req.body.maxAssistants || 1,
        allowedPlatforms: req.body.allowedPlatforms || ['web'],
      });
      res.json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // Assistants endpoints
  app.get("/api/assistants", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const assistants = await storage.getAssistants(req.user.id);
    res.json(assistants);
  });

  app.post("/api/assistants", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { platform, documentIds, ...rest } = req.body;
    const parsed = insertAssistantSchema.parse(rest);

    const assistant = await storage.createAssistant({
      ...parsed,
      userId: req.user.id,
      documentIds,
      platform,
      platformConfig: {
        type: platform,
        credentials: {}
      }
    });

    res.json(assistant);
  });

  app.post("/api/assistants/:id/platform", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { platform, credentials } = req.body;

    const assistant = await storage.updateAssistant(parseInt(req.params.id), {
      platform,
      platformConfig: {
        type: platform,
        credentials
      }
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