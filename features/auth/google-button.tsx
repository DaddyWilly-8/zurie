import { Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { API_ORIGIN } from "@/services/api/config";
import { API_ENDPOINTS } from "@/services/api/endpoints";

/**
 * A plain <a>, not a client-side router Link or an apiClient call — this
 * has to be a real top-level browser navigation straight to the backend's
 * origin (not the /api/v1 same-origin proxy path other calls use) so the
 * whole Google -> backend callback -> frontend redirect chain stays a
 * normal browser navigation the whole way through. Customer-only — see
 * CustomerAuthController::redirectToGoogle() on the backend.
 */
export const GoogleButton = () => {
  return (
    <Button
      component="a"
      href={`${API_ORIGIN}/api/v1${API_ENDPOINTS.customerAuth.googleRedirect}`}
      variant="outlined"
      fullWidth
      startIcon={<FontAwesomeIcon icon={faGoogle} fontSize={16} />}
      sx={{ borderRadius: 999, borderColor: "divider", color: "text.primary" }}
    >
      Continue with Google
    </Button>
  );
};
