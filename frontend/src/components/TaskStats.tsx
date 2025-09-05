'use client';

import { useQuery } from '@apollo/client/react';
import { GET_TASK_STATS } from '@/lib/graphql/queries';
import { TaskStats as TaskStatsType } from '@/types/task';
import { CheckCircle, Circle, Pin, Calendar, Clock, Target } from 'lucide-react';

export function TaskStats() {
  const { data, loading, error } = useQuery<{ getTaskStats: TaskStatsType }>(GET_TASK_STATS);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-600 rounded w-8 mx-auto mb-2"></div>
                <div className="h-6 bg-gray-600 rounded w-12 mx-auto mb-1"></div>
                <div className="h-4 bg-gray-600 rounded w-16 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
        <p className="text-red-400 text-sm">Failed to load statistics</p>
      </div>
    );
  }

  const stats = data?.getTaskStats;

  if (!stats) return null;

  const statItems = [
    {
      icon: Target,
      value: stats.totalTasks,
      label: 'Total Tasks',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    },
    {
      icon: CheckCircle,
      value: stats.completedTasks,
      label: 'Completed',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Circle,
      value: stats.pendingTasks,
      label: 'Pending',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Pin,
      value: stats.pinnedTasks,
      label: 'Pinned',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Calendar,
      value: stats.todayTasks,
      label: 'Today',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      icon: Clock,
      value: stats.overdueTasks,
      label: 'Overdue',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Task Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="text-center">
              <div className={`inline-flex p-3 rounded-full ${item.bgColor} mb-2`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="text-2xl font-bold text-white">
                {item.value}
              </div>
              <div className="text-sm text-gray-200">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Rate */}
      {stats.totalTasks > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-200">Completion Rate</span>
            <span className="text-sm font-medium text-white">
              {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(stats.completedTasks / stats.totalTasks) * 100}%`
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}