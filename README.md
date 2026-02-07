# Budgeting

A privacy-first, open-source budgeting application that helps you track expenses, analyze spending patterns, and take control of your financial future. No subscriptions. No data mining. Just you and your money.

## Features

- **Spending Analytics** - Visualize your spending with interactive charts and category breakdowns
- **Easy Import** - Import bank statements via CSV (supports Bulder Bank and DNB)
- **Smart Categories** - Organize transactions with categories and subcategories
- **Month Comparison** - Compare spending and income month-over-month
- **Privacy First** - Self-host on your own server, your data never leaves your control
- **Date Filtering** - Filter transactions and analytics by any date range

## Tech Stack

- **Frontend**: SvelteKit 5, TailwindCSS 4
- **Backend**: SvelteKit (Node adapter)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with Argon2 password hashing

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database (local or external)
- npm or pnpm

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ErikAndreasKlokk/budgeting.git
   cd budgeting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your database connection:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/budgeting
   ```

4. **Set up the database**

   Push the schema to your database:
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Database Connection

The application uses PostgreSQL. You can connect to:

#### Local PostgreSQL

Install PostgreSQL locally and create a database:
```bash
createdb budgeting
```

Set your connection string:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/budgeting
```

#### External PostgreSQL (Cloud)

For cloud-hosted databases (Supabase, Neon, Railway, etc.), use the connection string provided by your provider:
```env
DATABASE_URL=postgresql://username:password@your-host.com:5432/budgeting
```

### Database Commands

```bash
# Push schema changes to database
npm run db:push

# Run migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Docker Deployment

### Using Docker Compose (with bundled PostgreSQL)

This is the easiest way to get started:

1. **Create environment file**
   ```bash
   cp .env.example .env
   ```

2. **Set your password**
   ```env
   POSTGRES_PASSWORD=your_secure_password
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec app npm run db:push
   ```

The app will be available at `http://localhost:3000`

### Using Docker with External Database

If you already have a PostgreSQL database:

1. **Set environment variables**
   ```bash
   export POSTGRES_HOST=your-db-host.com
   export POSTGRES_USER=your_username
   export POSTGRES_PASSWORD=your_password
   export POSTGRES_DB=budgeting
   export ORIGIN=https://your-domain.com
   ```

2. **Start with external database config**
   ```bash
   docker-compose -f docker-compose.external-db.yml up -d
   ```

### Building the Docker Image

```bash
docker build -t budgeting .
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `NODE_ENV` | Environment mode | `development` |
| `ORIGIN` | Server origin URL (required in production) | - |
| `PORT` | Server port | `3000` |

For Docker Compose:

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | Database username | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `postgres` |
| `POSTGRES_DB` | Database name | `budgeting` |
| `POSTGRES_HOST` | External database host | - |
| `POSTGRES_PORT` | Database port | `5432` |

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run check        # Run type checking
npm run lint         # Run linter
npm run format       # Format code with Prettier
```

### Project Structure

```
src/
├── lib/
│   ├── components/     # Reusable Svelte components
│   └── server/
│       ├── auth.ts     # Authentication utilities
│       └── db/         # Database schema and connection
├── routes/
│   ├── auth/           # Login/Register pages
│   ├── dashboard/      # Main dashboard
│   ├── settings/       # User settings
│   └── health/         # Health check endpoint
└── app.html            # HTML template
```

## Supported Banks

Currently supported CSV formats:
- **Bulder Bank** - Norwegian bank
- **DNB** - Norwegian bank

More banks can be added by implementing a CSV parser in `src/routes/dashboard/+page.server.ts`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contributors

Thanks to the contributors!

### [Herjuus‼️](https://github.com/Herjuus)

[Pull request 1](https://github.com/ErikAndreasKlokk/Budgeting/pull/6)

## License

This project is open source and available under the MIT License.