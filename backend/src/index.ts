import 'dotenv/config';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './types/typeDefs';
import { taskResolvers } from './resolvers/taskResolvers';
import { connectDatabase } from './utils/database';
import { ElasticsearchService } from './services/elasticsearchService';
import mongoose from 'mongoose';

interface Context {
  userId: string;
  elasticsearchService: ElasticsearchService;
}

async function startServer() {
  // Initialize services
  const elasticsearchService = new ElasticsearchService();
  
  // Create Apollo Server
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers: taskResolvers,
  });

  // Connect to database
  await connectDatabase();

  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT) || 4000 },
    context: async ({ req }) => {
      // For now, we'll use a dummy user ID
      // In a real app, you'd extract this from JWT token
      const userId = req.headers.authorization || 'default-user';
      
      return {
        userId,
        elasticsearchService,
      };
    },
  });

  console.log(`🚀 Server ready at ${url}`);
  console.log(`🏥 Health check available at ${url.replace('/graphql', '/health')}`);

  // Add a simple health check endpoint
  const app = express();
  app.get('/health', async (req, res) => {
    try {
      const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      let elasticsearchStatus = 'disconnected';
      
      try {
        await elasticsearchService.getHealthStatus();
        elasticsearchStatus = 'connected';
      } catch (error) {
        elasticsearchStatus = 'disconnected';
      }

      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          mongodb: mongoStatus,
          elasticsearch: elasticsearchStatus
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const PORT = Number(process.env.PORT) || 4001;
  app.listen(PORT, () => {
    console.log(`🏥 Health server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});