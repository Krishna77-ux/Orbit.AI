import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const menu = [
  { name: "Dashboard",       path: "/dashboard",       icon: "dashboard" },
  { name: "Resume Analyzer", path: "/resume-analyzer", icon: "description" },
  { name: "Career Orbit",    path: "/career-orbit",    icon: "auto_awesome" },
  { name: "Roadmap",         path: "/roadmap",         icon: "map" },
  { name: "Job Match",       path: "/jobs",            icon: "work" },
  { name: "Career Tutor",    path: "/chat-tutor",      icon: "psychology" },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#050814] text-white flex font-body">
      {/* ── Sidebar ── */}
      <aside className="fixed left-0 top-0 h-full flex flex-col py-10 w-72 z-50 border-r border-white/5 bg-[#050814]">
        {/* Logo */}
        <div 
          onClick={() => window.location.href = "/dashboard"}
          className="px-10 mb-16 flex items-center gap-3 cursor-pointer group select-none active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-[#5ffbd6] flex items-center justify-center shadow-[0_0_20px_rgba(95,251,214,0.3)] group-hover:scale-110 transition-all">
            <span className="material-symbols-outlined text-[#050814] text-2xl font-bold">rocket_launch</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white font-headline group-hover:text-[#5ffbd6] transition-colors">Orbit.</h1>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-6 space-y-3">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                  isActive 
                    ? "bg-[#5ffbd6]/10 text-[#5ffbd6] border border-[#5ffbd6]/20 shadow-[0_0_20px_rgba(95,251,214,0.05)]" 
                    : "text-[#8a96c0] hover:text-white hover:bg-white/5"
                }`
              }
            >
              <span className="material-symbols-outlined text-xl transition-transform group-hover:scale-110">
                {item.icon}
              </span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer info + logout */}
        <div className="mt-auto px-10 pt-10 border-t border-white/5">
          <div className="flex items-center gap-4 mb-6">
             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-[#5ffbd6] border border-white/10">
                {(user?.name || "O")[0].toUpperCase()}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.name || "Operator"}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8a96c0] opacity-50">Orbit Pro</p>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-[#8a96c0] hover:text-white hover:bg-red-500/10 hover:border-red-500/20 text-xs font-black uppercase tracking-widest transition-all mb-4"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="ml-72 flex-1 min-h-screen relative bg-[#050814]">
        {/* Subtle Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
           <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#2e4a8a] rounded-full blur-[160px] opacity-10" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#7c3aed] rounded-full blur-[140px] opacity-5" />
        </div>

        {/* Dynamic Top Header */}
        <header className="sticky top-0 right-0 w-full flex justify-between items-center py-8 px-12 z-40 bg-[#050814]/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-3">
             <span className="text-[#8a96c0] font-bold text-sm">Orbit AI Suite</span>
             <span className="w-1.5 h-1.5 rounded-full bg-[#5ffbd6] animate-pulse" title="System Online" />
          </div>
          <div className="flex items-center gap-6">
             <button onClick={() => navigate("/pricing")} className="text-xs font-black uppercase tracking-widest text-[#5ffbd6] hover:underline transition-all">
                Upgrade Account
             </button>
             <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#8a96c0] hover:text-white transition-all border border-white/10">
                <span className="material-symbols-outlined text-xl">notifications</span>
             </button>
          </div>
        </header>

        {/* Page Content */}
        <div className={`relative z-10 ${location.pathname === '/career-orbit' ? 'w-full h-[calc(100vh-100px)]' : 'p-12 pb-24 max-w-7xl mx-auto'}`}>
          <Outlet />
        </div>
      </main>

      {/* Fixed Chat Trigger */}
      <div className="fixed bottom-12 right-12 z-[100]">
        <button
          onClick={() => navigate("/chat-tutor")}
          className="w-16 h-16 rounded-2xl bg-[#5ffbd6] text-[#050814] shadow-[0_20px_50px_rgba(95,251,214,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
          title="Open AI Tutor"
        >
          <span className="material-symbols-outlined text-3xl font-bold">psychology</span>
        </button>
      </div>
    </div>
  );
}
