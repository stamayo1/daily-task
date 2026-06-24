import { Task } from '../../models/task.model';
import { getLocalDateString, toLocalDateString } from '../../utils/date.utils';

export interface TaskMetrics {
  dailyGoalTotal: number;
  dailyGoalProgress: number;
  completedToday: number;
  completedDueToday: number;
  pendingToday: number;
  completedEarly: number;
  weeklyData: { completed: number; total: number }[];
  last7DaysLabels: string[];
}

/**
 * Calcula las métricas de productividad a partir de una lista de tareas. Función pura
 *
 * @param tasks Lista de tareas a analizar.
 * @param now   Fecha de referencia (default: hoy)
 */
export function computeTaskMetrics(tasks: Task[], now: Date = new Date()): TaskMetrics {
  const today = getLocalDateString(now);

  let completedToday = 0;
  let completedDueToday = 0;
  let pendingToday = 0;
  let completedEarly = 0;
  let dailyGoalTotal = 0;

  const weeklyData = Array.from({ length: 7 }, () => ({ completed: 0, total: 0 }));
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    return getLocalDateString(d);
  });

  for (const t of tasks) {
    const tDue = toLocalDateString(t.due_date || t.created_at);
    const tCompleted = toLocalDateString(t.completed_at);

    if (tDue === today) {
      dailyGoalTotal++;
      if (t.status === 'pending') {
        pendingToday++;
      } else if (t.status === 'done') {
        completedDueToday++;
      }
    }

    if (t.status === 'done') {
      if (tCompleted === today) {
        completedToday++;
      }
      if (t.due_date && t.completed_at) {
        if (toLocalDateString(t.completed_at) < toLocalDateString(t.due_date)) {
          completedEarly++;
        }
      }
    }

    const weekIndex = last7Days.indexOf(tDue);
    if (weekIndex !== -1) {
      weeklyData[weekIndex].total++;
      if (t.status === 'done') {
        weeklyData[weekIndex].completed++;
      }
    }
  }

  const dailyGoalProgress = dailyGoalTotal === 0
    ? 0
    : Math.round((completedDueToday / dailyGoalTotal) * 100);

  return {
    dailyGoalTotal,
    dailyGoalProgress,
    completedToday,
    completedDueToday,
    pendingToday,
    completedEarly,
    weeklyData,
    last7DaysLabels: last7Days.map(d => {
      const date = new Date(d + 'T12:00:00');
      return date.toLocaleDateString('es-ES', { weekday: 'short' }).substring(0, 3);
    }),
  };
}
