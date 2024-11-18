import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoAdd, IoTrash, IoCheckmarkCircle, IoWarning } from "react-icons/io5";
import { Header } from "../types";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LoadingButton } from "./LoadingButton";

interface ConnectionSectionProps {
  onConnect: (config: {
    url: string;
    subscriptionUrl: string;
    virtualHost?: string;
    headers: Header[];
  }) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  connectionStatus: {
    status: "disconnected" | "connecting" | "connected" | "error";
    error?: string;
  };
}

export const ConnectionSection: React.FC<ConnectionSectionProps> = ({
  onConnect,
  onDisconnect,
  isConnected,
  connectionStatus,
}) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState<string>("");
  const [subscriptionUrl, setSubscriptionUrl] = useState<string>("");
  const [virtualHost, setVirtualHost] = useState<string>("");
  const [headers, setHeaders] = useState<Header[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleConnect = () => {
    if (!url) {
      toast.error(t("connection.error.urlRequired"));
      return;
    }
    if (!subscriptionUrl) {
      toast.error(t("connection.error.subscriptionRequired"));
      return;
    }
    onConnect({ url, subscriptionUrl, virtualHost, headers });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      <div
        className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-800 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-white">
            {t("connection.title")}
          </h2>
          {connectionStatus.status === "connected" && (
            <IoCheckmarkCircle className="text-green-400 text-xl" />
          )}
          {connectionStatus.status === "error" && (
            <IoWarning className="text-yellow-400 text-xl" />
          )}
        </div>
        <div className="flex items-center space-x-2">
          {connectionStatus.status === "connected" && (
            <span className="text-sm text-green-400">
              {t("common.connected")}
            </span>
          )}
          {connectionStatus.status === "connecting" && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
          )}
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-white"
          >
            <path
              fill="currentColor"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            />
          </motion.svg>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("connection.requestUrl")}
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors dark:bg-gray-700 dark:text-white"
                    placeholder={t("connection.requestUrlPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("connection.subscriptionUrl")}
                  </label>
                  <input
                    type="text"
                    value={subscriptionUrl}
                    onChange={(e) => setSubscriptionUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors dark:bg-gray-700 dark:text-white"
                    placeholder={t("connection.subscriptionUrlPlaceholder")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("connection.virtualHost")}
                  <span className="ml-1 text-gray-500">
                    ({t("common.optional")})
                  </span>
                </label>
                <input
                  type="text"
                  value={virtualHost}
                  onChange={(e) => setVirtualHost(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors dark:bg-gray-700 dark:text-white"
                  placeholder={t("connection.virtualHostPlaceholder")}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("connection.headers")}
                  </label>
                  <LoadingButton onClick={addHeader} size="sm" icon={<IoAdd />}>
                    {t("connection.addHeader")}
                  </LoadingButton>
                </div>

                <div className="space-y-2">
                  <AnimatePresence>
                    {headers.map((header, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          placeholder={t("connection.headerKey")}
                          value={header.key}
                          onChange={(e) =>
                            updateHeader(index, "key", e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder={t("connection.headerValue")}
                          value={header.value}
                          onChange={(e) =>
                            updateHeader(index, "value", e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors dark:bg-gray-700 dark:text-white"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeHeader(index)}
                          className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        >
                          <IoTrash />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {connectionStatus.status === "error" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md"
                >
                  {connectionStatus.error}
                </motion.div>
              )}

              <LoadingButton
                onClick={isConnected ? onDisconnect : handleConnect}
                isLoading={connectionStatus.status === "connecting"}
                loadingText={t("common.connecting")}
                variant={isConnected ? "danger" : "primary"}
                className="w-full"
              >
                {connectionStatus.status === "connected" &&
                  t("connection.disconnect")}
                {connectionStatus.status === "disconnected" &&
                  t("connection.connect")}
                {connectionStatus.status === "error" && t("connection.retry")}
              </LoadingButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
