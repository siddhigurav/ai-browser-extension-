-- Placeholder for database schema

CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(255) PRIMARY KEY,
    content TEXT NOT NULL,
    embedding VECTOR(384),
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents USING hnsw (embedding vector_l2_ops);
