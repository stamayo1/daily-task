import { Task, TaskStatus } from '../models/task.model';

export interface ToggleStatusResult {
  status: TaskStatus;
  completed_at: string | null;
}

/**
 * Regla de negocio pura: alterna el estado de una tarea entre 'pending' y 'done'.
 *
 * - Si pasa a 'done', registra `completed_at` con la fecha provista (default: ahora).
 * - Si pasa a 'pending', limpia `completed_at` a null.
 *
 * @param task Tarea cuyo estado se quiere alternar.
 * @param now  Timestamp de referencia (default: new Date()).
 */
export function toggleTaskStatus(task: Task, now: Date = new Date()): ToggleStatusResult {
  const newStatus: TaskStatus = task.status === 'pending' ? 'done' : 'pending';
  return {
    status: newStatus,
    completed_at: newStatus === 'done' ? now.toISOString() : null,
  };
}
