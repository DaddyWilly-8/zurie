"use client";

import { useEffect } from "react";

const triggerSkipWaiting = (registration: ServiceWorkerRegistration) => {
  if (registration.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }
};

export const PwaRegister = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let reloaded = false;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        triggerSkipWaiting(registration);

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              triggerSkipWaiting(registration);
            }
          });
        });
      } catch {
        // SW registration should not block rendering.
      }
    };

    const onControllerChange = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };

    void register();
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  return null;
};
