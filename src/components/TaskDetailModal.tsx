import React from 'react';
import { X, ExternalLink, Calendar, Clock } from 'lucide-react';
import { Task } from '../types';
import { formatDate } from '../utils';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose
}) => {
  if (!isOpen || !task) return null;

  const quadrantLabels = {
    immediate: '🔥 Immediate Now',
    today: '📅 Today',
    week: '📋 This Week',
    month: '🗓️ This Month'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {task.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{quadrantLabels[task.quadrant]}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Created {formatDate(task.createdAt)}</span>
                </div>
              </div>
            </div>

            {task.imageUrl && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Image</h4>
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={task.imageUrl}
                    alt="Task"
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {task.description && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Description</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </div>
            )}

            {task.links.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">
                  Links ({task.links.length})
                </h4>
                <div className="space-y-2">
                  {task.links.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-700 truncate group-hover:text-blue-800">
                        {link}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {task.completed && task.completedAt && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Completion</h4>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-green-800">
                    ✅ Completed on {formatDate(task.completedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;