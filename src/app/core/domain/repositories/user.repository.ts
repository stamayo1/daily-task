import { User } from '../../models/user.model';

export abstract class UserRepository {
  abstract findFirst(): Promise<User | null>;
  abstract completeOnboarding(): Promise<void>;
}
