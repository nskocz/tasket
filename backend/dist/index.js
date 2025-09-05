"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const standalone_1 = require("@apollo/server/standalone");
const typeDefs_1 = require("./types/typeDefs");
const taskResolvers_1 = require("./resolvers/taskResolvers");
const database_1 = require("./utils/database");
const elasticsearchService_1 = require("./services/elasticsearchService");
const mongoose_1 = __importDefault(require("mongoose"));
async function startServer() {
    // Initialize services
    const elasticsearchService = new elasticsearchService_1.ElasticsearchService();
    // Create Apollo Server
    const server = new server_1.ApolloServer({
        typeDefs: typeDefs_1.typeDefs,
        resolvers: taskResolvers_1.taskResolvers,
    });
    // Connect to database
    await (0, database_1.connectDatabase)();
    const { url } = await (0, standalone_1.startStandaloneServer)(server, {
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
    const app = (0, express_1.default)();
    app.get('/health', async (req, res) => {
        try {
            const mongoStatus = mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected';
            let elasticsearchStatus = 'disconnected';
            try {
                await elasticsearchService.getHealthStatus();
                elasticsearchStatus = 'connected';
            }
            catch (error) {
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
        }
        catch (error) {
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
