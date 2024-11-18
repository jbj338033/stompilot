import React from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { IoHome, IoSettings } from "react-icons/io5";
import { motion } from "framer-motion";
import { useSettingsStore } from "../stores/settings";
import { LoadingOverlay } from "./LoadingOverlay";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const Layout: React.FC = () => {
  const location = useLocation();
  const theme = useSettingsStore((state) => state.settings.theme);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const NavLink: React.FC<{
    to: string;
    icon: React.ReactNode;
  }> = ({ to, icon }) => (
    <Link to={to}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`p-3 rounded-lg ${
          location.pathname === to
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        }`}
      >
        {icon}
      </motion.div>
    </Link>
  );

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark" : ""}`}>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Sidebar */}
        <div className="w-16 bg-white dark:bg-gray-800 shadow-lg">
          <div className="fixed h-full w-16 flex flex-col items-center py-4 space-y-4">
            <NavLink to="/" icon={<IoHome size={24} />} />
            <NavLink to="/settings" icon={<IoSettings size={24} />} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 relative">
          <LoadingOverlay isLoading={isLoading} text={t("common.loading")} />
          <Outlet context={{ setIsLoading }} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
