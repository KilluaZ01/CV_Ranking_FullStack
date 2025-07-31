import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { label: "Home", path: "/", icon: "mdi:home-outline" },
    { label: "Results", path: "/results", icon: "mdi:file-document-outline" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#f1faee] shadow-xl p-6 flex flex-col border-r-4 border-[#a8dadc]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1d3557]">CV Matcher</h1>
      </div>
      <nav className="flex flex-col space-y-4">
        {navItems.map(({ label, path, icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-[#1d3557] font-semibold hover:bg-[#a8dadc] transition ${
              currentPath === path ? "bg-[#a8dadc]" : ""
            }`}
          >
            <Icon icon={icon} className="text-xl" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
