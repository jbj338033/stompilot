import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Message } from "../../types";
import { IoTime, IoChevronDown, IoTrash, IoCopy } from "react-icons/io5";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../stores/settings";

interface MessagesSectionProps {
  messages: Message[];
  onClearMessages: () => void;
}

export const MessagesSection: React.FC<MessagesSectionProps> = ({
  messages,
  onClearMessages,
}) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [autoScroll, setAutoScroll] = React.useState(
    settings.autoScrollEnabled
  );
  const [filter, setFilter] = React.useState("");
  const [selectedMessage, setSelectedMessage] = React.useState<number | null>(
    null
  );

  const scrollToBottom = () => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;
    setAutoScroll(isAtBottom);
  };

  const copyMessage = (message: Message) => {
    navigator.clipboard.writeText(message.content);
    toast.success(t("messages.copySuccess"));
  };

  const handleClearMessages = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t("messages.clearConfirm"))) {
      onClearMessages();
      toast.success(t("messages.clearSuccess"));
    }
  };

  const filteredMessages = messages.filter((message) =>
    filter
      ? message.content.toLowerCase().includes(filter.toLowerCase()) ||
        message.destination.toLowerCase().includes(filter.toLowerCase())
      : true
  );

  const formatContent = (content: string) => {
    if (settings.formatJsonMessages) {
      try {
        const parsed = JSON.parse(content);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return content;
      }
    }
    return content;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      <div
        className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-white">
            {t("messages.title")}
          </h2>
          <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-sm">
            {messages.length}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearMessages}
              className="px-2 py-1 text-sm text-white hover:bg-blue-700 rounded transition-colors"
              aria-label={t("messages.clearAll")}
            >
              <IoTrash className="w-5 h-5" />
            </motion.button>
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
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={t("messages.filter")}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={autoScroll}
                      onChange={(e) => setAutoScroll(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                    />
                    <span>{t("messages.autoScroll")}</span>
                  </label>
                  {!autoScroll && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={scrollToBottom}
                      className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                      aria-label={t("messages.scrollToBottom")}
                    >
                      <IoChevronDown />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            <div
              className="h-96 overflow-y-auto p-4 space-y-2 dark:bg-gray-800"
              onScroll={handleScroll}
            >
              <AnimatePresence>
                {filteredMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`p-4 rounded-lg transition-colors ${
                      selectedMessage === index
                        ? "bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800"
                        : "bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setSelectedMessage(index)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {message.destination}
                        </span>
                        {settings.showTimestamps && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <IoTime className="mr-1" />
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          copyMessage(message);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        aria-label={t("common.copy")}
                      >
                        <IoCopy />
                      </motion.button>
                    </div>

                    <div className="relative">
                      <pre className="text-sm bg-white dark:bg-gray-800 rounded-md p-3 overflow-x-auto dark:text-gray-200">
                        {formatContent(message.content)}
                      </pre>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {filteredMessages.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                {filter
                  ? t("messages.noMatchingMessages")
                  : t("messages.noMessages")}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
