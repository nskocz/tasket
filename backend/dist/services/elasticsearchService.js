"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticsearchService = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
class ElasticsearchService {
    constructor() {
        this.indexName = 'tasks';
        this.client = new elasticsearch_1.Client({
            node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
            requestTimeout: 5000,
            pingTimeout: 3000
        });
        this.initializeIndex();
    }
    async initializeIndex() {
        try {
            const exists = await this.client.indices.exists({
                index: this.indexName
            });
            if (!exists) {
                await this.client.indices.create({
                    index: this.indexName,
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            title: {
                                type: 'text',
                                analyzer: 'standard',
                                fields: {
                                    keyword: { type: 'keyword' }
                                }
                            },
                            description: {
                                type: 'text',
                                analyzer: 'standard'
                            },
                            completed: { type: 'boolean' },
                            pinned: { type: 'boolean' },
                            priority: { type: 'keyword' },
                            dueDate: { type: 'date' },
                            createdAt: { type: 'date' },
                            updatedAt: { type: 'date' },
                            completedAt: { type: 'date' },
                            tags: {
                                type: 'text',
                                fields: {
                                    keyword: { type: 'keyword' }
                                }
                            },
                            userId: { type: 'keyword' }
                        }
                    },
                    settings: {
                        analysis: {
                            analyzer: {
                                custom_task_analyzer: {
                                    type: 'custom',
                                    tokenizer: 'standard',
                                    filter: ['lowercase', 'stop']
                                }
                            }
                        }
                    }
                });
                console.log('Elasticsearch tasks index created successfully');
            }
        }
        catch (error) {
            console.error('Failed to initialize Elasticsearch index:', error instanceof Error ? error.message : 'Unknown error');
        }
    }
    async indexTask(task) {
        try {
            await this.client.index({
                index: this.indexName,
                id: task.id,
                document: {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    completed: task.completed,
                    pinned: task.pinned,
                    priority: task.priority,
                    dueDate: task.dueDate,
                    createdAt: task.createdAt,
                    updatedAt: task.updatedAt,
                    completedAt: task.completedAt,
                    tags: task.tags,
                    userId: task.userId
                }
            });
        }
        catch (error) {
            console.error('Failed to index task:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
    async updateTask(task) {
        try {
            await this.client.update({
                index: this.indexName,
                id: task.id,
                doc: {
                    title: task.title,
                    description: task.description,
                    completed: task.completed,
                    pinned: task.pinned,
                    priority: task.priority,
                    dueDate: task.dueDate,
                    updatedAt: task.updatedAt,
                    completedAt: task.completedAt,
                    tags: task.tags
                }
            });
        }
        catch (error) {
            console.error('Failed to update task in Elasticsearch:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
    async deleteTask(taskId) {
        try {
            await this.client.delete({
                index: this.indexName,
                id: taskId
            });
        }
        catch (error) {
            console.error('Failed to delete task from Elasticsearch:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
    async searchTasks(userId, query, limit = 20, offset = 0) {
        try {
            const searchBody = {
                query: {
                    bool: {
                        must: [
                            {
                                term: { userId }
                            },
                            {
                                multi_match: {
                                    query,
                                    fields: [
                                        'title^3',
                                        'description^2',
                                        'tags^2'
                                    ],
                                    type: 'best_fields',
                                    fuzziness: 'AUTO'
                                }
                            }
                        ]
                    }
                },
                sort: [
                    'pinned:desc',
                    '_score:desc',
                    'createdAt:desc'
                ],
                from: offset,
                size: limit,
                highlight: {
                    fields: {
                        title: {},
                        description: {}
                    }
                }
            };
            const response = await this.client.search({
                index: this.indexName,
                ...searchBody
            });
            const tasks = response.hits.hits.map((hit) => ({
                ...hit._source,
                highlight: hit.highlight
            }));
            const total = typeof response.hits.total === 'object' ? response.hits.total.value : response.hits.total;
            return {
                tasks,
                total: total || 0,
                hasMore: offset + limit < (total || 0)
            };
        }
        catch (error) {
            console.error('Failed to search tasks:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
    async bulkIndexTasks(tasks) {
        try {
            const body = tasks.flatMap(task => [
                { index: { _index: this.indexName, _id: task.id } },
                {
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    completed: task.completed,
                    pinned: task.pinned,
                    priority: task.priority,
                    dueDate: task.dueDate,
                    createdAt: task.createdAt,
                    updatedAt: task.updatedAt,
                    completedAt: task.completedAt,
                    tags: task.tags,
                    userId: task.userId
                }
            ]);
            await this.client.bulk({ body });
        }
        catch (error) {
            console.error('Failed to bulk index tasks:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
    async getHealthStatus() {
        try {
            return await this.client.cluster.health();
        }
        catch (error) {
            console.error('Failed to get Elasticsearch health:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
}
exports.ElasticsearchService = ElasticsearchService;
