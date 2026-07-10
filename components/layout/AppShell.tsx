"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import AIAdvisorPopup from "@/components/ai/AIAdvisorPopup";

type Props = {
  children: ReactNode;
};

export default function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#F7F5EF]">
      <div className="flex">
        <Sidebar />

        <main className="flex-1">
          <div className="p-8">
            <Header />

            <div className="mt-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Floating AI Assistant */}
      <AIAdvisorPopup />
    </div>
  );
}