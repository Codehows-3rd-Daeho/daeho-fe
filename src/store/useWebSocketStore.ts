import { create } from "zustand";
import { Client, type IFrame, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "./useAuthStore";

interface WebSocketState {
  client: Client | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionRefCount: number;
  connect: () => Promise<IFrame | undefined>;
  disconnect: () => void;
  subscribe: <T>(
    destination: string,
    callback: (message: T) => void
  ) => string;
  unsubscribe: (id: string) => void;
  publish: (destination: string, body: any, headers?: any) => void;
}

const useWebSocketStore = create<WebSocketState>((set, get) => ({
  client: null,
  isConnected: false,
  isConnecting: false,
  connectionRefCount: 0,

  connect: async () => {
    set((state) => ({
      connectionRefCount: state.connectionRefCount + 1,
    }));

    if (get().isConnected || get().isConnecting) {
      // Return the existing promise if available, or a resolved promise if already connected.
      return get().client
        ? Promise.resolve(undefined)
        : new Promise((resolve) => {
            const checkConnection = () => {
              if (get().isConnected) resolve(undefined);
              else setTimeout(checkConnection, 100);
            };
            checkConnection();
          });
    }

    set({ isConnecting: true });

    const token = useAuthStore.getState().token;

    const client = new Client({
      webSocketFactory: () => new SockJS(`/ws`),
      debug: (str) => console.log(new Date(), str),
      reconnectDelay: 5000,
      connectHeaders: token ? {
        Authorization: token
      } : {},
    });

    return new Promise<IFrame | undefined>((resolve, reject) => {
      client.onConnect = (frame) => {
        set({ isConnected: true, isConnecting: false, client });
        resolve(frame);
      };

      client.onStompError = (frame) => {
        console.error("Broker reported error:", frame.headers["message"]);
        console.error("Additional details:", frame.body);
        set({ isConnected: false, isConnecting: false });
        reject(frame);
      };

      client.activate();
    });
  },

  disconnect: () => {
    set((state) => ({
      connectionRefCount: Math.max(0, state.connectionRefCount - 1),
    }));

    if (get().connectionRefCount === 0 && get().client && get().isConnected) {
      get().client?.deactivate();
      set({ isConnected: false, client: null });
    }
  },

  subscribe: (destination, callback) => {
    const client = get().client;
    if (client && get().isConnected) {
      const subscription = client.subscribe(
        destination,
        (message: IMessage) => {
          try {
            const body = JSON.parse(message.body);
            callback(body);
          } catch (e) {
            console.error("Failed to parse WebSocket message body:", e);
          }
        }
      );
      return subscription.id;
    }
    return "";
  },

  unsubscribe: (id) => {
    const client = get().client;
    if (client && get().isConnected) {
      client.unsubscribe(id);
    }
  },

  publish: (destination, body, headers) => {
    const client = get().client;
    if (client && get().isConnected) {
      client.publish({
        destination,
        body: body,
        headers: headers,
      });
    } else {
      console.error("Cannot publish: WebSocket is not connected.");
    }
  },

}));

export default useWebSocketStore;
