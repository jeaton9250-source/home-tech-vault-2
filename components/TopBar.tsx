import { Search, Bell, UserCircle } from "lucide-react";

export default function TopBar() {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-3 outline-none"
          placeholder="Search your vault..."
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="bg-gray-100 p-3 rounded-xl">
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-2">
          <UserCircle size={28} className="text-blue-950" />
          <span className="font-semibold text-blue-950">Jason</span>
        </div>
      </div>
    </header>
  );
}