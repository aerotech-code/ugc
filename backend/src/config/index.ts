// Configuration file
import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
  url: string;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  frontendUrl: string;
  corsOrigin: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;  
  fromName: string;
  fromEmail: string;
}

export interface AwsConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  s3Bucket: string;
}

const config = {
  app: {
    port: parseInt(process.env.PORT || '4000'),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  } as AppConfig,

  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'chatapp',
    ssl: process.env.NODE_ENV === 'production',
  } as DatabaseConfig,

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: 0,
  } as RedisConfig,

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRE || '7d',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'your-super-secret-refresh-token',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRE || '30d',
  } as JwtConfig,

  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    fromName: process.env.SMTP_FROM_NAME || 'Chat Application',
    fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@chatapp.com',
  } as EmailConfig,

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'chatapp-uploads',
  } as AwsConfig,

  // Feature flags
  features: {
    enableWebSocket: true,
    enableKafka: process.env.KAFKA_BROKERS ? true : false,
    enableElasticsearch: process.env.ELASTICSEARCH_HOST ? true : false,
    enableAI: process.env.AI_SERVICE_URL ? true : false,
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
};

export default config;
