
import { Express } from "express";
import http from "http";
import passport from "passport";
import { storage } from "./storage";

export function registerRoutes(app: Express) {
  const server = http.createServer(app);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  app.get("/api/user", (req, res) => {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  return server;
}
