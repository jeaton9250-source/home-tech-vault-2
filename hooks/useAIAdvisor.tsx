"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type AIAdvisorContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const AIAdvisorContext =
  createContext<AIAdvisorContextValue | null>(
    null
  );

export function AIAdvisorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] =
    useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((current) => !current);
  }, []);

  return (
    <AIAdvisorContext.Provider
      value={{
        isOpen,
        open,
        close,
        toggle,
      }}
    >
      {children}
    </AIAdvisorContext.Provider>
  );
}

export function useAIAdvisor() {
  const context = useContext(
    AIAdvisorContext
  );

  if (!context) {
    throw new Error(
      "useAIAdvisor must be used within AIAdvisorProvider"
    );
  }

  return context;
}
