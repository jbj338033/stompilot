import { create } from "zustand";
import { Client } from "@stomp/stompjs";
import { Message, Header } from "../types";
import { useSettings } from "./settings";
import { toast } from "react-hot-toast";

interface StompState {
  client: Client | null;
  messages: Message[];
  connectionStatus: {
    status: "disconnected" | "connecting" | "connected" | "error";
    error?: string;
  };
  recentDestinations: string[];
  isCancelled: boolean;
  connect: (config: {
    url: string;
    subscriptionUrl: string;
    virtualHost?: string;
    headers: Header[];
  }) => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (
    destination: string,
    content: string,
    contentType: "text" | "json"
  ) => Promise<void>;
  clearMessages: () => void;
  cancelConnection: () => void;
}

export const useStompStore = create<StompState>()((set, get) => {
  let reconnectTimeout: NodeJS.Timeout;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;
  const MAX_RECENT_DESTINATIONS = 5;

  const handleReconnect = async (config: {
    url: string;
    subscriptionUrl: string;
    virtualHost?: string;
    headers: Header[];
  }) => {
    const { settings } = useSettings();
    const { isCancelled } = get();

    // 취소되었거나 자동 재연결이 비활성화된 경우 재연결 시도하지 않음
    if (isCancelled || !settings.autoReconnect) return;

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);

      toast.loading(
        `Reconnecting in ${
          delay / 1000
        } seconds... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
      );

      clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(() => {
        const currentState = get();
        // 타임아웃 실행 시점에도 취소 상태 확인
        if (!currentState.isCancelled) {
          get().connect(config);
        }
      }, delay);
    } else {
      toast.error("Maximum reconnection attempts reached");
    }
  };

  return {
    client: null,
    messages: [],
    connectionStatus: { status: "disconnected" },
    recentDestinations: [],
    isCancelled: false,

    connect: async (config) => {
      const { client } = get();
      const { settings } = useSettings();

      // 연결 시도 시 취소 상태 초기화
      set({ isCancelled: false });

      try {
        if (client) {
          await client.deactivate();
        }

        set({ connectionStatus: { status: "connecting" } });

        const stompConfig: any = {
          brokerURL: config.url,
          connectHeaders: {
            ...config.headers
              .filter(
                (header) =>
                  header.key.trim() !== "" && header.value.trim() !== ""
              )
              .reduce(
                (acc, header) => ({
                  ...acc,
                  [header.key.trim()]: header.value.trim(),
                }),
                {}
              ),
            ...(config.virtualHost ? { host: config.virtualHost } : {}),
          },
          debug: (str: string) => {
            console.log("STOMP:", str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        };

        const newClient = new Client(stompConfig);

        newClient.onConnect = () => {
          set({ connectionStatus: { status: "connected" } });
          reconnectAttempts = 0;

          newClient.subscribe(config.subscriptionUrl, (message) => {
            const newMessage = {
              destination: message.headers.destination || "Unknown",
              content: message.body,
              timestamp: new Date(),
            };

            set((state) => ({
              messages: [
                ...state.messages.slice(-settings.maxMessages),
                newMessage,
              ],
            }));

            if (settings.notificationsEnabled && !document.hasFocus()) {
              new Notification("New STOMP Message", {
                body: `Received message on ${newMessage.destination}`,
              });
            }
          });

          toast.success("Connected successfully!");
        };

        newClient.onStompError = (frame) => {
          console.error("STOMP error:", frame);
          const errorMessage = frame.headers?.message || "Unknown STOMP error";
          set({ connectionStatus: { status: "error", error: errorMessage } });
          toast.error(`STOMP Error: ${errorMessage}`);
        };

        newClient.onWebSocketError = (event) => {
          console.error("WebSocket error:", event);
          const { isCancelled } = get();
          set({
            connectionStatus: {
              status: "error",
              error: "WebSocket connection failed",
            },
          });
          // 취소되지 않은 경우에만 재연결 시도
          if (!isCancelled) {
            handleReconnect(config);
          }
        };

        newClient.onDisconnect = () => {
          set({ connectionStatus: { status: "disconnected" } });
        };

        await newClient.activate();
        set({ client: newClient });
      } catch (error) {
        console.error("Connection error:", error);
        const { isCancelled } = get();
        set({
          connectionStatus: {
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
        // 취소되지 않은 경우에만 재연결 시도
        if (!isCancelled) {
          handleReconnect(config);
        }
      }
    },

    disconnect: async () => {
      const { client } = get();
      try {
        if (client) {
          await client.deactivate();
          set({
            client: null,
            connectionStatus: { status: "disconnected" },
            isCancelled: false,
          });
          toast.success("Disconnected successfully");
        }
      } catch (error) {
        console.error("Disconnect error:", error);
        toast.error("Failed to disconnect");
      }
    },

    sendMessage: async (destination, content, contentType) => {
      const { client, connectionStatus } = get();
      if (!client || connectionStatus.status !== "connected") {
        throw new Error("Not connected");
      }

      try {
        const headers = {
          "content-type":
            contentType === "json" ? "application/json" : "text/plain",
        };

        await client.publish({
          destination,
          headers,
          body: content,
        });

        // Update recent destinations
        set((state) => ({
          recentDestinations: [
            destination,
            ...state.recentDestinations.filter((d) => d !== destination),
          ].slice(0, MAX_RECENT_DESTINATIONS),
        }));
      } catch (error) {
        console.error("Send error:", error);
        throw error;
      }
    },

    clearMessages: () => {
      set({ messages: [] });
      toast.success("Messages cleared");
    },

    cancelConnection: () => {
      const { client } = get();
      // 진행 중인 재연결 시도 취소
      clearTimeout(reconnectTimeout);
      reconnectAttempts = 0;

      // 취소 상태로 설정
      set({ isCancelled: true });

      // 클라이언트가 존재하면 연결 종료
      if (client) {
        client.deactivate();
        set({
          client: null,
          connectionStatus: { status: "disconnected" },
        });
      }

      toast.success("Connection cancelled");
    },
  };
});
