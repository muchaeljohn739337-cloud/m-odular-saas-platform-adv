"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, XCircle, CheckCircle, X } from "lucide-react";

interface SystemStatus {
  overall: {
    status: "operational" | "degraded" | "down";
    alertLevel: "none" | "warning" | "danger";
    timestamp: string;
  };
  services: Array<{
    serviceName: string;
    status: string;
    statusMessage: string;
    alertLevel: string;
  }>;
}

export default function SystemFeedbackBanner() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check system status on mount and periodically
    const checkStatus = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/system/status");
        if (response.ok) {
          const data = await response.json();
          setSystemStatus(data);
          
          // Only show banner if there's an issue
          if (data.overall.alertLevel === "none" && data.overall.status === "operational") {
            setIsVisible(false);
          } else {
            setIsVisible(true);
            setIsDismissed(false); // Reset dismissed state when new issue appears
          }
        }
      } catch {
        // If can't connect to backend, show error banner
        setSystemStatus({
          overall: {
            status: "down",
            alertLevel: "danger",
            timestamp: new Date().toISOString(),
          },
          services: [
            {
              serviceName: "backend",
              status: "down",
              statusMessage: "Cannot connect to server",
              alertLevel: "danger",
            },
          ],
        });
        setIsVisible(true);
        setIsDismissed(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (!systemStatus || !isVisible || isDismissed) {
    return null;
  }

  const { overall } = systemStatus;
  const shouldShow = overall.alertLevel !== "none" || overall.status !== "operational";

  if (!shouldShow) {
    return null;
  }

  // Determine banner color and icon
  let bgColor = "bg-blue-500";
  let icon = <CheckCircle className="w-5 h-5" />;
  let message = "All systems operational";

  if (overall.alertLevel === "danger" || overall.status === "down") {
    bgColor = "bg-red-500";
    icon = <XCircle className="w-5 h-5" />;
    message = "System experiencing issues";
  } else if (overall.alertLevel === "warning" || overall.status === "degraded") {
    bgColor = "bg-yellow-500";
    icon = <AlertTriangle className="w-5 h-5" />;
    message = "System performance degraded";
  }

  // Get affected services
  const affectedServices = systemStatus.services.filter(
    (s) => s.alertLevel !== "none" || s.status !== "operational"
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`${bgColor} text-white shadow-lg fixed top-0 left-0 right-0 z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon}
              <div>
                <p className="font-semibold">{message}</p>
                {affectedServices.length > 0 && (
                  <p className="text-sm opacity-90 mt-1">
                    Affected services: {affectedServices.map((s) => s.serviceName).join(", ")}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
