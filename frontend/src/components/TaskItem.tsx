'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { format } from 'date-fns';
import { Task } from '@/types/task';
import { 
  TOGGLE_TASK_COMPLETE, 
  TOGGLE_TASK_PIN, 
  DELETE_TASK 
} from '@/lib/graphql/mutations';
import { GET_TASKS, GET_TASK_STATS, GET_TASKS_BY_DATE } from '@/lib/graphql/queries';
import { TaskForm } from './TaskForm';
import { 
  Check, 
  Circle, 
  Pin, 
  Edit3, 
  Trash2, 
  Calendar, 
  Tag,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react';

interface TaskItemProps {
  task: Task;
}

const priorityColors = {
  low: 'text-green-600 bg-green-100',
  medium: 'text-yellow-600 bg-yellow-100',
  high: 'text-red-600 bg-red-100'
};

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

export function TaskItem({ task }: TaskItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const [toggleComplete, { loading: toggleLoading }] = useMutation(TOGGLE_TASK_COMPLETE, {
    optimisticResponse: {
      toggleTaskComplete: {
        id: task.id,
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null,
        __typename: 'Task'
      }
    },
    update: (cache, { data }) => {
      if (data?.toggleTaskComplete) {
        // Update the task in the cache immediately
        cache.modify({
          id: cache.identify(task),
          fields: {
            completed: () => data.toggleTaskComplete.completed,
            completedAt: () => data.toggleTaskComplete.completedAt
          }
        });
      }
    },
    refetchQueries: [GET_TASK_STATS] // Only refetch stats, not the full task list
  });

  const [togglePin, { loading: pinLoading }] = useMutation(TOGGLE_TASK_PIN, {
    optimisticResponse: {
      toggleTaskPin: {
        id: task.id,
        pinned: !task.pinned,
        __typename: 'Task'
      }
    },
    update: (cache, { data }) => {
      if (data?.toggleTaskPin) {
        // Update the task in the cache immediately
        cache.modify({
          id: cache.identify(task),
          fields: {
            pinned: () => data.toggleTaskPin.pinned
          }
        });
      }
    }
  });

  const [deleteTask, { loading: deleteLoading }] = useMutation(DELETE_TASK, {
    update: (cache, { data }) => {
      if (data?.deleteTask) {
        // Remove the task from the cache immediately
        cache.evict({ id: cache.identify(task) });
        cache.gc(); // Clean up dangling references
      }
    },
    refetchQueries: [GET_TASK_STATS] // Only refetch stats
  });

  const handleToggleComplete = async () => {
    try {
      await toggleComplete({ variables: { id: task.id } });
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleTogglePin = async () => {
    try {
      await togglePin({ variables: { id: task.id } });
    } catch (error) {
      console.error('Error toggling task pin:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask({ variables: { id: task.id } });
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  return (
    <div className={`bg-card border border-border rounded-xl hover:bg-card-hover transition-all duration-200 group ${
      task.pinned 
        ? 'ring-2 ring-purple-200 dark:ring-purple-800 bg-purple-50/50 dark:bg-purple-900/10' 
        : task.completed 
        ? 'opacity-75' 
        : isOverdue
        ? 'ring-1 ring-red-200 dark:ring-red-800'
        : ''
    }`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Complete Toggle */}
          <button
            onClick={handleToggleComplete}
            disabled={toggleLoading}
            className={`mt-1 p-1 rounded-full transition-all duration-200 ${
              task.completed 
                ? 'text-green-600 hover:text-green-700 bg-green-100 dark:bg-green-900/30' 
                : 'text-gray-300 hover:text-blue-400 hover:bg-blue-400/10'
            }`}
          >
            {task.completed ? <Check size={18} /> : <Circle size={18} />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium ${
                  task.completed ? 'line-through text-gray-400' : 'text-white'
                }`}>
                  {task.title}
                </h4>
                
                {task.description && (
                  <p className={`text-sm mt-2 leading-relaxed ${
                    task.completed ? 'line-through text-gray-500' : 'text-gray-200'
                  }`}>
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {/* Priority Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                    {priorityLabels[task.priority]}
                  </span>

                  {/* Due Date */}
                  {task.dueDate && (
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      isOverdue 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Calendar size={12} />
                      {format(new Date(task.dueDate), 'MMM d')}
                      {isOverdue && <AlertCircle size={12} />}
                    </span>
                  )}

                  {/* Tags */}
                  {task.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent"
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}

                  {/* Created Date */}
                  <span className="text-xs text-muted-foreground/70">
                    {format(new Date(task.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="relative ml-2">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal size={16} />
                </button>

                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-8 z-20 w-44 bg-card rounded-xl shadow-lg border border-border py-2">
                      <button
                        onClick={() => {
                          handleTogglePin();
                          setShowMenu(false);
                        }}
                        disabled={pinLoading}
                        className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-3 transition-colors"
                      >
                        <Pin size={14} />
                        {task.pinned ? 'Unpin Task' : 'Pin Task'}
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowEditForm(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-3 transition-colors"
                      >
                        <Edit3 size={14} />
                        Edit Task
                      </button>
                      
                      <hr className="my-2 border-border" />
                      
                      <button
                        onClick={() => {
                          handleDelete();
                          setShowMenu(false);
                        }}
                        disabled={deleteLoading}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete Task
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pin Indicator */}
        {task.pinned && (
          <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium">
            <Pin size={12} />
            <span>Pinned to top</span>
          </div>
        )}
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <TaskForm
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          task={task}
          onTaskUpdated={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
}