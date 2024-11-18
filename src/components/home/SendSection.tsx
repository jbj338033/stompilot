import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoSend, IoCode, IoWarning } from "react-icons/io5";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LoadingButton } from "../ui/LoadingButton";

interface SendSectionProps {
  onSend: (
    destination: string,
    content: string,
    contentType: "text" | "json"
  ) => void;
  isConnected: boolean;
  recentDestinations?: string[];
}

export const SendSection: React.FC<SendSectionProps> = ({
  onSend,
  isConnected,
  recentDestinations = [],
}) => {
  const { t } = useTranslation();
  const [destination, setDestination] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [contentType, setContentType] = useState<"text" | "json">("text");
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRecentDestinations, setShowRecentDestinations] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const validateJSON = (str: string): boolean => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const formatJSON = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(content), null, 2);
      setContent(formatted);
      toast.success(t("send.formatSuccess"));
    } catch {
      toast.error(t("send.error.invalidJson"));
    }
  };

  const handleSend = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (!destination) {
      toast.error(t("send.error.destinationRequired"));
      return;
    }

    if (!content) {
      toast.error(t("send.error.contentRequired"));
      return;
    }

    if (contentType === "json" && !validateJSON(content)) {
      toast.error(t("send.error.invalidJson"));
      return;
    }

    setIsSending(true);
    try {
      await onSend(destination, content, contentType);
      toast.success(t("send.sendSuccess"));
      if (!e?.shiftKey) {
        setContent("");
      }
    } catch (error) {
      toast.error(t("send.sendError"));
      console.error("Send error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSend(e);
    }
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const start = textareaRef.current!.selectionStart;
      const end = textareaRef.current!.selectionEnd;
      const newContent =
        content.substring(0, start) + "  " + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        textareaRef.current!.selectionStart =
          textareaRef.current!.selectionEnd = start + 2;
      }, 0);
    }
  };

  const sampleMessages = {
    text: t("send.sampleText"),
    json: JSON.stringify(
      {
        message: t("send.sampleJson.message"),
        timestamp: new Date().toISOString(),
      },
      null,
      2
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      <div
        className="p-4 bg-gradient-to-r from-green-600 to-green-800 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-white">{t("send.title")}</h2>
          {!isConnected && (
            <div className="flex items-center space-x-1 text-yellow-300">
              <IoWarning />
              <span className="text-sm">{t("send.notConnected")}</span>
            </div>
          )}
        </div>
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

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("send.destination")}
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onFocus={() => setShowRecentDestinations(true)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors dark:bg-gray-700 dark:text-white"
                  placeholder={t("send.destinationPlaceholder")}
                />
                {showRecentDestinations && recentDestinations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg"
                  >
                    {recentDestinations.map((dest, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm dark:text-gray-200"
                        onClick={() => {
                          setDestination(dest);
                          setShowRecentDestinations(false);
                        }}
                      >
                        {dest}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("send.contentType")}
                  </label>
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    {(["text", "json"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setContentType(type);
                          setContent(sampleMessages[type]);
                        }}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          contentType === type
                            ? "bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow"
                            : "text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                        }`}
                      >
                        {type.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                {contentType === "json" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={formatJSON}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                  >
                    <IoCode />
                    <span>{t("send.formatJson")}</span>
                  </motion.button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("send.content")}
                </label>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors font-mono dark:bg-gray-700 dark:text-white"
                    placeholder={t(`send.placeholders.${contentType}`)}
                  />
                  <div className="absolute right-2 bottom-2 text-xs text-gray-400 dark:text-gray-500">
                    {t("send.shortcuts.send")}
                  </div>
                </div>
              </div>

              <LoadingButton
                onClick={handleSend}
                isLoading={isSending}
                loadingText={t("common.sending")}
                disabled={!isConnected || isSending}
                variant="primary"
                icon={<IoSend />}
                className="w-full"
              >
                {t("common.send")}
              </LoadingButton>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t("send.shortcuts.title")}:
                <ul className="mt-1 space-y-1">
                  <li>• {t("send.shortcuts.send")}</li>
                  <li>• {t("send.shortcuts.tab")}</li>
                  <li>• {t("send.shortcuts.keep")}</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
