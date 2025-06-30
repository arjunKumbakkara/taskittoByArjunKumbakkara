import React, { useState } from 'react';
import { X, Link, Image, Plus } from 'lucide-react';
import { Task } from '../types';
import { generateId, extractLinks, validateImageUrl } from '../utils';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Task) => void;
  defaultQuadrant?: 'immediate' | 'today' | 'week' | 'month';
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  defaultQuadrant = 'today'
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quadrant, setQuadrant] = useState<'immediate' | 'today' | 'week' | 'month'>(defaultQuadrant);
  const [imageUrl, setImageUrl] = useState('');
  const [isValidatingImage, setIsValidatingImage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    let validatedImageUrl = '';
    if (imageUrl.trim()) {
      setIsValidatingImage(true);
      const isValid = await validateImageUrl(imageUrl.trim());
      if (isValid) {
        validatedImageUrl = imageUrl.trim();
      }
      setIsValidatingImage(false);
    }

    const links = extractLinks(description);

    const newTask: Task = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      links,
      imageUrl: validatedImageUrl || undefined,
      quadrant,
      completed: false,
      createdAt: new Date()
    };

    onAddTask(newTask);
    
    // Reset form
    setTitle('');
    setDescription('');
    setImageUrl('');
    setQuadrant('today');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                placeholder="Add description and links..."
              />
              <p className="text-xs text-gray-500 mt-1">
                <Link className="w-3 h-3 inline mr-1" />
                Links will be automatically detected
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                <Image className="w-3 h-3 inline mr-1" />
                Add an image to your task
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Quadrant
              </label>
              <select
                value={quadrant}
                onChange={(e) => setQuadrant(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="immediate">🔥 Immediate Now</option>
                <option value="today">📅 Today</option>
                <option value="week">📋 This Week</option>
                <option value="month">🗓️ This Month</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isValidatingImage}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{isValidatingImage ? 'Validating...' : 'Add Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;