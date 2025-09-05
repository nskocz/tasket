import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar Date

  enum Priority {
    low
    medium
    high
  }

  type Task {
    id: ID!
    title: String!
    description: String
    completed: Boolean!
    pinned: Boolean!
    priority: Priority!
    dueDate: Date
    createdAt: Date!
    updatedAt: Date!
    completedAt: Date
    tags: [String!]!
    userId: String!
  }

  input CreateTaskInput {
    title: String!
    description: String
    priority: Priority = medium
    dueDate: Date
    tags: [String!] = []
  }

  input UpdateTaskInput {
    title: String
    description: String
    completed: Boolean
    pinned: Boolean
    priority: Priority
    dueDate: Date
    tags: [String!]
  }

  input TaskFilter {
    completed: Boolean
    pinned: Boolean
    priority: Priority
    dateFrom: Date
    dateTo: Date
    tags: [String!]
    search: String
  }

  type TasksResponse {
    tasks: [Task!]!
    total: Int!
    hasMore: Boolean!
  }

  type Query {
    getTasks(
      filter: TaskFilter
      limit: Int = 20
      offset: Int = 0
      sortBy: String = "createdAt"
      sortOrder: String = "DESC"
    ): TasksResponse!
    
    getTask(id: ID!): Task
    
    getTasksByDate(date: Date!): [Task!]!
    
    searchTasks(
      query: String!
      limit: Int = 20
      offset: Int = 0
    ): TasksResponse!
    
    getTaskStats: TaskStats!
  }

  type TaskStats {
    totalTasks: Int!
    completedTasks: Int!
    pendingTasks: Int!
    pinnedTasks: Int!
    todayTasks: Int!
    overdueTasks: Int!
  }

  type Mutation {
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Boolean!
    toggleTaskComplete(id: ID!): Task!
    toggleTaskPin(id: ID!): Task!
    bulkDeleteTasks(ids: [ID!]!): Boolean!
    bulkUpdateTasks(ids: [ID!]!, input: UpdateTaskInput!): [Task!]!
  }

  type Subscription {
    taskAdded: Task!
    taskUpdated: Task!
    taskDeleted: ID!
  }
`;