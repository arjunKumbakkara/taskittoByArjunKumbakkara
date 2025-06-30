import React, { useState, useEffect } from 'react';
import { Plus, History, Target, Calendar, Clock, Archive } from 'lucide-react';
import { Task, DragState } from './types';
import TaskCard from './components/TaskCard';
import AddTaskModal from './components/AddTaskModal';
import TaskDetailModal from './components/TaskDetailModal';
import HistoryView from './components/HistoryView';
import NowSection from './components/NowSection';
import PomodoroTimer from './components/PomodoroTimer';
import { getQuadrantDeadline, formatDeadlineDate } from './utils';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'history'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentFocusTask, setCurrentFocusTask] = useState<Task | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTask: null,
    dragOverQuadrant: null
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskManager_tasks');
    const savedCompletedTasks = localStorage.getItem('taskManager_completedTasks');
    const savedCurrentTask = localStorage.getItem('taskManager_currentTask');
    
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined
      }));
      setTasks(parsedTasks);
    }
    
    if (savedCompletedTasks) {
      const parsedCompletedTasks = JSON.parse(savedCompletedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined
      }));
      setCompletedTasks(parsedCompletedTasks);
    }

    if (savedCurrentTask) {
      const parsedCurrentTask = JSON.parse(savedCurrentTask);
      setCurrentFocusTask({
        ...parsedCurrentTask,
        createdAt: new Date(parsedCurrentTask.createdAt),
        completedAt: parsedCurrentTask.completedAt ? new Date(parsedCurrentTask.completedAt) : undefined
      });
    }
  }, []);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('taskManager_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskManager_completedTasks', JSON.stringify(completedTasks));
  }, [completedTasks]);

  useEffect(() => {
    if (currentFocusTask) {
      localStorage.setItem('taskManager_currentTask', JSON.stringify(currentFocusTask));
    } else {
      localStorage.removeItem('taskManager_currentTask');
    }
  }, [currentFocusTask]);

  // Auto-select first immediate task if no current focus task
  useEffect(() => {
    if (!currentFocusTask) {
      const immediateTasks = tasks.filter(task => task.quadrant === 'immediate');
      if (immediateTasks.length > 0) {
        setCurrentFocusTask(immediateTasks[0]);
      }
    }
  }, [tasks, currentFocusTask]);

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const completeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId) || currentFocusTask;
    if (!task) return;

    const completedTask = {
      ...task,
      completed: true,
      completedAt: new Date()
    };

    setCompletedTasks(prev => [completedTask, ...prev]);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    // If completing the current focus task, clear it
    if (currentFocusTask && currentFocusTask.id === taskId) {
      setCurrentFocusTask(null);
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    // If deleting the current focus task, clear it
    if (currentFocusTask && currentFocusTask.id === taskId) {
      setCurrentFocusTask(null);
    }
  };

  const clearHistory = () => {
    setCompletedTasks([]);
  };

  const handleTaskSelect = (task: Task) => {
    if (task.quadrant === 'immediate') {
      setCurrentFocusTask(task);
    } else {
      setSelectedTask(task);
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

  const handleDrop = (e: React.DragEvent, quadrant: 'immediate' | 'today' | 'week' | 'month') => {
    e.preventDefault();
    
    if (dragState.draggedTask && dragState.draggedTask.quadrant !== quadrant) {
      setTasks(prev => prev.map(task => 
        task.id === dragState.draggedTask!.id 
          ? { ...task, quadrant }
          : task
      ));

      // If moving current focus task out of immediate, clear it
      if (currentFocusTask && currentFocusTask.id === dragState.draggedTask.id && quadrant !== 'immediate') {
        setCurrentFocusTask(null);
      }
    }
    
    handleDragEnd();
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

  const immediateTasksCount = getTasksByQuadrant('immediate').length;

  if (currentView === 'history') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Banner */}
        <div className="w-full">
          <img
            src="/TASKITTO.jpg"
            alt="TASKITTO by Arjun Kumbakkara"
            className="w-full h-32 object-cover"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Target className="w-5 h-5" />
              <span>Back to Dashboard</span>
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
      {/* Banner */}
      <div className="w-full">
        <img
          src="/TASKITTO.jpg"
          alt="TASKITTO by Arjun Kumbakkara"
          className="w-full h-32 object-cover"
        />
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TASKITTO</h1>
                <p className="text-sm text-gray-600">by Arjun Kumbakkara</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentView('history')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <History className="w-5 h-5" />
                <span>History</span>
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
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* NOW Section and Pomodoro Timer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <NowSection
              currentTask={currentFocusTask}
              onTaskSelect={handleTaskSelect}
              onTaskComplete={completeTask}
              immediateTasksCount={immediateTasksCount}
            />
          </div>
          <div>
            <PomodoroTimer currentTask={currentFocusTask?.title || null} />
          </div>
        </div>

        {/* Quadrants */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quadrants.map((quadrant) => {
            const deadline = getQuadrantDeadline(quadrant.id);
            const quadrantTasks = getTasksByQuadrant(quadrant.id);
            
            return (
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
                      {quadrantTasks.length}
                    </span>
                  </div>
                  <div className="text-xs text-white text-opacity-90">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Due: {formatDeadlineDate(deadline)}
                  </div>
                </div>
                
                <div className="p-4 space-y-3 min-h-[300px]">
                  {quadrantTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onClick={handleTaskSelect}
                      onComplete={completeTask}
                      onDelete={deleteTask}
                      isCurrentFocus={currentFocusTask?.id === task.id}
                    />
                  ))}
                  
                  {quadrantTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <quadrant.icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tasks yet</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={addTask}
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
    </div>
  );
}

export default App;