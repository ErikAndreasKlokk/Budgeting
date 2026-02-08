# Database Schema Migration for Budgeting App

This document explains how to initialize the database schema when running the Budgeting app with an external PostgreSQL database (e.g., CNPG on Kubernetes).

## Quick Start (CNPG)

CNPG automatically creates a secret named `<cluster-name>-app` with connection details. Use the provided Kubernetes Job:

```bash
# Edit k8s/db-migrate-cnpg.yaml to set:
# 1. Your image path (ghcr.io/YOUR_USERNAME/budgeting-migrate:latest)
# 2. Your CNPG secret name (your-cnpg-cluster-app)

kubectl apply -f k8s/db-migrate-cnpg.yaml

# Watch the job
kubectl logs -f job/budgeting-db-migrate
```

## Alternative: Using CNPG's URI Key

If your CNPG version provides a `uri` key in the secret, use this simpler approach:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: budgeting-db-migrate
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: ghcr.io/YOUR_USERNAME/budgeting-migrate:latest
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: your-cnpg-cluster-app
                  key: uri
```

## Alternative: Local Migration via Port-Forward

```bash
# Port-forward to your CNPG cluster
kubectl port-forward svc/your-cnpg-cluster-rw 5432:5432

# In another terminal, run the migration
DATABASE_URL=postgresql://app:PASSWORD@localhost:5432/budgeting npm run db:push
```

## Building the Migration Image Locally

```bash
docker build -f Dockerfile.migrate -t budgeting-migrate .
docker run -e DATABASE_URL=postgresql://... budgeting-migrate
```

## How It Works

- The app uses **Drizzle ORM** for database management
- Schema is defined in `src/lib/server/db/schema.ts`
- `npm run db:push` (drizzle-kit push) syncs the schema directly to the database
- The migration image contains drizzle-kit and the schema definition

## CI/CD

The GitHub Actions workflow automatically builds and publishes both:
- `ghcr.io/YOUR_USERNAME/budgeting:latest` - Main application
- `ghcr.io/YOUR_USERNAME/budgeting-migrate:latest` - Migration image
