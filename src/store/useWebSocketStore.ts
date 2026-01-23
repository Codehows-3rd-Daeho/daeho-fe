import { create } from "zustand";
import { Client, type IFrame, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "./useAuthStore";

type ConnectionCallback = (frame?: IFrame) => void;

interface WebSocketState {
  client: Client | null;
  isConnected: boolean;
  isConnecting: boolean;
  onConnectCallbacks: ConnectionCallback[];
  connect: (onConnectCallback: ConnectionCallback) => Promise<void>;
  disconnect: (onConnectCallback: ConnectionCallback) => void;
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
  onConnectCallbacks: [],

  connect: async (onConnectCallback) => {
    set((state) => ({
      onConnectCallbacks: [...state.onConnectCallbacks, onConnectCallback],
    }));

    const client = get().client;
    if (client && get().isConnected) {
      onConnectCallback();
      return;
    }

    if (get().isConnecting) {
      return;
    }

    set({ isConnecting: true });

    const token = useAuthStore.getState().token;

    const newClient = new Client({
      webSocketFactory: () => new SockJS(`/ws`),
      debug: (str) => console.log(new Date(), str),
      reconnectDelay: 5000,
      connectHeaders: token ? { Authorization: token } : {},
      onConnect: (frame) => {
        set({ isConnected: true, isConnecting: false, client: newClient });
        get().onConnectCallbacks.forEach((cb) => cb(frame));
      },
      onStompError: (frame) => {
        console.error("Broker reported error:", frame.headers["message"]);
        console.error("Additional details:", frame.body);
        set({ isConnected: false, isConnecting: false });
      },
    });

    newClient.activate();
    set({ client: newClient });
  },

  disconnect: (onConnectCallback) => {
    set((state) => ({
      onConnectCallbacks: state.onConnectCallbacks.filter(
        (cb) => cb !== onConnectCallback
      ),
    }));
    get().client?.deactivate();
    set({ isConnected: false, client: null, onConnectCallbacks: [] });
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
        body: JSON.stringify(body),
        headers: headers,
      });
    } else {
      console.error("Cannot publish: WebSocket is not connected.");
    }
  },
}));

export default useWebSocketStore;
