import { gql } from '@apollo/client/core';

export const GET_TASKS = gql`
  query GetTasks(
    $filter: TaskFilter
    $limit: Int = 20
    $offset: Int = 0
    $sortBy: String = "createdAt"
    $sortOrder: String = "DESC"
  ) {
    getTasks(
      filter: $filter
      limit: $limit
      offset: $offset
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      tasks {
        id
        title
        description
        completed
        pinned
        priority
        dueDate
        createdAt
        updatedAt
        completedAt
        tags
      }
      total
      hasMore
    }
  }
`;

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    getTask(id: $id) {
      id
      title
      description
      completed
      pinned
      priority
      dueDate
      createdAt
      updatedAt
      completedAt
      tags
    }
  }
`;

export const GET_TASKS_BY_DATE = gql`
  query GetTasksByDate($date: Date!) {
    getTasksByDate(date: $date) {
      id
      title
      description
      completed
      pinned
      priority
      dueDate
      createdAt
      updatedAt
      completedAt
      tags
    }
  }
`;

export const SEARCH_TASKS = gql`
  query SearchTasks(
    $query: String!
    $limit: Int = 20
    $offset: Int = 0
  ) {
    searchTasks(
      query: $query
      limit: $limit
      offset: $offset
    ) {
      tasks {
        id
        title
        description
        completed
        pinned
        priority
        dueDate
        createdAt
        updatedAt
        completedAt
        tags
      }
      total
      hasMore
    }
  }
`;

export const GET_TASK_STATS = gql`
  query GetTaskStats {
    getTaskStats {
      totalTasks
      completedTasks
      pendingTasks
      pinnedTasks
      todayTasks
      overdueTasks
    }
  }
`;