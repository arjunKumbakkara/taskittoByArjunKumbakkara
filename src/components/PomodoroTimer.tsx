import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Target } from 'lucide-react';
import { PomodoroState } from '../types';

interface PomodoroTimerProps {
  currentTask: string | null;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ currentTask }) => {
  const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
    timeLeft: 25 * 60, // 25 minutes in seconds
    isRunning: false,
    isBreak: false,
    session: 1
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (pomodoroState.isRunning && pomodoroState.timeLeft > 0) {
      interval = setInterval(() => {
        setPomodoroState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (pomodoroState.timeLeft === 0) {
      // Timer finished
      setPomodoroState(prev => ({
        ...prev,
        isRunning: false,
        isBreak: !prev.isBreak,
        timeLeft: prev.isBreak ? 25 * 60 : 5 * 60, // 25 min work, 5 min break
        session: prev.isBreak ? prev.session + 1 : prev.session
      }));
      
      // Play notification sound (browser notification)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(pomodoroState.isBreak ? 'Break time!' : 'Work time!', {
          body: pomodoroState.isBreak ? 'Time for a 5-minute break' : 'Time to focus on your task',
          icon: '/vite.svg'
        });
      }
    }

    return () => clearInterval(interval);
  }, [pomodoroState.isRunning, pomodoroState.timeLeft, pomodoroState.isBreak]);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setPomodoroState(prev => ({
      ...prev,
      isRunning: !prev.isRunning
    }));
  };

  const resetTimer = () => {
    setPomodoroState({
      timeLeft: 25 * 60,
      isRunning: false,
      isBreak: false,
      session: 1
    });
  };

  const getProgressPercentage = (): number => {
    const totalTime = pomodoroState.isBreak ? 5 * 60 : 25 * 60;
    return ((totalTime - pomodoroState.timeLeft) / totalTime) * 100;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          {pomodoroState.isBreak ? (
            <Coffee className="w-6 h-6 text-green-600" />
          ) : (
            <Target className="w-6 h-6 text-red-600" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {pomodoroState.isBreak ? 'Break Time' : 'Focus Time'}
          </h3>
        </div>

        {/* Circular Progress */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - getProgressPercentage() / 100)}`}
              className={pomodoroState.isBreak ? 'text-green-500' : 'text-red-500'}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">
              {formatTime(pomodoroState.timeLeft)}
            </span>
          </div>
        </div>

        {/* Session Counter */}
        <div className="mb-4">
          <span className="text-sm text-gray-600">Session {pomodoroState.session}</span>
        </div>

        {/* Current Task */}
        {currentTask && !pomodoroState.isBreak && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Working on:</p>
            <p className="font-medium text-gray-900 truncate">{currentTask}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={toggleTimer}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
              pomodoroState.isRunning
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : pomodoroState.isBreak
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            {pomodoroState.isRunning ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          
          <button
            onClick={resetTimer}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Status */}
        <div className="mt-4 text-xs text-gray-500">
          {pomodoroState.isRunning ? (
            pomodoroState.isBreak ? 'Take a break!' : 'Stay focused!'
          ) : (
            'Click play to start'
          )}
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;