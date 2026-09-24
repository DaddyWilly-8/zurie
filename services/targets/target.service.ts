import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

/** Shape of Target\Resources\TargetResource on the backend. */
export type SalesTarget = {
  id: number;
  /** YYYY-MM */
  period: string;
  /** TZS. */
  targetAmount: number;
};

export type TargetAchievement = {
  period: string;
  targetAmount: number | null;
  currentAmount: number;
  achievementPercentage: number | null;
  remainingAmount: number | null;
};

export const targetService = {
  list() {
    return apiClient
      .get<{ data?: SalesTarget[] }>(API_ENDPOINTS.targets.adminList)
      .then((response) => response.data ?? []);
  },

  /** Creates or replaces the target for that month. */
  save(payload: { period: string; targetAmount: number }) {
    return apiClient.post<{ data: SalesTarget }>(
      API_ENDPOINTS.targets.adminList,
      payload,
    );
  },

  achievement(period?: string) {
    return apiClient
      .get<{ data: TargetAchievement }>(API_ENDPOINTS.targets.achievement, {
        query: period ? { period } : undefined,
      })
      .then((response) => response.data);
  },
};
