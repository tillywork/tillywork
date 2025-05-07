import { useAuthStore } from '@/stores/auth';
import { io, Socket } from 'socket.io-client';
import { ref, onUnmounted } from 'vue';

const socket: Ref<Socket | null> = ref(null);

export function useSocket() {
  const { token } = storeToRefs(useAuthStore());
  const isConnected = ref(false);

  function connect() {
    if (socket.value) {
      return;
    }

    socket.value = io(import.meta.env.TW_VITE_WS_URL, {
      auth: { token: token.value },
    });

    socket.value.on('connect', () => {
      isConnected.value = true;
    });

    socket.value.on('disconnect', () => {
      isConnected.value = false;
    });
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
  }

  function joinRoom(room: string) {
    if (socket.value) {
      socket.value.emit('room:join', { room });
    }
  }

  onUnmounted(() => {
    disconnect();
  });

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    joinRoom,
  };
}
