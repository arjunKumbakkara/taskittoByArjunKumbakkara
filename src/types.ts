export interface Task {
  id: string;
  title: string;
  description: string;
  links: string[];
  imageUrl?: string;
  quadrant: 'immediate' | 'today' | 'week' | 'month';
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface DragState {
  isDragging: boolean;
  draggedTask: Task | null;
  dragOverQuadrant: string | null;
}