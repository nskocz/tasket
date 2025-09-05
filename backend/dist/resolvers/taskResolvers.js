"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskResolvers = void 0;
const graphql_1 = require("graphql");
const language_1 = require("graphql/language");
const Task_1 = __importDefault(require("../models/Task"));
const dateScalar = new graphql_1.GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    serialize(value) {
        if (value instanceof Date) {
            return value.getTime();
        }
        throw Error('GraphQL Date Scalar serializer expected a `Date` object');
    },
    parseValue(value) {
        if (typeof value === 'number') {
            return new Date(value);
        }
        throw new Error('GraphQL Date Scalar parser expected a `number`');
    },
    parseLiteral(ast) {
        if (ast.kind === language_1.Kind.INT) {
            return new Date(parseInt(ast.value, 10));
        }
        return null;
    },
});
exports.taskResolvers = {
    Date: dateScalar,
    Query: {
        getTasks: async (_, { filter, limit, offset, sortBy, sortOrder }, { userId }) => {
            try {
                const query = { userId };
                if (filter) {
                    if (typeof filter.completed === 'boolean') {
                        query.completed = filter.completed;
                    }
                    if (typeof filter.pinned === 'boolean') {
                        query.pinned = filter.pinned;
                    }
                    if (filter.priority) {
                        query.priority = filter.priority.toLowerCase();
                    }
                    if (filter.dateFrom || filter.dateTo) {
                        query.createdAt = {};
                        if (filter.dateFrom)
                            query.createdAt.$gte = filter.dateFrom;
                        if (filter.dateTo)
                            query.createdAt.$lte = filter.dateTo;
                    }
                    if (filter.tags && filter.tags.length > 0) {
                        query.tags = { $in: filter.tags };
                    }
                    if (filter.search) {
                        query.$or = [
                            { title: { $regex: filter.search, $options: 'i' } },
                            { description: { $regex: filter.search, $options: 'i' } }
                        ];
                    }
                }
                const sortOptions = {};
                sortOptions[sortBy] = sortOrder === 'ASC' ? 1 : -1;
                const tasks = await Task_1.default.find(query)
                    .sort(sortOptions)
                    .limit(limit)
                    .skip(offset)
                    .exec();
                const total = await Task_1.default.countDocuments(query);
                return {
                    tasks,
                    total,
                    hasMore: offset + limit < total
                };
            }
            catch (error) {
                throw new Error(`Failed to fetch tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        getTask: async (_, { id }, { userId }) => {
            try {
                return await Task_1.default.findOne({ _id: id, userId });
            }
            catch (error) {
                throw new Error(`Failed to fetch task: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        getTasksByDate: async (_, { date }, { userId }) => {
            try {
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                return await Task_1.default.find({
                    userId,
                    createdAt: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                }).sort({ pinned: -1, createdAt: -1 });
            }
            catch (error) {
                throw new Error(`Failed to fetch tasks by date: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        searchTasks: async (_, { query, limit, offset }, { userId, elasticsearchService }) => {
            try {
                return await elasticsearchService.searchTasks(userId, query, limit, offset);
            }
            catch (error) {
                // Fallback to MongoDB search if Elasticsearch fails
                const mongoQuery = {
                    userId,
                    $or: [
                        { title: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } },
                        { tags: { $in: [new RegExp(query, 'i')] } }
                    ]
                };
                const tasks = await Task_1.default.find(mongoQuery)
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .skip(offset);
                const total = await Task_1.default.countDocuments(mongoQuery);
                return {
                    tasks,
                    total,
                    hasMore: offset + limit < total
                };
            }
        },
        getTaskStats: async (_, __, { userId }) => {
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const [totalTasks, completedTasks, pinnedTasks, todayTasks, overdueTasks] = await Promise.all([
                    Task_1.default.countDocuments({ userId }),
                    Task_1.default.countDocuments({ userId, completed: true }),
                    Task_1.default.countDocuments({ userId, pinned: true }),
                    Task_1.default.countDocuments({
                        userId,
                        createdAt: { $gte: today, $lt: tomorrow }
                    }),
                    Task_1.default.countDocuments({
                        userId,
                        dueDate: { $lt: today },
                        completed: false
                    })
                ]);
                return {
                    totalTasks,
                    completedTasks,
                    pendingTasks: totalTasks - completedTasks,
                    pinnedTasks,
                    todayTasks,
                    overdueTasks
                };
            }
            catch (error) {
                throw new Error(`Failed to fetch task stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    },
    Mutation: {
        createTask: async (_, { input }, { userId, elasticsearchService }) => {
            try {
                const task = new Task_1.default({
                    ...input,
                    userId,
                    priority: input.priority?.toLowerCase() || 'medium'
                });
                const savedTask = await task.save();
                // Index in Elasticsearch
                try {
                    await elasticsearchService.indexTask(savedTask);
                }
                catch (esError) {
                    console.warn('Failed to index task in Elasticsearch:', esError instanceof Error ? esError.message : 'Unknown error');
                }
                return savedTask;
            }
            catch (error) {
                throw new Error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        updateTask: async (_, { id, input }, { userId, elasticsearchService }) => {
            try {
                const updateData = { ...input };
                if (input.priority) {
                    updateData.priority = input.priority.toLowerCase();
                }
                if (input.completed === true && !updateData.completedAt) {
                    updateData.completedAt = new Date();
                }
                else if (input.completed === false) {
                    updateData.completedAt = null;
                }
                const task = await Task_1.default.findOneAndUpdate({ _id: id, userId }, updateData, { new: true, runValidators: true });
                if (!task) {
                    throw new Error('Task not found');
                }
                // Update in Elasticsearch
                try {
                    await elasticsearchService.updateTask(task);
                }
                catch (esError) {
                    console.warn('Failed to update task in Elasticsearch:', esError instanceof Error ? esError.message : 'Unknown error');
                }
                return task;
            }
            catch (error) {
                throw new Error(`Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        deleteTask: async (_, { id }, { userId, elasticsearchService }) => {
            try {
                const task = await Task_1.default.findOneAndDelete({ _id: id, userId });
                if (!task) {
                    return false;
                }
                // Remove from Elasticsearch
                try {
                    await elasticsearchService.deleteTask(id);
                }
                catch (esError) {
                    console.warn('Failed to delete task from Elasticsearch:', esError instanceof Error ? esError.message : 'Unknown error');
                }
                return true;
            }
            catch (error) {
                throw new Error(`Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        toggleTaskComplete: async (_, { id }, { userId, elasticsearchService }) => {
            try {
                const task = await Task_1.default.findOne({ _id: id, userId });
                if (!task) {
                    throw new Error('Task not found');
                }
                task.completed = !task.completed;
                task.completedAt = task.completed ? new Date() : undefined;
                const updatedTask = await task.save();
                // Update in Elasticsearch
                try {
                    await elasticsearchService.updateTask(updatedTask);
                }
                catch (esError) {
                    console.warn('Failed to update task in Elasticsearch:', esError instanceof Error ? esError.message : 'Unknown error');
                }
                return updatedTask;
            }
            catch (error) {
                throw new Error(`Failed to toggle task completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        toggleTaskPin: async (_, { id }, { userId, elasticsearchService }) => {
            try {
                const task = await Task_1.default.findOne({ _id: id, userId });
                if (!task) {
                    throw new Error('Task not found');
                }
                task.pinned = !task.pinned;
                const updatedTask = await task.save();
                // Update in Elasticsearch
                try {
                    await elasticsearchService.updateTask(updatedTask);
                }
                catch (esError) {
                    console.warn('Failed to update task in Elasticsearch:', esError instanceof Error ? esError.message : 'Unknown error');
                }
                return updatedTask;
            }
            catch (error) {
                throw new Error(`Failed to toggle task pin: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        bulkDeleteTasks: async (_, { ids }, { userId, elasticsearchService }) => {
            try {
                const result = await Task_1.default.deleteMany({
                    _id: { $in: ids },
                    userId
                });
                // Remove from Elasticsearch
                try {
                    await Promise.all(ids.map((id) => elasticsearchService.deleteTask(id)));
                }
                catch (esError) {
                    console.warn('Failed to delete tasks from Elasticsearch:', esError instanceof Error ? esError.message : 'Unknown error');
                }
                return result.deletedCount > 0;
            }
            catch (error) {
                throw new Error(`Failed to bulk delete tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        bulkUpdateTasks: async (_, { ids, input }, { userId, elasticsearchService }) => {
            try {
                const updateData = { ...input };
                if (input.priority) {
                    updateData.priority = input.priority.toLowerCase();
                }
                await Task_1.default.updateMany({ _id: { $in: ids }, userId }, updateData);
                const updatedTasks = await Task_1.default.find({ _id: { $in: ids }, userId });
                // Update in Elasticsearch
                try {
                    await Promise.all(updatedTasks.map(task => elasticsearchService.updateTask(task)));
                }
                catch (esError) {
                    console.warn('Failed to update tasks in Elasticsearch:', esError instanceof Error ? esError.message : 'Unknown error');
                }
                return updatedTasks;
            }
            catch (error) {
                throw new Error(`Failed to bulk update tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }
};
