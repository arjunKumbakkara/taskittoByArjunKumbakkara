import React, { useState } from 'react';
import { Task } from '../types';
import { Clock, Calendar, Search, Archive } from 'lucide-react';
import { formatDate } from '../utils';

interface HistoryViewProps {
  completedTasks: Task[];
  onTaskClick: (task: Task) => void;
  onClearHistory: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  completedTasks,
  onTaskClick,
  onClearHistory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  const filteredTasks = completedTasks
    .filter(task =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.completedAt || b.createdAt).getTime() - 
               new Date(a.completedAt || a.createdAt).getTime();
      }
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Archive className="w-6 h-6 text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-900">Task History</h2>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {completedTasks.length}
          </span>
        </div>
        
        {completedTasks.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search completed tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {completedTasks.length === 0 ? 'No completed tasks yet' : 'No tasks match your search'}
          </h3>
          <p className="text-gray-500">
            {completedTasks.length === 0 
              ? 'Complete some tasks to see them here'
              : 'Try adjusting your search terms'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-green-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {task.title}
                    </h3>
                    <span className="text-green-600 text-sm">✅</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {task.description || 'No description'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-400 space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Created {formatDate(task.createdAt)}</span>
                  </div>
                  {task.completedAt && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Completed {formatDate(task.completedAt)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  {task.links.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      {task.links.length} link{task.links.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {task.imageUrl && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                      Image
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;