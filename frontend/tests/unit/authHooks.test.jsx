import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth, homeForRole } from "@/context/AuthContext";
import { authService } from "@/features/auth/services/authService";
import { useAuthForm } from "@/features/auth/hooks/useAuthForm";

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

describe("AuthContext and useAuthForm unit tests", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
  });

  it("homeForRole maps each user role to its target landing route", () => {
    expect(homeForRole("ADMIN")).toBe("/admin/dashboard");
    expect(homeForRole("PEMILIK_KOS")).toBe("/owner/dashboard");
    expect(homeForRole("PENCARI_KOS")).toBe("/kos");
    expect(homeForRole(undefined)).toBe("/kos");
  });

  it("useAuth throws descriptive error when used outside AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
  });

  it("AuthProvider restores session from stored token, handles login, unauthorized event, and logout", async () => {
    localStorage.setItem("token", "saved-jwt");
    vi.spyOn(authService, "getMe").mockResolvedValue({
      user: { _id: "u1", nama: "Sari", role: "PENCARI_KOS" },
    });
    vi.spyOn(authService, "login").mockResolvedValue({
      token: "fresh-jwt",
      user: { _id: "u2", nama: "Budi", role: "PEMILIK_KOS" },
    });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user.id).toBe("u1");

    await act(async () => {
      window.dispatchEvent(new Event("carikos:unauthorized"));
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("token")).toBeNull();

    await act(async () => {
      await result.current.login("budi@mail.com", "secret123");
    });
    expect(localStorage.getItem("token")).toBe("fresh-jwt");
    expect(result.current.user.role).toBe("PEMILIK_KOS");

    act(() => {
      result.current.logout();
    });
    expect(localStorage.getItem("token")).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("useAuthForm validates register inputs and submits login/register workflows", async () => {
    vi.spyOn(authService, "getMe").mockResolvedValue(null);
    vi.spyOn(authService, "login").mockResolvedValue({
      token: "jwt-admin",
      user: { _id: "a1", nama: "Admin", role: "ADMIN" },
    });
    vi.spyOn(authService, "register").mockResolvedValue({ message: "OK" });

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

    const { result: regHook } = renderHook(() => useAuthForm("register"), { wrapper });
    await act(async () => {
      await regHook.current.handleSubmit({ preventDefault: () => {} });
    });
    expect(regHook.current.error).toMatch(/Nama lengkap wajib diisi/i);

    act(() => {
      regHook.current.handleChange({ target: { name: "nama", value: "Andi" } });
      regHook.current.handleChange({ target: { name: "email", value: "andi@mail.com" } });
      regHook.current.handleChange({ target: { name: "password", value: "123" } });
    });
    await act(async () => {
      await regHook.current.handleSubmit({ preventDefault: () => {} });
    });
    expect(regHook.current.error).toMatch(/Password minimal 6 karakter/i);

    act(() => {
      regHook.current.handleChange({ target: { name: "password", value: "secret123" } });
    });
    await act(async () => {
      await regHook.current.handleSubmit({ preventDefault: () => {} });
    });
    expect(mockPush).toHaveBeenCalledWith("/auth/login?registered=1");

    const { result: loginHook } = renderHook(() => useAuthForm("login"), { wrapper });
    act(() => {
      loginHook.current.handleChange({ target: { name: "email", value: "admin@carikos.id" } });
      loginHook.current.handleChange({ target: { name: "password", value: "secret123" } });
    });
    await act(async () => {
      await loginHook.current.handleSubmit({ preventDefault: () => {} });
    });
    expect(mockReplace).toHaveBeenCalledWith("/admin/dashboard");
  });
});
