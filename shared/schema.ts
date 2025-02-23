import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name"),
  email: text("email"),
  phone: text("phone"),
  instagram: text("instagram"),
  telegram: text("telegram"),
  paymentMethod: text("payment_method"),
  subscription: text("subscription").default("free").notNull(),
  planStart: text("plan_start"),
  planEnd: text("plan_end"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  maxAssistants: integer("max_assistants").default(1).notNull(),
  allowedPlatforms: jsonb("allowed_platforms").default(['web']).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const assistants = pgTable("assistants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  personality: text("personality").notNull(),
  modelType: text("model_type").default("deepseek").notNull(),
  platforms: jsonb("platforms").default(['web']).notNull(),
  status: text("status").default("active").notNull(),
  config: jsonb("config")
    .default({
      model: "deepseek-chat-67b",
      temperature: 0.7,
      maxTokens: 2000
    })
    .notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(),
});

export const assistantDocuments = pgTable('assistant_documents', {
  assistantId: integer('assistant_id').references(() => assistants.id),
  documentId: integer('document_id').references(() => documents.id),
});


export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAssistantSchema = createInsertSchema(assistants).pick({
  name: true,
  personality: true,
  modelType: true,
  config: true,
  platforms: true,
  status: true,
}).extend({
  modelType: z.enum(["deepseek", "perplexity", "openai"]).default("deepseek"),
  config: z.object({
    model: z.string(),
    temperature: z.number().min(0).max(1),
    maxTokens: z.number().min(1).max(4000)
  }).default({
    model: "deepseek-chat-67b",
    temperature: 0.7,
    maxTokens: 2000
  }),
  platforms: z.array(z.string()).default(['web']),
  status: z.enum(['active', 'inactive']).default('active')
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  name: true,
  content: true,
  type: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Assistant = typeof assistants.$inferSelect & { documentIds: number[]; platform: string; platformConfig: { type: string; credentials: { username?: string; token?: string; qrCode?: string; }; }; };
export type Document = typeof documents.$inferSelect;