'use client';

import { useQuery } from '@apollo/client/react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, subYears } from 'date-fns';
import { GET_TASKS, GET_TASKS_BY_DATE, SEARCH_TASKS } from '@/lib/graphql/queries';
import { TasksResponse, Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface TaskListProps {
  viewMode: 'today' | 'week' | 'month' | 'all' | 'search' | 'past-week' | 'past-month' | 'past-3months' | 'past-6months' | 'past-year';
  selectedDate: Date;
  searchQuery: string;
}

export function TaskList({ viewMode, selectedDate, searchQuery }: TaskListProps) {
  const [loadingMore, setLoadingMore] = useState(false);

  // Calculate date ranges for week and month
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start week on Monday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  // Calculate past date ranges
  const pastWeekStart = startOfWeek(subWeeks(selectedDate, 1), { weekStartsOn: 1 });
  const pastWeekEnd = endOfWeek(subWeeks(selectedDate, 1), { weekStartsOn: 1 });
  
  const pastMonthStart = startOfMonth(subMonths(selectedDate, 1));
  const pastMonthEnd = endOfMonth(subMonths(selectedDate, 1));
  
  const past3MonthsStart = startOfMonth(subMonths(selectedDate, 3));
  const past3MonthsEnd = endOfMonth(subMonths(selectedDate, 1));
  
  const past6MonthsStart = startOfMonth(subMonths(selectedDate, 6));
  const past6MonthsEnd = endOfMonth(subMonths(selectedDate, 1));
  
  const pastYearStart = startOfMonth(subYears(selectedDate, 1));
  const pastYearEnd = endOfMonth(subMonths(selectedDate, 1));

  // Query for today/specific date
  const todayQuery = useQuery<{ getTasksByDate: Task[] }>(GET_TASKS_BY_DATE, {
    variables: { date: format(selectedDate, 'yyyy-MM-dd') },
    skip: viewMode !== 'today'
  });

  // Query for week's tasks
  const weekQuery = useQuery<{ getTasks: TasksResponse }>(GET_TASKS, {
    variables: {
      filter: {
        dateFrom: format(weekStart, 'yyyy-MM-dd'),
        dateTo: format(weekEnd, 'yyyy-MM-dd')
      },
      limit: 100,
      offset: 0,
      sortBy: 'dueDate',
      sortOrder: 'ASC'
    },
    skip: viewMode !== 'week'
  });

  // Query for month's tasks
  const monthQuery = useQuery<{ getTasks: TasksResponse }>(GET_TASKS, {
    variables: {
      filter: {
        dateFrom: format(monthStart, 'yyyy-MM-dd'),
        dateTo: format(monthEnd, 'yyyy-MM-dd')
      },
      limit: 200,
      offset: 0,
      sortBy: 'dueDate',
      sortOrder: 'ASC'
    },
    skip: viewMode !== 'month'
  });

  // Query for all tasks
  const allTasksQuery = useQuery<{ getTasks: TasksResponse }>(GET_TASKS, {
    variables: {
      limit: 20,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    },
    skip: viewMode !== 'all'
  });

  // Query for search results
  const searchQuery_query = useQuery<{ searchTasks: TasksResponse }>(SEARCH_TASKS, {
    variables: {
      query: searchQuery,
      limit: 20,
      offset: 0
    },
    skip: viewMode !== 'search' || !searchQuery
  });

  // Past queries
  const pastWeekQuery = useQuery<{ getTasks: TasksResponse }>(GET_TASKS, {
    variables: {
      filter: {
        dateFrom: format(pastWeekStart, 'yyyy-MM-dd'),
        dateTo: format(pastWeekEnd, 'yyyy-MM-dd')
      },
      limit: 100,
      offset: 0,
      sortBy: 'completedAt',
      sortOrder: 'DESC'
    },
    skip: viewMode !== 'past-week'
  });

  const pastMonthQuery = useQuery<{ getTasks: TasksResponse }>(GET_TASKS, {
    variables: {
      filter: {
        dateFrom: format(pastMonthStart, 'yyyy-MM-dd'),
        dateTo: format(pastMonthEnd, 'yyyy-MM-dd')
      },
      limit: 200,
      offset: 0,
      sortBy: 'completedAt',
      sortOrder: 'DESC'
    },
    skip: viewMode !== 'past-month'
  });

  const past3MonthsQuery = useQuery<{ getTasks: TasksResponse }>(GET_TASKS, {
    variables: {
      filter: {
        dateFrom: format(past3MonthsStart, 'yyyy-MM-dd'),
        dateTo: format(past3MonthsEnd, 'yyyy-MM-dd')
      },
      limit: 300,
      offset: 0,
      sortBy: 'completedAt',
      sortOrder: 'DESC'
    },
    skip: viewMode !== 'past-3months'
  });

  const past6MonthsQuery = useQuery<{ getTasks: TasksResponse }>(GET_TASKS, {
    variables: {
      filter: {
        dateFrom: format(past6MonthsStart, 'yyyy-MM-dd'),
        dateTo: format(past6MonthsEnd, 'yyyy-MM-dd')
      },
      limit: 500,
      offset: 0,
      sortBy: 'completedAt',
      sortOrder: 'DESC'
    },
    skip: viewMode !== 'past-6months'
  });

  const pastYearQuery = useQuery<{ getTasks: TasksResponse }>(GET_TASKS, {
    variables: {
      filter: {
        dateFrom: format(pastYearStart, 'yyyy-MM-dd'),
        dateTo: format(pastYearEnd, 'yyyy-MM-dd')
      },
      limit: 1000,
      offset: 0,
      sortBy: 'completedAt',
      sortOrder: 'DESC'
    },
    skip: viewMode !== 'past-year'
  });

  const loadMore = async () => {
    if (viewMode === 'week' && weekQuery.data?.getTasks.hasMore && !loadingMore) {
      setLoadingMore(true);
      try {
        await weekQuery.fetchMore({
          variables: {
            offset: weekQuery.data.getTasks.tasks.length
          }
        });
      } finally {
        setLoadingMore(false);
      }
    } else if (viewMode === 'month' && monthQuery.data?.getTasks.hasMore && !loadingMore) {
      setLoadingMore(true);
      try {
        await monthQuery.fetchMore({
          variables: {
            offset: monthQuery.data.getTasks.tasks.length
          }
        });
      } finally {
        setLoadingMore(false);
      }
    } else if (viewMode === 'all' && allTasksQuery.data?.getTasks.hasMore && !loadingMore) {
      setLoadingMore(true);
      try {
        await allTasksQuery.fetchMore({
          variables: {
            offset: allTasksQuery.data.getTasks.tasks.length
          }
        });
      } finally {
        setLoadingMore(false);
      }
    } else if (viewMode === 'search' && searchQuery_query.data?.searchTasks.hasMore && !loadingMore) {
      setLoadingMore(true);
      try {
        await searchQuery_query.fetchMore({
          variables: {
            offset: searchQuery_query.data.searchTasks.tasks.length
          }
        });
      } finally {
        setLoadingMore(false);
      }
    }
  };

  // Determine which query to use
  let tasks: Task[] = [];
  let loading = false;
  let error: unknown = null;
  let hasMore = false;
  let total = 0;

  if (viewMode === 'today') {
    tasks = todayQuery.data?.getTasksByDate || [];
    loading = todayQuery.loading;
    error = todayQuery.error;
  } else if (viewMode === 'week') {
    tasks = weekQuery.data?.getTasks.tasks || [];
    loading = weekQuery.loading;
    error = weekQuery.error;
    hasMore = weekQuery.data?.getTasks.hasMore || false;
    total = weekQuery.data?.getTasks.total || 0;
  } else if (viewMode === 'month') {
    tasks = monthQuery.data?.getTasks.tasks || [];
    loading = monthQuery.loading;
    error = monthQuery.error;
    hasMore = monthQuery.data?.getTasks.hasMore || false;
    total = monthQuery.data?.getTasks.total || 0;
  } else if (viewMode === 'all') {
    tasks = allTasksQuery.data?.getTasks.tasks || [];
    loading = allTasksQuery.loading;
    error = allTasksQuery.error;
    hasMore = allTasksQuery.data?.getTasks.hasMore || false;
    total = allTasksQuery.data?.getTasks.total || 0;
  } else if (viewMode === 'search') {
    tasks = searchQuery_query.data?.searchTasks.tasks || [];
    loading = searchQuery_query.loading;
    error = searchQuery_query.error;
    hasMore = searchQuery_query.data?.searchTasks.hasMore || false;
    total = searchQuery_query.data?.searchTasks.total || 0;
  } else if (viewMode === 'past-week') {
    tasks = pastWeekQuery.data?.getTasks.tasks || [];
    loading = pastWeekQuery.loading;
    error = pastWeekQuery.error;
    hasMore = pastWeekQuery.data?.getTasks.hasMore || false;
    total = pastWeekQuery.data?.getTasks.total || 0;
  } else if (viewMode === 'past-month') {
    tasks = pastMonthQuery.data?.getTasks.tasks || [];
    loading = pastMonthQuery.loading;
    error = pastMonthQuery.error;
    hasMore = pastMonthQuery.data?.getTasks.hasMore || false;
    total = pastMonthQuery.data?.getTasks.total || 0;
  } else if (viewMode === 'past-3months') {
    tasks = past3MonthsQuery.data?.getTasks.tasks || [];
    loading = past3MonthsQuery.loading;
    error = past3MonthsQuery.error;
    hasMore = past3MonthsQuery.data?.getTasks.hasMore || false;
    total = past3MonthsQuery.data?.getTasks.total || 0;
  } else if (viewMode === 'past-6months') {
    tasks = past6MonthsQuery.data?.getTasks.tasks || [];
    loading = past6MonthsQuery.loading;
    error = past6MonthsQuery.error;
    hasMore = past6MonthsQuery.data?.getTasks.hasMore || false;
    total = past6MonthsQuery.data?.getTasks.total || 0;
  } else if (viewMode === 'past-year') {
    tasks = pastYearQuery.data?.getTasks.tasks || [];
    loading = pastYearQuery.loading;
    error = pastYearQuery.error;
    hasMore = pastYearQuery.data?.getTasks.hasMore || false;
    total = pastYearQuery.data?.getTasks.total || 0;
  }

  // Sort tasks: pinned first, then by creation date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Separate completed and pending tasks
  const pendingTasks = sortedTasks.filter(task => !task.completed);
  const completedTasks = sortedTasks.filter(task => task.completed);

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-white">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Unable to load tasks</h3>
        <p className="text-gray-200">{error instanceof Error ? error.message : 'Something went wrong while loading your tasks'}</p>
      </div>
    );
  }

  if (tasks.length === 0 && !loading) {
    let emptyTitle = "No tasks yet";
    let emptyMessage = "Start by adding your first task to get organized!";
    let emoji = "✨";
    
    if (viewMode === 'today') {
      emptyTitle = "All clear for today!";
      emptyMessage = `No tasks scheduled for ${format(selectedDate, 'MMMM d, yyyy')}. Time to plan your day!`;
      emoji = "🌅";
    } else if (viewMode === 'week') {
      emptyTitle = "No tasks this week!";
      emptyMessage = `No tasks scheduled for ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}. Great time to plan ahead!`;
      emoji = "📅";
    } else if (viewMode === 'month') {
      emptyTitle = "No tasks this month!";
      emptyMessage = `No tasks scheduled for ${format(selectedDate, 'MMMM yyyy')}. Time to set some goals!`;
      emoji = "🗓️";
    } else if (viewMode === 'search') {
      emptyTitle = "No matching tasks";
      emptyMessage = `We couldn't find any tasks matching "${searchQuery}". Try a different search term.`;
      emoji = "🔍";
    } else if (viewMode === 'past-week') {
      emptyTitle = "No tasks from last week";
      emptyMessage = `No tasks found for ${format(pastWeekStart, 'MMM d')} - ${format(pastWeekEnd, 'MMM d, yyyy')}.`;
      emoji = "📋";
    } else if (viewMode === 'past-month') {
      emptyTitle = "No tasks from last month";
      emptyMessage = `No tasks found for ${format(pastMonthStart, 'MMMM yyyy')}.`;
      emoji = "📄";
    } else if (viewMode === 'past-3months') {
      emptyTitle = "No tasks from past 3 months";
      emptyMessage = `No tasks found from ${format(past3MonthsStart, 'MMM yyyy')} to ${format(past3MonthsEnd, 'MMM yyyy')}.`;
      emoji = "📊";
    } else if (viewMode === 'past-6months') {
      emptyTitle = "No tasks from past 6 months";
      emptyMessage = `No tasks found from ${format(past6MonthsStart, 'MMM yyyy')} to ${format(past6MonthsEnd, 'MMM yyyy')}.`;
      emoji = "📈";
    } else if (viewMode === 'past-year') {
      emptyTitle = "No tasks from past year";
      emptyMessage = `No tasks found from ${format(pastYearStart, 'MMM yyyy')} to ${format(pastYearEnd, 'MMM yyyy')}.`;
      emoji = "🗂️";
    }

    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">{emoji}</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">{emptyTitle}</h3>
        <p className="text-gray-200 text-lg max-w-md mx-auto leading-relaxed">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with count */}
      {(viewMode === 'week' || viewMode === 'month' || viewMode === 'all' || viewMode === 'search' || viewMode.startsWith('past-')) && total > 0 && (
        <div className="text-sm text-gray-200">
          Showing {tasks.length} of {total} tasks
          {viewMode === 'search' && ` for "${searchQuery}"`}
          {viewMode === 'week' && ` for ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`}
          {viewMode === 'month' && ` for ${format(selectedDate, 'MMMM yyyy')}`}
          {viewMode === 'past-week' && ` from ${format(pastWeekStart, 'MMM d')} - ${format(pastWeekEnd, 'MMM d, yyyy')}`}
          {viewMode === 'past-month' && ` from ${format(pastMonthStart, 'MMMM yyyy')}`}
          {viewMode === 'past-3months' && ` from ${format(past3MonthsStart, 'MMM yyyy')} - ${format(past3MonthsEnd, 'MMM yyyy')}`}
          {viewMode === 'past-6months' && ` from ${format(past6MonthsStart, 'MMM yyyy')} - ${format(past6MonthsEnd, 'MMM yyyy')}`}
          {viewMode === 'past-year' && ` from ${format(pastYearStart, 'MMM yyyy')} - ${format(pastYearEnd, 'MMM yyyy')}`}
        </div>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <h3 className="text-lg font-semibold text-white">
              Pending ({pendingTasks.length})
            </h3>
          </div>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-white">
              Completed ({completedTasks.length})
            </h3>
          </div>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-6">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="bg-gray-800 border border-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center mx-auto gap-2 font-medium"
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            {loadingMore ? 'Loading more tasks...' : 'Load More Tasks'}
          </button>
        </div>
      )}
    </div>
  );
}