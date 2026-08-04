import { API_MODE } from "@/services/api/config";

export const isMockMode = () => API_MODE === "mock";

type BackendFeature =
	| "orders"
	| "media"
	| "faq"
	| "enquiries"
	| "contact"
	| "newsletter"
	| "dashboard"
	| "settings"
	| "activity";

const NOT_BUILT_BACKEND_FEATURES = new Set<BackendFeature>([
	"orders",
	"media",
	"faq",
	"enquiries",
	"contact",
	"newsletter",
	"dashboard",
	"settings",
	"activity",
]);

export const shouldUseMockForFeature = (feature: BackendFeature) =>
	isMockMode() || NOT_BUILT_BACKEND_FEATURES.has(feature);
