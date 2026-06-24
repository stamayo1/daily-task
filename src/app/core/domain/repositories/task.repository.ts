import { Task, CreateTaskPayload, UpdateTaskPayload } from '../models/task.model';

export abstract class TaskRepository {
  abstract findAll(): Promise<Task[]>;
  abstract create(payload: CreateTaskPayload): Promise<Task>;
  abstract update(id: number, changes: UpdateTaskPayload): Promise<void>;
  abstract delete(id: number): Promise<void>;
}
