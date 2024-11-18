import React from "react";
import { ConnectionSection } from "../components/home/ConnectionSection";
import { MessagesSection } from "../components/home/MessagesSection";
import { SendSection } from "../components/home/SendSection";
import { useStompStore } from "../stores/stomp";
import { Toaster } from "react-hot-toast";

const Home: React.FC = () => {
  const {
    connectionStatus,
    messages,
    recentDestinations,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
  } = useStompStore();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Toaster position="top-right" />

      <ConnectionSection
        isConnected={connectionStatus.status === "connected"}
        onConnect={connect}
        onDisconnect={disconnect}
        connectionStatus={connectionStatus}
      />

      <MessagesSection messages={messages} onClearMessages={clearMessages} />

      <SendSection
        onSend={sendMessage}
        isConnected={connectionStatus.status === "connected"}
        recentDestinations={recentDestinations}
      />
    </div>
  );
};

export default Home;
