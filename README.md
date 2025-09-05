# TaskApp - Modern Task Management

A comprehensive task management application built with Next.js, Node.js, GraphQL, MongoDB, and Elasticsearch.

## Features

- ✅ **Task Management**: Create, edit, delete, and organize tasks
- 📌 **Pin Important Tasks**: Keep important tasks at the top
- 📅 **Date-based Views**: View tasks by specific dates and navigate through past days
- 🔍 **Advanced Search**: Full-text search with Elasticsearch integration
- 📊 **Task Statistics**: Track your productivity with comprehensive stats
- 🏷️ **Tags & Categories**: Organize tasks with custom tags
- ⚡ **Priority Levels**: Set task priorities (Low, Medium, High)
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI**: Clean and intuitive interface with Tailwind CSS

## Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Apollo Client** for GraphQL integration
- **Lucide React** for icons
- **date-fns** for date handling

### Backend
- **Node.js** with Express
- **Apollo Server** for GraphQL API
- **MongoDB** with Mongoose for data persistence
- **Elasticsearch** for advanced search capabilities
- **TypeScript** for backend type safety

## Project Structure

```
/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app directory
│   │   ├── components/      # React components
│   │   ├── lib/             # Apollo client and GraphQL operations
│   │   └── types/           # TypeScript type definitions
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── models/          # MongoDB models
│   │   ├── resolvers/       # GraphQL resolvers
│   │   ├── services/        # Business logic services
│   │   ├── types/           # GraphQL type definitions
│   │   └── utils/           # Utility functions
└── tasket/                  # Original Python CLI app (legacy)
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- Elasticsearch (optional, falls back to MongoDB search)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env file with your configurations
# Set MONGODB_URI, ELASTICSEARCH_URL, etc.

# Start the development server
npm run dev
```

The backend will start on `http://localhost:4000`
- GraphQL Playground: `http://localhost:4000/graphql`
- Health Check: `http://localhost:4000/health`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### 3. Database Setup

Make sure MongoDB is running on your system or configure a cloud MongoDB instance in your `.env` file.

### 4. Elasticsearch Setup (Optional)

Install and run Elasticsearch locally, or use a cloud service. The application will work without Elasticsearch but search functionality will be limited to basic MongoDB queries.

## Environment Variables

### Backend (.env)
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/taskapp
ELASTICSEARCH_URL=http://localhost:9200
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

## API Documentation

The GraphQL API provides the following operations:

### Queries
- `getTasks` - Get paginated list of tasks with filtering
- `getTask` - Get a specific task by ID
- `getTasksByDate` - Get tasks for a specific date
- `searchTasks` - Full-text search across tasks
- `getTaskStats` - Get task statistics

### Mutations
- `createTask` - Create a new task
- `updateTask` - Update an existing task
- `deleteTask` - Delete a task
- `toggleTaskComplete` - Toggle task completion status
- `toggleTaskPin` - Toggle task pin status
- `bulkDeleteTasks` - Delete multiple tasks
- `bulkUpdateTasks` - Update multiple tasks

## Key Features in Detail

### Task Management
- Create tasks with title, description, priority, due date, and tags
- Mark tasks as complete/incomplete
- Pin important tasks to keep them at the top
- Edit task details inline
- Delete tasks with confirmation

### Date Navigation
- View tasks for any specific date
- Navigate between days using arrow controls
- Quick "Today" button to return to current date
- Visual indicators for current day

### Search & Filtering
- Real-time search as you type
- Search across task titles, descriptions, and tags
- Advanced search with Elasticsearch (fuzzy matching, relevance scoring)
- Filter by completion status, priority, and date ranges

### Statistics Dashboard
- Total, completed, and pending task counts
- Pinned tasks count
- Today's tasks count
- Overdue tasks count
- Completion rate visualization

## Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Building for Production
```bash
# Build backend
cd backend && npm run build

# Build frontend
cd frontend && npm run build
```

### Docker Setup (Optional)
Docker configuration files can be added for containerized deployment.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Migration from Original Python App

If you have tasks from the original Python CLI app (`tasket.py`), you can migrate them by:

1. Reading the text files generated by the Python app
2. Parsing the task data
3. Using the GraphQL API to create equivalent tasks in the new system

The original Python app stored tasks in daily text files with a simple format that can be parsed and imported.# tasket
