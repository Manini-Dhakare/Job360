-- PostgreSQL Initialization Script
-- Enables the pgvector extension for dense vector embeddings and HNSW indexing

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
