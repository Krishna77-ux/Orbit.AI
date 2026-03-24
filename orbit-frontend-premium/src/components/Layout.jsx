import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { motion } from "framer-motion";

import {
  LayoutDashboard,
  FileText,
  Map,
  Briefcase,
  MessageCircle,
  DollarSign,
  LogOut,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";
import SoftBackground from "./SoftBackground";

export default function Layout() {
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard /> },
    { name: "Resume Analyzer", path: "/resume-analyzer", icon: <FileText /> },
    { name: "Roadmap", path: "/roadmap", icon: <Map /> },
    { name: "Job Match", path: "/jobs", icon: <Briefcase /> },
    { name: "AI Tutor", path: "/chat-tutor", icon: <MessageCircle /> },
    { name: "Subscription", path: "/subscription", icon: <DollarSign /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen relative text-white">
      <SoftBackground />

      <div className="fixed left-0 right-0 top-0 z-20 p-4 backdrop-blur-xl bg-slate-900/35 border-b border-white/10 shadow-glow">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div className="text-xl font-bold tracking-wide text-white">Orbit AI Suite</div>
          <div className="text-xs text-white/70">Next-gen career OS with playful holographic UI</div>
          <Link to="/pricing" className="btn-secondary inline-flex px-4 py-2 text-xs">Upgrade</Link>
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen pt-16">
        <aside className="w-72 shrink-0 p-6 frosted-glass flex flex-col justify-between border-l-2 border-white/10 backdrop-blur-2xl">
          <div>
            <Link to="/dashboard" className="inline-block">
              <h1 className="text-2xl font-black text-white mb-6 tracking-tighter">Orbit AI</h1>
            </Link>

            <nav className="flex flex-col gap-2">
              {menu.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500/30 via-sky-500/20 to-rose-500/20 text-white shadow-md"
                        : "text-white/70 hover:bg-white/10 hover:text-white"}
                    `
                  }
                >
                  <motion.span whileHover={{ scale: 1.15 }} className="text-indigo-300">{item.icon}</motion.span>
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="text-sm text-white/70 mb-2">Signed in as</p>
            <p className="text-sm font-medium text-white/90 truncate">{user?.email}</p>

            <button
              onClick={handleLogout}
              className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
