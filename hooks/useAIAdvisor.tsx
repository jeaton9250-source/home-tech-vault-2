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
  pendingQuery: string | null;
  open: (query?: string) => void;
  openWithQuery: (query: string) => void;
  close: () => void;
  toggle: () => void;
  consumePendingQuery: () => string | null;
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
  const [pendingQuery, setPendingQuery] =
    useState<string | null>(null);

  const open = useCallback((query?: string) => {
    if (query?.trim()) {
      setPendingQuery(query.trim());
    }
    setIsOpen(true);
  }, []);

  const openWithQuery = useCallback(
    (query: string) => {
      open(query);
    },
    [open]
  );

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((current) => !current);
  }, []);

  const consumePendingQuery =
    useCallback(() => {
      const query = pendingQuery;
      setPendingQuery(null);
      return query;
    }, [pendingQuery]);

  return (
    <AIAdvisorContext.Provider
      value={{
        isOpen,
        pendingQuery,
        open,
        openWithQuery,
        close,
        toggle,
        consumePendingQuery,
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
