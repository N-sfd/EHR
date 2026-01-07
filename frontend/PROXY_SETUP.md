# Angular Proxy Configuration

This project uses Angular's development proxy to route API requests to different microservices during development.

## How It Works

The `proxy.conf.json` file routes API requests to the appropriate backend services:

- `/api/staff` → `http://localhost:8082` (staff-service)
- `/api/departments` → `http://localhost:8083` (hrm-service)
- `/api/jobs` → `http://localhost:8083` (hrm-service)
- `/api/rbac` → `http://localhost:8084` (rbac-service)
- `/api/doctors` → `http://localhost:8085` (doctor-service - when created)
- `/api/locations` → `http://localhost:8086` (location-service - when created)
- `/api/positions` → `http://localhost:8087` (position-service - when created)
- `/api/auth` → `http://localhost:8088` (auth-service - when created)

## Development Setup

1. **Start all backend services** on their respective ports:
   ```bash
   # Terminal 1 - Staff Service
   cd backend && mvn spring-boot:run  # Port 8082
   
   # Terminal 2 - HRM Service
   cd hrm-service && mvn spring-boot:run  # Port 8083
   
   # Terminal 3 - RBAC Service
   cd rbac-service && mvn spring-boot:run  # Port 8084
   ```

2. **Start Angular development server**:
   ```bash
   cd frontend
   npm start
   # or
   ng serve
   ```

3. The Angular app will run on `http://localhost:4200` and automatically proxy API requests to the correct backend services.

## Environment Configuration

- **Development** (`environment.ts`): Uses empty `apiUrl` to leverage the proxy
- **Production** (`environment.prod.ts`): Uses gateway URL `http://localhost:8080` (or your production gateway)

## Production Setup

For production, you should:

1. Set up an API Gateway (e.g., Spring Cloud Gateway, Kong, or Nginx) at `http://localhost:8080`
2. Configure the gateway to route requests to the appropriate services
3. Update `environment.prod.ts` with your production gateway URL
4. Build the Angular app with production configuration:
   ```bash
   ng build --configuration production
   ```

## Adding New Services

When adding a new microservice:

1. Add the proxy route to `proxy.conf.json`
2. Update this README with the new service port
3. Ensure the service runs on the specified port

