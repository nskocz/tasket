import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // For now, we'll use a dummy user ID
  // In a real app, you'd get the token from localStorage or a secure cookie
  return {
    headers: {
      ...headers,
      authorization: 'default-user',
    }
  }
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getTasks: {
            keyArgs: ['filter', 'sortBy', 'sortOrder'],
            merge(existing = { tasks: [], total: 0, hasMore: false }, incoming) {
              return {
                ...incoming,
                tasks: [...existing.tasks, ...incoming.tasks]
              };
            },
          },
          getTasksByDate: {
            keyArgs: ['date'],
          },
          searchTasks: {
            keyArgs: ['query'],
          },
          getTaskStats: {
            // Cache stats for 30 seconds to reduce redundant requests
            ttl: 30000,
          }
        },
      },
      Task: {
        fields: {
          // Enable optimistic updates for task fields
          completed: {
            merge: true,
          },
          pinned: {
            merge: true,
          },
          completedAt: {
            merge: true,
          }
        }
      }
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      // Reduce network requests by using cache-first policy
      fetchPolicy: 'cache-first',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
    }
  },
});