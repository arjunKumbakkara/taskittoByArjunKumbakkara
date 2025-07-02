import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Task } from '../types';
import { useAuth } from './useAuth';

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    if (!user) {
      setTasks([]);
      setCompletedTasks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const activeTasks: Task[] = [];
      const completed: Task[] = [];

      data?.forEach((task) => {
        const taskData: Task = {
          id: task.id,
          title: task.title,
          description: task.description,
          links: task.links || [],
          imageUrl: task.image_url || undefined,
          quadrant: task.quadrant,
          completed: task.completed,
          createdAt: new Date(task.created_at),
          completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
        };

        if (task.completed) {
          completed.push(taskData);
        } else {
          activeTasks.push(taskData);
        }
      });

      setTasks(activeTasks);
      setCompletedTasks(completed);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          links: task.links,
          image_url: task.imageUrl || null,
          quadrant: task.quadrant,
          completed: false,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        links: data.links || [],
        imageUrl: data.image_url || undefined,
        quadrant: data.quadrant,
        completed: data.completed,
        createdAt: new Date(data.created_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      };

      setTasks(prev => [newTask, ...prev]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const completeTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const completedTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        links: data.links || [],
        imageUrl: data.image_url || undefined,
        quadrant: data.quadrant,
        completed: data.completed,
        createdAt: new Date(data.created_at),
        completedAt: new Date(data.completed_at),
      };

      setTasks(prev => prev.filter(t => t.id !== taskId));
      setCompletedTasks(prev => [completedTask, ...prev]);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const updateTaskQuadrant = async (taskId: string, quadrant: Task['quadrant']) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ quadrant })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, quadrant } : task
      ));
    } catch (error) {
      console.error('Error updating task quadrant:', error);
    }
  };

  const clearHistory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id)
        .eq('completed', true);

      if (error) throw error;

      setCompletedTasks([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  return {
    tasks,
    completedTasks,
    loading,
    addTask,
    completeTask,
    deleteTask,
    updateTaskQuadrant,
    clearHistory,
    refetch: fetchTasks,
  };
};