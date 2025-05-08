import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth';

const socket: Ref<Socket | null> = ref(null);
const isConnected = ref(false);
const eventListeners: Map<string, Set<(...args: any[]) => void>> = new Map();

export function useSocket() {
  const authStore = useAuthStore();
  const { token } = storeToRefs(authStore);

  /**
   * Get the WebSocket URL from environment or fallback to window location
   */
  function getWebSocketUrl(): string {
    try {
      const apiUrl = import.meta.env.TW_VITE_API_URL;
      const url = new URL(apiUrl, window.location.origin);
      const basePath = url.pathname.replace(/\/[^/]+$/, '');
      const protocol = url.protocol;

      return `${protocol}//${url.host}${basePath}`;
    } catch {
      return `${window.location.origin}`;
    }
  }

  /**
   * Connect to the socket.io server
   */
  function connect(cb?: () => void) {
    // Skip if already connected
    if (socket.value && socket.value.connected) {
      console.log('Socket already connected');
      if (cb) cb();
      return;
    }

    // Check for authentication
    if (!token.value) {
      console.warn('Cannot connect socket - no authentication token available');
      return;
    }

    // Clean up existing socket if needed
    if (socket.value) {
      console.log('Cleaning up existing socket before reconnecting');
      socket.value.disconnect();
    }

    // Create the socket connection
    const wsUrl = new URL(getWebSocketUrl());
    socket.value = io(wsUrl.origin, {
      path:
        wsUrl.pathname && wsUrl.pathname !== '/'
          ? wsUrl.pathname + '/socket.io'
          : undefined,
      auth: { token: token.value },
      transports: ['polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    console.log('Connecting to socket.io server...');

    socket.value.on('connect', () => {
      console.log('Socket connected');
      isConnected.value = true;
      if (cb) cb();
    });

    socket.value.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      isConnected.value = false;
    });

    socket.value.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      isConnected.value = false;
    });

    socket.value.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      isConnected.value = true;

      reattachEventListeners();
    });

    socket.value.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after all attempts');
      isConnected.value = false;
    });
  }

  /**
   * Disconnect from the socket.io server
   */
  function disconnect() {
    if (socket.value) {
      console.log('Manually disconnecting socket');
      socket.value.disconnect();
      isConnected.value = false;
    }
  }

  /**
   * Join a room
   */
  function joinRoom(room: string) {
    if (socket.value && socket.value.connected) {
      console.log(`Joining room: ${room}`);
      socket.value.emit('room:join', { room });
      return true;
    } else {
      console.warn('Cannot join room - socket not connected');
      return false;
    }
  }

  /**
   * Add an event listener and track it for cleanup
   */
  function addEventListener(event: string, listener: (...args: any[]) => void) {
    if (!eventListeners.has(event)) {
      eventListeners.set(event, new Set());
    }
    eventListeners.get(event)?.add(listener);

    if (socket.value) {
      socket.value.on(event, listener);
    }

    onUnmounted(() => {
      removeEventListener(event, listener);
    });
  }

  /**
   * Remove an event listener
   */
  function removeEventListener(
    event: string,
    listener: (...args: any[]) => void
  ) {
    if (socket.value) {
      socket.value.off(event, listener);
    }

    eventListeners.get(event)?.delete(listener);
    if (eventListeners.get(event)?.size === 0) {
      eventListeners.delete(event);
    }
  }

  /**
   * Reattach all tracked event listeners after reconnection
   */
  function reattachEventListeners() {
    if (!socket.value) return;

    eventListeners.forEach((listeners, event) => {
      listeners.forEach((listener) => {
        socket.value?.on(event, listener);
      });
    });

    console.log('Reattached event listeners after reconnection');
  }

  /**
   * Emit an event to the server
   */
  function emit(event: string, data: any): boolean {
    if (socket.value && socket.value.connected) {
      socket.value.emit(event, data);
      return true;
    } else {
      console.warn(`Cannot emit event ${event} - socket not connected`);
      return false;
    }
  }

  onMounted(() => {
    if (authStore.isAuthenticated() && !isConnected.value) {
      connect();
    }
  });

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    joinRoom,
    addEventListener,
    removeEventListener,
    emit,
  };
}

/**
 * Initialize the socket service at the application level
 */
export function initializeSocketService() {
  const { connect } = useSocket();
  connect();
  console.log('Socket service initialized at application level');
}
