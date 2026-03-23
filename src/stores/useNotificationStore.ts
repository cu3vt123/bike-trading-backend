import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/types/auth";

export type AppNotification = {
  id: string;
  role: Role;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  link?: string;
  sourceKey?: string;
  /** If set, title is resolved at display time with t(titleKey, titleParams) for i18n */
  titleKey?: string;
  titleParams?: Record<string, string | number>;
  messageKey?: string;
  messageParams?: Record<string, string | number>;
};

type NotificationState = {
  items: AppNotification[];
  addNotification: (input: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllReadForRole: (role: Role) => void;
  /** Xóa chỉ những tin đã đọc (theo role) */
  clearReadForRole: (role: Role) => void;
  removeItem: (id: string) => void;
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      items: [],
      addNotification: (input) =>
        set((state) => {
          if (input.sourceKey && state.items.some((x) => x.sourceKey === input.sourceKey)) {
            return state;
          }
          const item: AppNotification = {
            ...input,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            read: false,
            createdAt: new Date().toISOString(),
          };
          return { items: [item, ...state.items].slice(0, 300) };
        }),
      markRead: (id) =>
        set((state) => ({
          items: state.items.map((x) => (x.id === id ? { ...x, read: true } : x)),
        })),
      markAllReadForRole: (role) =>
        set((state) => ({
          items: state.items.map((x) => (x.role === role ? { ...x, read: true } : x)),
        })),
      clearReadForRole: (role) =>
        set((state) => ({
          items: state.items.filter((x) => !(x.role === role && x.read)),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((x) => x.id !== id),
        })),
    }),
    { name: "app-notifications" },
  ),
);
