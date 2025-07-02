import React, { useState } from 'react';
import { Task } from '../types';
import { Clock, Link, Image, Check, MoreVertical } from 'lucide-react';
import { formatDate } from '../utils';

interface TaskCardProps {
  task: Task;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  onClick: (task: Task) => void;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onDragStart,
  onDragEnd,
  onClick,
  onComplete,
  onDelete
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(task);
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete(task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
    setShowActions(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onClick(task)}
      className="group relative bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {task.title}
          </h3>
          <p className="text-sm text-gray-500 truncate mt-1">
            {task.description || 'No description'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 ml-3">
          {task.links.length > 0 && (
            <Link className="w-4 h-4 text-blue-500" />
          )}
          {task.imageUrl && (
            <Image className="w-4 h-4 text-green-500" />
          )}
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                <button
                  onClick={handleComplete}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Complete</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center text-xs text-gray-400">
          <Clock className="w-3 h-3 mr-1" />
          {formatDate(task.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;