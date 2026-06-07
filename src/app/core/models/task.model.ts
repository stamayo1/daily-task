/**
 * Prioridad de una tarea.
 * 1 = Alta, 2 = Media, 3 = Baja
 */
export type TaskPriority = 1 | 2 | 3;

/**
 * Estado de una tarea.
 */
export type TaskStatus = 'pending' | 'done';

/**
 * Modelo de dominio para una Tarea.
 */
export interface Task {
  id?: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  due_date?: string;       // ISO 8601: 'YYYY-MM-DD'
  status: TaskStatus;
  category_id?: number;
  created_at: string;      // ISO 8601 datetime
  completed_at?: string;
}

/**
 * Payload para crear una nueva tarea (sin campos generados por la DB).
 */
export type CreateTaskPayload = Omit<Task, 'id' | 'created_at' | 'completed_at'>;

/**
 * Payload para actualizar una tarea existente.
 */
export type UpdateTaskPayload = Partial<Omit<Task, 'id' | 'created_at'>>;

/**
 * Etiquetas en español para cada prioridad.
 */
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  1: 'Alta',
  2: 'Media',
  3: 'Baja',
};

/**
 * Colores Ionic para cada prioridad.
 */
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  1: 'danger',
  2: 'warning',
  3: 'success',
};
