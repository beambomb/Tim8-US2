import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, renderHook, act, waitFor } from "@testing-library/react";
import { SocketProvider, useSocket } from "@/context/SocketContext";
import { useChat } from "@/features/chat/hooks/useChat";
import { useNotifications } from "@/features/chat/hooks/useNotifications";
import NavbarNotifications from "@/components/layout/NavbarNotifications";
import { useAuth } from "@/context/AuthContext";
import { chatService } from "@/features/chat/services/chatService";
import { getSocket } from "@/lib/socket";

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/socket", () => ({
  getSocket: vi.fn(),
}));

function createMockSocket() {
  const listeners = new Map();
  return {
    connected: false,
    on: vi.fn((event, handler) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(handler);
    }),
    off: vi.fn((event, handler) => {
      listeners.get(event)?.delete(handler);
    }),
    emit: vi.fn((event, payload, ack) => {
      if (event === "sendMessage" && typeof ack === "function") {
        ack({
          success: true,
          data: {
            _id: "msg-ws-1",
            senderId: { _id: payload.senderId, nama: "Pencari" },
            receiverId: payload.receiverId,
            pesan: payload.pesan,
          },
        });
      }
    }),
    connect: vi.fn(function connectMock() {
      this.connected = true;
      listeners.get("connect")?.forEach((fn) => fn());
    }),
    disconnect: vi.fn(function disconnectMock() {
      this.connected = false;
    }),
    trigger(event, payload) {
      listeners.get(event)?.forEach((fn) => fn(payload));
    },
  };
}

describe("SocketContext, chat, and notification flows", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: { _id: "user-1", nama: "Budi", role: "PENCARI_KOS" },
      isAuthenticated: true,
      loading: false,
    });
  });

  it("SocketProvider connects, joins user room, tracks incoming notifications, and resets count", async () => {
    const mockSocket = createMockSocket();
    getSocket.mockReturnValue(mockSocket);

    const { result } = renderHook(() => useSocket(), { wrapper: SocketProvider });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
    expect(mockSocket.emit).toHaveBeenCalledWith("joinRoom", "user-1");

    act(() => {
      mockSocket.trigger("notification", {
        _id: "n-live-1",
        judul: "Booking Disetujui",
        pesan: "Kamar siap ditempati",
      });
    });

    expect(result.current.unreadNotifications).toBe(1);
    expect(result.current.latestNotification?.judul).toBe("Booking Disetujui");

    act(() => {
      result.current.clearLatestNotification();
      result.current.resetUnreadNotifications();
    });

    expect(result.current.latestNotification).toBeNull();
    expect(result.current.unreadNotifications).toBe(0);
  });

  it("useChat fetches messages and sends via WebSocket when connected or REST fallback when disconnected", async () => {
    const mockSocket = createMockSocket();
    getSocket.mockReturnValue(mockSocket);

    const msgSpy = vi
      .spyOn(chatService, "getMessages")
      .mockResolvedValue({ data: [{ _id: "m-1", pesan: "Halo awal" }] });
    const ctxSpy = vi
      .spyOn(chatService, "getKosContext")
      .mockResolvedValue({ data: { _id: "kos-1", nama: "Kos Harmoni" } });
    const restSendSpy = vi
      .spyOn(chatService, "sendMessage")
      .mockResolvedValue({ data: { _id: "m-rest-1", pesan: "Fallback REST" } });

    const { result } = renderHook(() => useChat("owner-1", "kos-1"), {
      wrapper: SocketProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(msgSpy).toHaveBeenCalledWith("owner-1");
    expect(ctxSpy).toHaveBeenCalledWith("kos-1");
    expect(result.current.messages).toHaveLength(1);

    let wsRes;
    await act(async () => {
      wsRes = await result.current.sendMessage("Tanya kamar kosong");
    });
    expect(wsRes.success).toBe(true);
    expect(result.current.messages.some((m) => m.pesan === "Tanya kamar kosong")).toBe(true);

    // Simulate disconnected socket fallback to REST API
    mockSocket.connected = false;
    act(() => {
      mockSocket.trigger("disconnect");
    });
    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });

    let restRes;
    await act(async () => {
      restRes = await result.current.sendMessage("Fallback REST");
    });
    expect(restRes.success).toBe(true);
    expect(restSendSpy).toHaveBeenCalledWith("owner-1", "Fallback REST", "kos-1");
  });

  it("NavbarNotifications renders unread badge, toast alert, dropdown list, and Escape dismissal", async () => {
    const mockSocket = createMockSocket();
    getSocket.mockReturnValue(mockSocket);

    vi.spyOn(chatService, "getNotifications").mockResolvedValue({
      data: [
        { _id: "n-1", judul: "Booking Baru", pesan: "Menunggu konfirmasi", isRead: false },
      ],
    });
    const markReadSpy = vi
      .spyOn(chatService, "markNotificationRead")
      .mockResolvedValue({ success: true });
    const markAllSpy = vi
      .spyOn(chatService, "markAllNotificationsRead")
      .mockResolvedValue({ success: true });

    render(
      <SocketProvider>
        <NavbarNotifications />
      </SocketProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    act(() => {
      mockSocket.trigger("notification", {
        _id: "n-2",
        judul: "Pesan Baru",
        pesan: "Ada balasan owner",
      });
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Pesan Baru");
    fireEvent.click(screen.getByRole("button", { name: "Tutup notifikasi" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    const bellBtn = screen.getByRole("button", { name: "Notifikasi" });
    fireEvent.click(bellBtn);
    expect(bellBtn).toHaveAttribute("aria-expanded", "true");

    const markAllBtn = await screen.findByRole("button", { name: /Tandai semua dibaca/i });
    fireEvent.click(markAllBtn);
    await waitFor(() => {
      expect(markAllSpy).toHaveBeenCalledTimes(1);
    });

    fireEvent.keyDown(document, { key: "Escape" });
    expect(bellBtn).toHaveAttribute("aria-expanded", "false");
    expect(markReadSpy).not.toHaveBeenCalled();

    // Ensure hook export itself handles markAsRead cleanly
    const { result } = renderHook(() => useNotifications(), { wrapper: SocketProvider });
    await waitFor(() => expect(result.current.notifications.length).toBeGreaterThan(0));
    await act(async () => {
      await result.current.markAsRead("n-1");
    });
    expect(markReadSpy).toHaveBeenCalledWith("n-1");
  });
});
