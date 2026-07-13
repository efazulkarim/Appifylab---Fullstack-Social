import { create } from "zustand";

export type ActiveModal = 
  | null 
  | { type: "liked-users"; targetType: "post" | "comment" | "reply"; targetId: string }
  | { type: "create-post" };

interface UiState {
  theme: "light" | "dark";
  mobileSidebarOpen: boolean;
  activeModal: ActiveModal;
  composerDraft: string;
  optimisticUploadPreview: string | null;
  
  // Actions
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setActiveModal: (modal: ActiveModal) => void;
  setComposerDraft: (draft: string) => void;
  setOptimisticUploadPreview: (preview: string | null) => void;
}

export const useUiStore = create<UiState>((set) => {
  // Initialize theme from localStorage or system preference
  const initialTheme = (() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  })();

  // Apply class to body/html
  if (initialTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  return {
    theme: initialTheme,
    mobileSidebarOpen: false,
    activeModal: null,
    composerDraft: "",
    optimisticUploadPreview: null,

    toggleTheme: () => set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { theme: newTheme };
    }),

    setTheme: (theme) => {
      localStorage.setItem("theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      set({ theme });
    },

    setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
    setActiveModal: (modal) => set({ activeModal: modal }),
    setComposerDraft: (draft) => set({ composerDraft: draft }),
    setOptimisticUploadPreview: (preview) => set({ optimisticUploadPreview: preview }),
  };
});
