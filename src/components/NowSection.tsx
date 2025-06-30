import React from 'react';
import { Task } from '../types';
import { Target, Clock, ExternalLink, Image } from 'lucide-react';

interface NowSectionProps {
  currentTask: Task | null;
  onTaskSelect: (task: Task) => void;
  onTaskComplete: (taskId: string) => void;
  immediateTasksCount: number;
}

const NowSection: React.FC<NowSectionProps> = ({
  currentTask,
  onTaskSelect,
  onTaskComplete,
  immediateTasksCount
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">NOW</h2>
          <p className="text-sm text-gray-600">Current focus task</p>
        </div>
      </div>

      {currentTask ? (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                {currentTask.title}
              </h3>
              <div className="flex items-center space-x-2 ml-3">
                {currentTask.links.length > 0 && (
                  <ExternalLink className="w-4 h-4 text-blue-500" />
                )}
                {currentTask.imageUrl && (
                  <Image className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
            
            {currentTask.description && (
              <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                {currentTask.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                <span>Started {new Date(currentTask.createdAt).toLocaleTimeString()}</span>
              </div>
              
              <button
                onClick={() => onTaskComplete(currentTask.id)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                Complete
              </button>
            </div>
          </div>

          {immediateTasksCount > 1 && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                {immediateTasksCount - 1} more immediate task{immediateTasksCount - 1 !== 1 ? 's' : ''} waiting
              </p>
              <button
                onClick={() => onTaskSelect(currentTask)}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                View all immediate tasks
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">No current task</h3>
          <p className="text-sm text-gray-600 mb-4">
            {immediateTasksCount > 0 
              ? 'Select a task from Immediate Now to start focusing'
              : 'Add a task to Immediate Now to get started'
            }
          </p>
          {immediateTasksCount > 0 && (
            <button
              onClick={() => onTaskSelect(currentTask!)}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Select Task
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NowSection;