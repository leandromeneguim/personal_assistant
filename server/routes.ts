import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAssistantSchema, insertDocumentSchema } from "@shared/schema";
import { handleChat } from "./llm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

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
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}