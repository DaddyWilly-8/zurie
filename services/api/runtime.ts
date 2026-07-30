import { API_MODE } from "@/services/api/config";

export const isMockMode = () => API_MODE === "mock";
