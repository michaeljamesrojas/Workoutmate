# Workoutmate

A fitness application for planning and joining workout sessions with your mate, built with Node.js, Express, and Socket.IO, following Domain-Driven Design principles.

## Features

- User authentication (Local & Google OAuth)
- Real-time workout session tracking
- Workout planning and scheduling
- Session joining with workout mates
- Secure session management

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd workoutmate
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Then edit `.env` with your configuration:

- Set your `SESSION_SECRET`
- Configure Google OAuth credentials
- Adjust ports if needed

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

The project follows Domain-Driven Design principles:

```
src/
├── domain/          # Domain entities, value objects, and interfaces
├── application/     # Application services and use cases
├── infrastructure/  # External services, repositories, and technical concerns
├── interfaces/      # API routes, controllers, and presenters
└── shared/         # Shared utilities and constants
```

## Development

- `npm start`: Start the server with nodemon
- `npm run dev`: Start the server and tunnel for local development
- `npm run tunnel`: Start localtunnel only

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `SESSION_SECRET`: Secret for session encryption
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `WS_PORT`: WebSocket port (if different from main port)

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

[MIT](LICENSE)
