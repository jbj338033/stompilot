import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Header } from "../types";

interface ConnectionState {
  url: string;
  subscriptionUrl: string;
  virtualHost: string;
  headers: Header[];
  isExpanded: boolean;
  setUrl: (url: string) => void;
  setSubscriptionUrl: (url: string) => void;
  setVirtualHost: (host: string) => void;
  setHeaders: (headers: Header[]) => void;
  setIsExpanded: (isExpanded: boolean) => void;
  addHeader: () => void;
  removeHeader: (index: number) => void;
  updateHeader: (index: number, field: "key" | "value", value: string) => void;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set) => ({
      url: "",
      subscriptionUrl: "",
      virtualHost: "",
      headers: [],
      isExpanded: true,
      setUrl: (url) => set({ url }),
      setSubscriptionUrl: (subscriptionUrl) => set({ subscriptionUrl }),
      setVirtualHost: (virtualHost) => set({ virtualHost }),
      setHeaders: (headers) => set({ headers }),
      setIsExpanded: (isExpanded) => set({ isExpanded }),
      addHeader: () =>
        set((state) => ({
          headers: [...state.headers, { key: "", value: "" }],
        })),
      removeHeader: (index) =>
        set((state) => ({
          headers: state.headers.filter((_, i) => i !== index),
        })),
      updateHeader: (index, field, value) =>
        set((state) => {
          const newHeaders = [...state.headers];
          newHeaders[index][field] = value;
          return { headers: newHeaders };
        }),
    }),
    {
      name: "connection-storage",
      partialize: (state) => ({
        url: state.url,
        subscriptionUrl: state.subscriptionUrl,
        virtualHost: state.virtualHost,
        headers: state.headers,
      }),
    }
  )
);
