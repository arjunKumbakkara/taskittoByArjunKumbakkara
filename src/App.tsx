import React, { useState, useEffect } from 'react';
import { Plus, History, Target, Calendar, Clock, Archive, Play, Pause, RotateCcw, Bell, Github, ExternalLink, LogOut, User } from 'lucide-react';
import { Task, DragState } from './types';
import TaskCard from './components/TaskCard';
import AddTaskModal from './components/AddTaskModal';
import TaskDetailModal from './components/TaskDetailModal';
import HistoryView from './components/HistoryView';
import AuthModal from './components/AuthModal';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { 
    tasks, 
    completedTasks, 
    loading: tasksLoading, 
    addTask, 
    completeTask, 
    deleteTask, 
    updateTaskQuadrant, 
    clearHistory 
  } = useTasks();

  const [currentView, setCurrentView] = useState<'dashboard' | 'history'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTask: null,
    dragOverQuadrant: null
  });

  // NOW section and Pomodoro timer states
  const [nowTask, setNowTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // 5 Second Rule states
  const [fiveSecondCount, setFiveSecondCount] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [showStart, setShowStart] = useState(false);

  // Load NOW task from localStorage
  useEffect(() => {
    const savedNowTask = localStorage.getItem('taskManager_nowTask');
    if (savedNowTask) {
      const parsedNowTask = JSON.parse(savedNowTask);
      setNowTask({
        ...parsedNowTask,
        createdAt: new Date(parsedNowTask.createdAt),
        completedAt: parsedNowTask.completedAt ? new Date(parsedNowTask.completedAt) : undefined
      });
    }
  }, []);

  // Save NOW task to localStorage
  useEffect(() => {
    if (nowTask) {
      localStorage.setItem('taskManager_nowTask', JSON.stringify(nowTask));
    } else {
      localStorage.removeItem('taskManager_nowTask');
    }
  }, [nowTask]);

  // Show notification function
  const showTimerNotification = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);

    // Browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('TASKITTO Timer', {
        body: message,
        icon: '/favicon.ico'
      });
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 5 Second Rule countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCountingDown && fiveSecondCount > 0) {
      interval = setInterval(() => {
        setFiveSecondCount(prev => prev - 1);
      }, 1000);
    } else if (isCountingDown && fiveSecondCount === 0) {
      setIsCountingDown(false);
      setShowStart(true);
      
      // Hide "START" after 2 seconds and auto-start timer
      setTimeout(() => {
        setShowStart(false);
        if (nowTask && !isTimerRunning) {
          setIsTimerRunning(true);
          showTimerNotification('5 Second Rule activated! Work session started!');
        }
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [isCountingDown, fiveSecondCount, nowTask, isTimerRunning]);

  // Pomodoro timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      
      // Show notification and auto switch between work and break
      if (timerMode === 'work') {
        showTimerNotification('Work session completed! Time for a 5-minute break.');
        setTimerMode('break');
        setTimeLeft(5 * 60); // 5 minute break
      } else {
        showTimerNotification('Break time is over! Ready for another 25-minute work session?');
        setTimerMode('work');
        setTimeLeft(25 * 60); // 25 minute work session
      }
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, timerMode]);

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    await addTask(taskData);
  };

  const handleCompleteTask = async (taskId: string) => {
    await completeTask(taskId);
    
    // If the completed task was the NOW task, clear it
    if (nowTask && nowTask.id === taskId) {
      setNowTask(null);
      setIsTimerRunning(false);
      setTimeLeft(25 * 60);
      setTimerMode('work');
      showTimerNotification('Task completed! Great job!');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    
    // If the deleted task was the NOW task, clear it
    if (nowTask && nowTask.id === taskId) {
      setNowTask(null);
      setIsTimerRunning(false);
      setTimeLeft(25 * 60);
      setTimerMode('work');
    }
  };

  const handleDragStart = (task: Task) => {
    setDragState({
      isDragging: true,
      draggedTask: task,
      dragOverQuadrant: null
    });
  };

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      draggedTask: null,
      dragOverQuadrant: null
    });
  };

  const handleDragOver = (e: React.DragEvent, quadrant: string) => {
    e.preventDefault();
    setDragState(prev => ({ ...prev, dragOverQuadrant: quadrant }));
  };

  const handleDragLeave = () => {
    setDragState(prev => ({ ...prev, dragOverQuadrant: null }));
  };

  const handleDrop = async (e: React.DragEvent, quadrant: 'immediate' | 'today' | 'week' | 'month') => {
    e.preventDefault();
    
    if (dragState.draggedTask && dragState.draggedTask.quadrant !== quadrant) {
      await updateTaskQuadrant(dragState.draggedTask.id, quadrant);
    }
    
    handleDragEnd();
  };

  const setAsNowTask = (task: Task) => {
    setNowTask(task);
    setIsTimerRunning(false);
    setTimeLeft(25 * 60);
    setTimerMode('work');
    showTimerNotification(`"${task.title}" is now your focus task!`);
  };

  const toggleTimer = () => {
    if (!isTimerRunning) {
      showTimerNotification(`${timerMode === 'work' ? 'Work' : 'Break'} session started!`);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(timerMode === 'work' ? 25 * 60 : 5 * 60);
    showTimerNotification('Timer reset!');
  };

  // Start 5 Second Rule countdown
  const start5SecondRule = () => {
    if (!nowTask) return;
    
    setFiveSecondCount(5);
    setIsCountingDown(true);
    setShowStart(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuadrantDeadline = (quadrant: string) => {
    const now = new Date();
    
    switch (quadrant) {
      case 'immediate':
        const immediate = new Date(now.getTime() + 25 * 60 * 1000);
        return immediate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      
      case 'today':
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        return endOfDay.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      
      case 'week':
        const sunday = new Date(now);
        const daysUntilSunday = (7 - now.getDay()) % 7;
        sunday.setDate(now.getDate() + daysUntilSunday);
        sunday.setHours(20, 0, 0, 0);
        return sunday.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      
      case 'month':
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        return endOfMonth.toLocaleDateString('en-US', { 
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      
      default:
        return '';
    }
  };

  const quadrants = [
    {
      id: 'immediate',
      title: 'Immediate Now',
      icon: Target,
      color: 'bg-red-50 border-red-200',
      headerColor: 'bg-red-500',
      emoji: '🔥'
    },
    {
      id: 'today',
      title: 'Today',
      icon: Calendar,
      color: 'bg-orange-50 border-orange-200',
      headerColor: 'bg-orange-500',
      emoji: '📅'
    },
    {
      id: 'week',
      title: 'This Week',
      icon: Clock,
      color: 'bg-blue-50 border-blue-200',
      headerColor: 'bg-blue-500',
      emoji: '📋'
    },
    {
      id: 'month',
      title: 'This Month',
      icon: Archive,
      color: 'bg-green-50 border-green-200',
      headerColor: 'bg-green-500',
      emoji: '🗓️'
    }
  ];

  const getTasksByQuadrant = (quadrant: string) => 
    tasks.filter(task => task.quadrant === quadrant);

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if user is not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Banner Section */}
        <div className="w-full bg-white shadow-sm border-b border-gray-200 overflow-hidden">
          <div className="w-full h-24 sm:h-28 md:h-32 lg:h-36 relative">
            <img
              src="/TaskittoBanner.jpg"
              alt="TASKITTO by Arjun Kumbakkara"
              className="w-full h-full object-cover object-center"
              style={{
                objectPosition: 'center 45%'
              }}
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Taskitto</h1>
            <p className="text-xl text-gray-600 mb-8">
              Your personal task management system with Pomodoro timer integration
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-3">🔥 Priority Matrix</h3>
              <p className="text-gray-600">Organize tasks using the Eisenhower Matrix for maximum productivity</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-3">⏰ Pomodoro Timer</h3>
              <p className="text-gray-600">Built-in focus timer to help you stay productive and take regular breaks</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-3">☁️ Cloud Sync</h3>
              <p className="text-gray-600">Access your tasks from anywhere with automatic cloud synchronization</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-3">📊 Progress Tracking</h3>
              <p className="text-gray-600">Track your completed tasks and monitor your productivity over time</p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
          >
            Get Started
          </button>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  if (currentView === 'history') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Target className="w-5 h-5" />
              <span>Back to Taskitto Board</span>
            </button>
          </div>
          
          <HistoryView
            completedTasks={completedTasks}
            onTaskClick={setSelectedTask}
            onClearHistory={clearHistory}
          />
        </div>
        
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section - Slightly taller to show author name */}
      <div className="w-full bg-white shadow-sm border-b border-gray-200 overflow-hidden">
        <div className="w-full h-24 sm:h-28 md:h-32 lg:h-36 relative">
          <img
            src="/TaskittoBanner.jpg"
            alt="TASKITTO by Arjun Kumbakkara"
            className="w-full h-full object-cover object-center"
            style={{
              objectPosition: 'center 45%'
            }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Taskitto Board</h2>
              {user && (
                <span className="text-sm text-gray-500">
                  Welcome, {user.email}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <a
                href="https://github.com/arjunKumbakkara"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-800 to-red-900 text-white rounded-lg hover:from-red-900 hover:to-red-950 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 group"
              >
                <Github className="w-5 h-5" />
                <span className="font-medium">Hit Arjun Kumbakkara Up</span>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              
              <button
                onClick={() => setCurrentView('history')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <History className="w-5 h-5" />
                <span className="hidden sm:inline">History</span>
                {completedTasks.length > 0 && (
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                    {completedTasks.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Task</span>
              </button>

              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timer Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-white border-l-4 border-blue-500 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Timer Notification</p>
              <p className="text-sm text-gray-500 mt-1">{notificationMessage}</p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        {/* NOW Section and Pomodoro Timer - Parallel Layout */}
        <div className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NOW Section */}
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-2xl p-6 shadow-2xl border border-purple-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">NOW</h2>
                <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  <span className="text-white text-sm font-medium">Focus Mode</span>
                </div>
              </div>
              
              {nowTask ? (
                <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
                  <h3 className="font-bold text-xl text-white mb-2">{nowTask.title}</h3>
                  <p className="text-purple-100 text-base leading-relaxed mb-6">
                    {nowTask.description || 'No description provided'}
                  </p>
                  
                  {/* 5 Second Rule Section */}
                  <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4 text-center">
                    {isCountingDown ? (
                      <div className="text-center">
                        <div className="text-6xl font-bold text-white mb-2 animate-pulse">
                          {fiveSecondCount}
                        </div>
                        <p className="text-purple-100 text-sm">Get ready to start...</p>
                      </div>
                    ) : showStart ? (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2 animate-bounce">
                          START!
                        </div>
                        <p className="text-purple-100 text-sm">Go! Begin your task now!</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <button
                          onClick={start5SecondRule}
                          disabled={isTimerRunning}
                          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                        >
                          5 Second Rule
                        </button>
                        <p className="text-purple-200 text-xs">
                          5 Second Rule by Mel Robbins
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-purple-100 text-sm">
                      🔥 Immediate Priority
                    </span>
                    <button
                      onClick={() => {
                        setNowTask(null);
                        setIsTimerRunning(false);
                        setTimeLeft(25 * 60);
                        setTimerMode('work');
                        setIsCountingDown(false);
                        setShowStart(false);
                        setFiveSecondCount(0);
                      }}
                      className="text-purple-200 hover:text-white text-sm underline"
                    >
                      Clear Focus
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20 text-center">
                  <div className="text-purple-200 mb-3">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-60" />
                  </div>
                  <p className="text-purple-100 text-lg mb-2">No task selected for focus</p>
                  <p className="text-purple-200 text-sm">
                    Choose a task from "Immediate Now" to start your focused work session
                  </p>
                </div>
              )}
            </div>
            
            {/* Pomodoro Timer Section */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-600 rounded-2xl p-6 shadow-2xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-white bg-opacity-20 rounded-full p-2">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Pomodoro Timer</h2>
                <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  <span className="text-white text-sm font-medium">
                    {timerMode === 'work' ? 'Work Session' : 'Break Time'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20 text-center">
                <div className="relative mb-6">
                  <div className="text-5xl font-bold text-white mb-4">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                    <div 
                      className="bg-white rounded-full h-3 transition-all duration-1000"
                      style={{
                        width: `${((timerMode === 'work' ? 25 * 60 : 5 * 60) - timeLeft) / (timerMode === 'work' ? 25 * 60 : 5 * 60) * 100}%`
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4 mb-4">
                  <button
                    onClick={toggleTimer}
                    disabled={!nowTask}
                    className="flex items-center justify-center w-14 h-14 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isTimerRunning ? (
                      <Pause className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
                    ) : (
                      <Play className="w-7 h-7 text-white group-hover:scale-110 transition-transform ml-1" />
                    )}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="flex items-center justify-center w-14 h-14 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200 group"
                  >
                    <RotateCcw className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                
                {!nowTask ? (
                  <p className="text-blue-200 text-sm">
                    Select a task from NOW section to enable timer
                  </p>
                ) : (
                  <p className="text-blue-100 text-sm">
                    Focus on: <span className="font-medium">{nowTask.title}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading state for tasks */}
        {tasksLoading ? (
          <div className="pb-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your tasks...</p>
          </div>
        ) : (
          /* Main Content - Task Quadrants */
          <div className="pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quadrants.map((quadrant) => (
                <div
                  key={quadrant.id}
                  className={`rounded-xl border-2 ${quadrant.color} ${
                    dragState.dragOverQuadrant === quadrant.id 
                      ? 'ring-2 ring-blue-400 border-blue-300' 
                      : ''
                  } transition-all duration-200`}
                  onDragOver={(e) => handleDragOver(e, quadrant.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, quadrant.id as any)}
                >
                  <div className={`${quadrant.headerColor} text-white p-4 rounded-t-xl`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{quadrant.emoji}</span>
                        <h2 className="font-semibold">{quadrant.title}</h2>
                      </div>
                      <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                        {getTasksByQuadrant(quadrant.id).length}
                      </span>
                    </div>
                    <div className="text-xs text-white text-opacity-80">
                      Due: {getQuadrantDeadline(quadrant.id)}
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3 min-h-[300px]">
                    {getTasksByQuadrant(quadrant.id).map((task) => (
                      <div key={task.id} className="relative group">
                        <TaskCard
                          task={task}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onClick={setSelectedTask}
                          onComplete={handleCompleteTask}
                          onDelete={handleDeleteTask}
                        />
                        {quadrant.id === 'immediate' && (
                          <button
                            onClick={() => setAsNowTask(task)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-purple-500 text-white px-3 py-1 rounded-full text-xs hover:bg-purple-600 transition-all duration-200 font-medium shadow-lg"
                          >
                            Focus Now
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {getTasksByQuadrant(quadrant.id).length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <quadrant.icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No tasks yet</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={handleAddTask}
      />
      
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      {/* Drag overlay */}
      {dragState.isDragging && (
        <div className="fixed inset-0 pointer-events-none z-40 bg-blue-50 bg-opacity-20" />
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;