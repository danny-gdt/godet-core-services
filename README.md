
## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **Redis** - Caching layer
- **JWT** - Token authentication
- **Pino** - Structured logging

### Infrastructure
- **AWS ECS** - Container orchestration
- **Docker** - Containerization
- **PostgreSQL** - Primary database
- **ELK Stack** - Logging and monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker
- AWS CLI configured
- PostgreSQL database
- Redis instance

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/godet-core-services.git
   cd godet-core-services
   ```

2. **Install dependencies**
   ```bash
   cd auth-service
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations**
   ```bash
   pnpm exec prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

The service will be available at `http://localhost:3000`

### Docker Development

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run individually
docker build -t auth-service .
docker run -p 3000:3000 auth-service
```

## 🏗️ Production Deployment

### Using AWS CDK (Recommended)

1. **Deploy infrastructure**
   ```bash
   cd cdk
   npm install
   npm run build
   cdk deploy
   ```

2. **Configure GitHub Secrets**
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_ACCOUNT_ID`

3. **Push to main branch**
   ```bash
   git push origin main
   ```

GitHub Actions will automatically:
- Deploy infrastructure with CDK
- Build and push Docker image
- Update ECS service
- Run database migrations

### Manual Deployment

See [CDK README](cdk/README.md) for detailed deployment instructions.

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

### Response Format
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `ACCESS_TOKEN_SECRET` | JWT access token secret | - |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret | - |
| `ACCESS_TOKEN_EXPIRATION` | Access token TTL | `15m` |
| `REFRESH_TOKEN_EXPIRATION` | Refresh token TTL | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | - |
| `LOG_LEVEL` | Logging level | `info` |
| `NODE_ENV` | Environment | `development` |

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📊 Monitoring

### Logs
- **Application logs**: CloudWatch Logs (`/ecs/godet-auth-service`)
- **Structured logging**: JSON format with Pino
- **Log levels**: error, warn, info, debug

### Metrics
- **ECS metrics**: CPU, memory, network
- **Application metrics**: Request rate, response time
- **Auto-scaling**: CPU-based scaling (70% threshold)

### Health Checks
```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected"
}
```

## �� Security

- **CORS** - Configurable cross-origin requests
- **Helmet** - Security headers
- **Rate Limiting** - Request throttling
- **Input Validation** - Request sanitization
- **JWT Tokens** - Secure authentication
- **Password Hashing** - bcrypt with salt rounds
- **Secrets Management** - AWS Secrets Manager

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

## 📦 Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server

# Database
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed database
pnpm db:reset     # Reset database

# Docker
pnpm docker:build # Build Docker image
pnpm docker:run   # Run Docker container

# CDK
pnpm cdk:deploy   # Deploy infrastructure
pnpm cdk:destroy  # Destroy infrastructure
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/godet-core-services/issues)
- **Documentation**: [Wiki](https://github.com/your-username/godet-core-services/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/godet-core-services/discussions)

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Redis](https://redis.io/) - Caching
- [AWS CDK](https://aws.amazon.com/cdk/) - Infrastructure as Code
- [Pino](https://getpino.io/) - Logging

---

⭐ **Star this repository if you find it helpful!**
