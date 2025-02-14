
import { Express } from "express";
import http from "http";
import { storage } from "./storage";

export function registerRoutes(app: Express) {
  const server = http.createServer(app);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.authenticateUser(username, password);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  app.get("/api/user", async (req, res) => {
    const user = await storage.getCurrentUser(req);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  return server;
}
