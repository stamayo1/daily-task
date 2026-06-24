import { Category } from '../../models/category.model';


export abstract class CategoryRepository {
  abstract findAll(): Promise<Category[]>;
  abstract create(name: string): Promise<Category>;
  abstract update(id: number, name: string): Promise<void>;
  abstract delete(id: number): Promise<void>;
}
