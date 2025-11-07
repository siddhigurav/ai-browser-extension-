# server/config.py

class Config:
    SECRET_KEY = 'a_very_secret_key_that_should_be_changed_in_production'
    # Add other configuration variables here
    # For example, database connection strings, API keys, etc.
    # SQLALCHEMY_DATABASE_URI = 'postgresql://user:password@host:port/database'
    # JWT_SECRET_KEY = 'super-secret-jwt-key'

class DevelopmentConfig(Config):
    DEBUG = True
    # Development-specific configurations

class ProductionConfig(Config):
    DEBUG = False
    # Production-specific configurations
