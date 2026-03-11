import { useState } from 'react';
import { Calendar, User, Flag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Task } from '../types';

// Visual config for priority badges
const PRIORITY_CONFIG = {
  low: { label: 'Low', className: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critical', className: 'bg-red-100 text-red-700' },
};

interface TaskCardProps {
  task: Task;
  projectId: string;
  onTaskClick: (task: Task) => void;
}

export default function TaskCard({ task, projectId, onTaskClick }: TaskCardProps) {
  
  const priority = PRIORITY_CONFIG[task.priority];

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate) < new Date();

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 bg-white"
      onClick={() => onTaskClick(task)} 
    >
      <CardContent className="p-3 space-y-2.5">
        {/* Task title */}
        <p className="text-sm font-medium leading-snug line-clamp-2">
          {task.title}
        </p>

        {/* Priority badge */}
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.className}`}
          >
            {priority.label}
          </span>
        </div>

        {/* Bottom row: due date + assignee */}
        <div className="flex items-center justify-between">
          {task.dueDate ? (
            <span
              className={`flex items-center gap-1 text-xs ${
                isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
              }`}
            >
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          ) : (
            <span />
          )}

          {task.assignedTo ? (
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignedTo.avatar?.url} />
              <AvatarFallback className="text-xs">
                {task.assignedTo.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <User className="h-4 w-4 text-muted-foreground/40" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}