'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { TaskStats } from './TaskStats';
import { useTheme } from '@/contexts/ThemeContext';
import { Plus, Moon, Sun, Sparkles, Menu, MessageSquare, Calendar, Search, BarChart3, Settings, Edit3, Trash2, Home, CalendarDays, CalendarRange, History, ChevronDown, ChevronRight } from 'lucide-react';
import { GET_TASKS } from '@/lib/graphql/queries';
import { TasksResponse, Task } from '@/types/task';

export function TaskDashboard() {
  const { theme, toggleTheme } = useTheme();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pastTasksExpanded, setPastTasksExpanded] = useState(false);

  // Get tasks to check if we have any
  const { data: tasksData, loading } = useQuery<{ getTasks: TasksResponse }>(GET_TASKS, {
    variables: {
      limit: 1,
      offset: 0,
    },
  });

  // Get recent tasks sorted by priority (high -> medium -> low) and creation date
  const { data: recentTasksData, loading: recentLoading } = useQuery<{ getTasks: TasksResponse }>(GET_TASKS, {
    variables: {
      filter: { completed: false },
      limit: 5,
      offset: 0,
      sortBy: "createdAt",
      sortOrder: "DESC"
    },
  });

  const hasTasks = tasksData?.getTasks.tasks && tasksData.getTasks.tasks.length > 0;

  // Sort recent tasks by priority: high -> medium -> low
  const sortedRecentTasks = recentTasksData?.getTasks.tasks?.slice().sort((a, b) => {
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    // If same priority, sort by creation date (newest first)
    if (priorityDiff === 0) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return priorityDiff;
  }) || [];

  const handleNewTask = () => {
    setShowTaskForm(true);
    setSelectedConversation(null);
  };

  const handleHome = () => {
    setSelectedConversation(null);
    setSearchQuery('');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setSelectedConversation('search');
    }
  };

  // Helper function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Handle clicking on recent task
  const handleRecentTaskClick = (taskId: string) => {
    setSelectedConversation(`task-${taskId}`);
  };

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* ChatGPT-style Sidebar */}
      <div className={`bg-gray-900 border-r border-gray-700 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-16' : 'w-80'
      } flex flex-col flex-shrink-0 relative z-10`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-end">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-4">
            <div>
              {/* Main Navigation */}
              <div className="mb-6">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Views
                </div>
                
                <button
                  onClick={handleHome}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium sidebar-item animate-fadeIn ${
                    selectedConversation === null 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-200 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">Home</span>
                  </div>
                </button>

                <div className="h-2"></div>

                <button
                  onClick={handleNewTask}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white sidebar-item animate-fadeIn animate-delay-75"
                >
                  <div className="flex items-center gap-3">
                    <Plus className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">New Task</span>
                  </div>
                </button>

                <div className="h-2"></div>

                <button
                  onClick={() => setSelectedConversation('search')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium sidebar-item animate-fadeIn animate-delay-150 ${
                    selectedConversation === 'search' 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-200 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">Search Tasks</span>
                  </div>
                </button>

                <div className="h-2"></div>

                <button
                  onClick={() => setSelectedConversation('today')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium sidebar-item animate-fadeIn animate-delay-225 ${
                    selectedConversation === 'today' 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-200 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">Today's Tasks</span>
                  </div>
                </button>

                <div className="h-2"></div>

                <button
                  onClick={() => setSelectedConversation('week')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                    selectedConversation === 'week' 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-200 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">Week's Tasks</span>
                  </div>
                </button>

                <div className="h-2"></div>

                <button
                  onClick={() => setSelectedConversation('month')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                    selectedConversation === 'month' 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-200 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CalendarRange className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">Month's Tasks</span>
                  </div>
                </button>

                <div className="h-2"></div>

                <button
                  onClick={() => setSelectedConversation('all')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                    selectedConversation === 'all' 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-200 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">All Tasks</span>
                  </div>
                </button>

                <div className="h-2"></div>

                <button
                  onClick={() => setSelectedConversation('analytics')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                    selectedConversation === 'analytics' 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-200 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">Analytics</span>
                  </div>
                </button>

                <div className="h-2"></div>

                {/* Past Tasks Section */}
                <button
                  onClick={() => setPastTasksExpanded(!pastTasksExpanded)}
                  className="w-full text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium text-gray-200 hover:bg-gray-800 hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate flex-1">Past Tasks</span>
                    {pastTasksExpanded ? (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    )}
                  </div>
                </button>

                {/* Past Tasks Submenu */}
                {pastTasksExpanded && (
                  <div className="ml-4 pl-4 border-l border-gray-700 space-y-1 mt-1">
                    <button
                      onClick={() => setSelectedConversation('past-week')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-xs font-medium ${
                        selectedConversation === 'past-week' 
                          ? 'bg-gray-800 text-white' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      Past Week
                    </button>
                    <button
                      onClick={() => setSelectedConversation('past-month')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-xs font-medium ${
                        selectedConversation === 'past-month' 
                          ? 'bg-gray-800 text-white' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      Past Month
                    </button>
                    <button
                      onClick={() => setSelectedConversation('past-3months')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-xs font-medium ${
                        selectedConversation === 'past-3months' 
                          ? 'bg-gray-800 text-white' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      Past 3 Months
                    </button>
                    <button
                      onClick={() => setSelectedConversation('past-6months')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-xs font-medium ${
                        selectedConversation === 'past-6months' 
                          ? 'bg-gray-800 text-white' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      Past 6 Months
                    </button>
                    <button
                      onClick={() => setSelectedConversation('past-year')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-xs font-medium ${
                        selectedConversation === 'past-year' 
                          ? 'bg-gray-800 text-white' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      Past Year
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Tasks */}
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Recent Tasks {recentLoading ? '(Loading...)' : `(${sortedRecentTasks.length})`}
                </div>
                
                {recentLoading ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    Loading recent tasks...
                  </div>
                ) : sortedRecentTasks.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No recent tasks found
                  </div>
                ) : (
                  sortedRecentTasks.map((task, index) => (
                    <div key={task.id} className="animate-slideIn" style={{ animationDelay: `${index * 50}ms` }}>
                      <button
                        onClick={() => handleRecentTaskClick(task.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm task-item ${
                          selectedConversation === `task-${task.id}` 
                            ? 'bg-gray-800 text-white' 
                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 ${getPriorityColor(task.priority)} rounded-full flex-shrink-0 priority-dot`}></div>
                          <span className="truncate">{task.title}</span>
                          <div className="ml-auto text-xs text-gray-600 uppercase font-medium">
                            {task.priority}
                          </div>
                        </div>
                      </button>
                      {index < sortedRecentTasks.length - 1 && <div className="h-1"></div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="border-t border-gray-700">
            {/* User Section */}
            <div className="p-3">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-left">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">G</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-100 text-sm font-medium truncate">Guest</div>
                  <div className="text-gray-200 text-xs truncate">Not signed in</div>
                </div>
                <div className="text-gray-500">
                  <Settings className="w-4 h-4" />
                </div>
              </button>
            </div>
            
            {/* App Info & Theme */}
            <div className="p-3 border-t border-gray-800">
              <div className="flex items-center gap-3 text-gray-100 text-sm">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="font-medium text-xs">Tasket</span>
                <button
                  onClick={toggleTheme}
                  className="ml-auto p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed state icons */}
        {sidebarCollapsed && (
          <div className="flex flex-col h-full p-2">
            <div className="space-y-2 flex-1">
              <button
                onClick={handleHome}
                className={`w-full p-3 rounded-lg transition-colors flex justify-center ${
                  selectedConversation === null 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="Home"
              >
                <Home className="w-5 h-5" />
              </button>
              <button
                onClick={handleNewTask}
                className="w-full p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex justify-center"
                title="New Task"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedConversation('search')}
                className={`w-full p-3 rounded-lg transition-colors flex justify-center ${
                  selectedConversation === 'search' 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="Search Tasks"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedConversation('today')}
                className={`w-full p-3 rounded-lg transition-colors flex justify-center ${
                  selectedConversation === 'today' 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="Today's Tasks"
              >
                <Calendar className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedConversation('week')}
                className={`w-full p-3 rounded-lg transition-colors flex justify-center ${
                  selectedConversation === 'week' 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="Week's Tasks"
              >
                <CalendarDays className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedConversation('month')}
                className={`w-full p-3 rounded-lg transition-colors flex justify-center ${
                  selectedConversation === 'month' 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="Month's Tasks"
              >
                <CalendarRange className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedConversation('all')}
                className={`w-full p-3 rounded-lg transition-colors flex justify-center ${
                  selectedConversation === 'all' 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="All Tasks"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedConversation('analytics')}
                className={`w-full p-3 rounded-lg transition-colors flex justify-center ${
                  selectedConversation === 'analytics' 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="Analytics"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setPastTasksExpanded(true);
                  setSelectedConversation('past-month');
                }}
                className={`w-full p-3 rounded-lg transition-colors flex justify-center ${
                  selectedConversation?.startsWith('past-') 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title="Past Tasks"
              >
                <History className="w-5 h-5" />
              </button>
            </div>
            
            {/* Collapsed user avatar */}
            <div className="border-t border-gray-700 pt-2">
              <button 
                className="w-full p-2 rounded-lg hover:bg-gray-800 transition-colors flex justify-center"
                title="Guest (Not signed in)"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">G</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-900">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedConversation ? (
            /* Task View */
            <div className="flex-1 overflow-y-auto bg-gray-900 animate-fadeIn">
              <div className="max-w-4xl mx-auto p-6 min-h-full">
                {selectedConversation === 'today' && (
                  <>
                    <h1 className="text-2xl font-bold text-gray-100 mb-6">
                      Today's Tasks
                    </h1>
                    <TaskList 
                      viewMode="today"
                      selectedDate={new Date()}
                      searchQuery=""
                    />
                  </>
                )}
                {selectedConversation === 'week' && (
                  <>
                    <h1 className="text-2xl font-bold text-gray-100 mb-6">
                      Week's Tasks
                    </h1>
                    <TaskList 
                      viewMode="week"
                      selectedDate={new Date()}
                      searchQuery=""
                    />
                  </>
                )}
                {selectedConversation === 'month' && (
                  <>
                    <h1 className="text-2xl font-bold text-gray-100 mb-6">
                      Month's Tasks
                    </h1>
                    <TaskList 
                      viewMode="month"
                      selectedDate={new Date()}
                      searchQuery=""
                    />
                  </>
                )}
                {selectedConversation === 'all' && (
                  <>
                    <h1 className="text-2xl font-bold text-gray-100 mb-6">
                      All Tasks
                    </h1>
                    <TaskList 
                      viewMode="all"
                      selectedDate={new Date()}
                      searchQuery=""
                    />
                  </>
                )}
                {selectedConversation === 'analytics' && (
                  <>
                    <h1 className="text-2xl font-bold text-gray-100 mb-6">
                      Analytics
                    </h1>
                    <TaskStats />
                  </>
                )}
                {selectedConversation === 'search' && (
                  <>
                    <h1 className="text-2xl font-bold text-gray-100 mb-6">
                      Search Results
                    </h1>
                    <TaskList 
                      viewMode="search"
                      selectedDate={new Date()}
                      searchQuery={searchQuery}
                    />
                  </>
                )}
                {selectedConversation === 'past-week' && (
                  <>
                    <h1 className="text-2xl font-bold text-gray-100 mb-6">
                      Past Week
                    </h1>
                    <TaskList 
                      viewMode="past-week"
                      selectedDate={new Date()}
                      searchQuery=""
                    />
                  </>
                )}
                {selectedConversation === 'past-month' && (
                  <>
                    <h1 className="text-2xl font-bold text-gray-100 mb-6">
                      Past Month
                    </h1>
                    <TaskList 
                      viewMode="past-month"
                      selectedDate={new Date()}
                      searchQuery=""
                    />
                  </>
                )}
                {selectedConversation === 'past-3months' && (
                  <>
                    <h1 className="text-2xl font-bold text-gray-100 mb-6">
                      Past 3 Months
                    </h1>
                    <TaskList 
                      viewMode="past-3months"
                      selectedDate={new Date()}
                      searchQuery=""
                    />
                  </>
                )}
                {selectedConversation === 'past-6months' && (
                  <>
                    <h1 className="text-2xl font-bold text-gray-100 mb-6">
                      Past 6 Months
                    </h1>
                    <TaskList 
                      viewMode="past-6months"
                      selectedDate={new Date()}
                      searchQuery=""
                    />
                  </>
                )}
                {selectedConversation === 'past-year' && (
                  <>
                    <h1 className="text-2xl font-bold text-gray-100 mb-6">
                      Past Year
                    </h1>
                    <TaskList 
                      viewMode="past-year"
                      selectedDate={new Date()}
                      searchQuery=""
                    />
                  </>
                )}
                {selectedConversation?.startsWith('task-') && (
                  <>
                    <h1 className="text-2xl font-bold text-gray-100 mb-6">
                      Task Details
                    </h1>
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      {(() => {
                        const taskId = selectedConversation.replace('task-', '');
                        const selectedTask = sortedRecentTasks.find(task => task.id === taskId);
                        if (!selectedTask) {
                          return <div className="text-gray-400">Task not found</div>;
                        }
                        
                        return (
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-100 mb-2">{selectedTask.title}</h3>
                                {selectedTask.description && (
                                  <p className="text-gray-300 mb-4">{selectedTask.description}</p>
                                )}
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                selectedTask.priority === 'high' ? 'bg-red-100 text-red-800' :
                                selectedTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {selectedTask.priority.toUpperCase()} PRIORITY
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Created:</span>
                                <div className="text-gray-300">{new Date(selectedTask.createdAt).toLocaleDateString()}</div>
                              </div>
                              {selectedTask.dueDate && (
                                <div>
                                  <span className="text-gray-500">Due:</span>
                                  <div className="text-gray-300">{new Date(selectedTask.dueDate).toLocaleDateString()}</div>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-500">Status:</span>
                                <div className="text-gray-300">{selectedTask.completed ? 'Completed' : 'Pending'}</div>
                              </div>
                              {selectedTask.tags.length > 0 && (
                                <div>
                                  <span className="text-gray-500">Tags:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedTask.tags.map((tag) => (
                                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center bg-gray-900 animate-fadeIn">
              <div className="text-center max-w-2xl mx-auto p-6 animate-slideUp">
                {loading ? (
                  <div className="text-gray-100 animate-fadeIn">
                    <div className="w-8 h-8 spinner-enhanced border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <div className="animate-pulse-slow">Loading...</div>
                  </div>
                ) : !hasTasks ? (
                  /* Empty State */
                  <>
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-bounce-once glow">
                      <Sparkles className="w-10 h-10 text-white float" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-100 mb-6">
                      Welcome to Tasket
                    </h1>
                    <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                      Your intelligent task management companion. Start by creating your first task, or explore what Tasket can do for you.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 card-hover animate-slideUp animate-delay-75">
                        <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
                          <Plus className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-gray-100 mb-2 text-sm">Create Tasks</h3>
                        <p className="text-gray-200 text-xs">
                          Quickly add and organize your tasks with priorities and due dates
                        </p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 card-hover animate-slideUp animate-delay-150">
                        <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
                          <BarChart3 className="w-5 h-5 text-green-400" />
                        </div>
                        <h3 className="font-semibold text-gray-100 mb-2 text-sm">Track Progress</h3>
                        <p className="text-gray-200 text-xs">
                          Monitor your productivity with detailed analytics and insights
                        </p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 card-hover animate-slideUp animate-delay-225">
                        <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
                          <Search className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-gray-100 mb-2 text-sm">Stay Organized</h3>
                        <p className="text-gray-200 text-xs">
                          Search, filter, and manage your tasks effortlessly
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleNewTask}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium text-lg shadow-lg hover:shadow-xl animate-scaleIn glow"
                    >
                      Create Your First Task
                    </button>
                  </>
                ) : (
                  /* Has Tasks - Welcome Back */
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-100 mb-4">
                      Welcome back to Tasket
                    </h1>
                    <p className="text-lg text-gray-200 mb-8">
                      Ready to tackle your tasks? Choose what you'd like to work on today.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
                      <button
                        onClick={() => setSelectedConversation('today')}
                        className="bg-gray-800 border border-gray-700 rounded-xl px-6 py-12 card-hover group min-h-[200px] w-full flex flex-col items-center justify-center text-center animate-slideUp"
                      >
                        <Calendar className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 float mx-auto" />
                        <h3 className="font-bold text-gray-100 mb-3 text-xl">Today's Tasks</h3>
                        <p className="text-gray-200 text-sm leading-relaxed max-w-sm">
                          Focus on what's due today
                        </p>
                      </button>
                      <button
                        onClick={() => setSelectedConversation('all')}
                        className="bg-gray-800 border border-gray-700 rounded-xl px-6 py-12 card-hover group min-h-[200px] w-full flex flex-col items-center justify-center text-center animate-slideUp animate-delay-75"
                      >
                        <MessageSquare className="w-12 h-12 text-green-400 mb-4 group-hover:scale-110 float mx-auto" />
                        <h3 className="font-bold text-gray-100 mb-3 text-xl">All Tasks</h3>
                        <p className="text-gray-200 text-sm leading-relaxed max-w-sm">
                          View your complete task list
                        </p>
                      </button>
                      <button
                        onClick={() => setSelectedConversation('analytics')}
                        className="bg-gray-800 border border-gray-700 rounded-xl px-6 py-12 card-hover group min-h-[200px] w-full flex flex-col items-center justify-center text-center animate-slideUp animate-delay-150"
                      >
                        <BarChart3 className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 float mx-auto" />
                        <h3 className="font-bold text-gray-100 mb-3 text-xl">Analytics</h3>
                        <p className="text-gray-200 text-sm leading-relaxed max-w-sm">
                          See your productivity insights
                        </p>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          isOpen={showTaskForm}
          onClose={() => setShowTaskForm(false)}
          onTaskCreated={() => {
            setShowTaskForm(false);
            // If we don't have a conversation selected, go to all tasks
            if (!selectedConversation) {
              setSelectedConversation('all');
            }
          }}
        />
      )}
    </div>
  );
}