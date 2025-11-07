# Placeholder for database initialization script

import os
import psycopg2

def init_db():
    db_url = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:5432/mydatabase')
    conn = None
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        with open('server/storage/migrations/schema.sql', 'r') as f:
            cur.execute(f.read())
        conn.commit()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    init_db()
