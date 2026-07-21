"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { usePathname } from "next/navigation";

type OpenMenuState = {
  menuId: string;
  instanceId: string;
};

type NavMenuContextValue = {
  isMenuOpen: (
    menuId: string,
    instanceId: string
  ) => boolean;
  toggleMenu: (
    menuId: string,
    instanceId: string
  ) => void;
  openMenu: (
    menuId: string,
    instanceId: string
  ) => void;
  closeMenu: () => void;
};

const NavMenuContext =
  createContext<NavMenuContextValue | null>(
    null
  );

export function NavMenuProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const [openMenu, setOpenMenu] =
    useState<OpenMenuState | null>(null);

  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  const isMenuOpen = useCallback(
    (menuId: string, instanceId: string) =>
      openMenu?.menuId === menuId &&
      openMenu?.instanceId === instanceId,
    [openMenu]
  );

  const toggleMenu = useCallback(
    (
      menuId: string,
      instanceId: string
    ) => {
      setOpenMenu((current) =>
        current?.menuId === menuId &&
        current?.instanceId === instanceId
          ? null
          : { menuId, instanceId }
      );
    },
    []
  );

  const openMenuFn = useCallback(
    (
      menuId: string,
      instanceId: string
    ) => {
      setOpenMenu({ menuId, instanceId });
    },
    []
  );

  const closeMenu = useCallback(() => {
    setOpenMenu(null);
  }, []);

  return (
    <NavMenuContext.Provider
      value={{
        isMenuOpen,
        toggleMenu,
        openMenu: openMenuFn,
        closeMenu,
      }}
    >
      {children}
    </NavMenuContext.Provider>
  );
}

export function useNavMenu() {
  const context = useContext(
    NavMenuContext
  );

  if (!context) {
    throw new Error(
      "useNavMenu must be used within NavMenuProvider"
    );
  }

  return context;
}
