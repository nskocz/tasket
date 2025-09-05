import { gql } from '@apollo/client/core';

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
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

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
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

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const TOGGLE_TASK_COMPLETE = gql`
  mutation ToggleTaskComplete($id: ID!) {
    toggleTaskComplete(id: $id) {
      id
      completed
      completedAt
    }
  }
`;

export const TOGGLE_TASK_PIN = gql`
  mutation ToggleTaskPin($id: ID!) {
    toggleTaskPin(id: $id) {
      id
      pinned
    }
  }
`;

export const BULK_DELETE_TASKS = gql`
  mutation BulkDeleteTasks($ids: [ID!]!) {
    bulkDeleteTasks(ids: $ids)
  }
`;

export const BULK_UPDATE_TASKS = gql`
  mutation BulkUpdateTasks($ids: [ID!]!, $input: UpdateTaskInput!) {
    bulkUpdateTasks(ids: $ids, input: $input) {
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