
export abstract class AnalyticsPort {
  abstract track(event: string, params?: Record<string, unknown>): Promise<void>;
}
