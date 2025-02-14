
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  subscription TEXT NOT NULL DEFAULT 'free',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  max_assistants INTEGER NOT NULL DEFAULT 1,
  allowed_platforms JSONB NOT NULL DEFAULT '["web"]'
);

CREATE TABLE assistants (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  personality TEXT NOT NULL,
  model_type TEXT NOT NULL DEFAULT 'deepseek',
  config JSONB NOT NULL DEFAULT '{"model":"deepseek-chat-67b","temperature":0.7,"maxTokens":2000}'
);

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL
);
