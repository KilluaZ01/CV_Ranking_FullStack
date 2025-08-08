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
    { label: "Archive", path: "/archive", icon: "mdi:archive-outline" },
    { label: "Documents", path: "/documents", icon: "mdi:file-multiple-outline" },
    { label: "Important", path: "/important", icon: "mdi:alert-circle-outline" },
  ];

  const bottomLinks = [
    { label: "How to Use", path: "/how-to-use", icon: "mdi:help-circle-outline" },
    { label: "About Us", path: "/about", icon: "mdi:account-group-outline" },
    { label: "What's New", path: "/whats-new", icon: "mdi:star-outline" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-[#f1faee] shadow-xl p-6 flex flex-col justify-between border-r-4 border-[#a8dadc]">
      {/* Top Content */}
      <div>
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-[#1d3557] tracking-wide select-none drop-shadow-sm">
            CV Matcher
          </h1>
        </div>

        <nav className="flex flex-col space-y-3" aria-label="Main navigation">
          {navItems.map(({ label, path, icon }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className={`
                flex items-center space-x-3 px-5 py-3 rounded-lg font-semibold
                text-[#1d3557] 
                hover:bg-[#a8dadc] hover:text-[#1d3557] 
                focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#a8dadc]
                transition 
                select-none
                ${currentPath === path ? "bg-[#a8dadc] shadow-inner" : "bg-transparent"}
              `}
              aria-current={currentPath === path ? "page" : undefined}
            >
              <Icon icon={icon} className="text-2xl" aria-hidden="true" />
              <span className="text-lg">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Links */}
      <div className="mt-10 border-t border-[#a8dadc] pt-4">
        <nav className="flex flex-col space-y-2" aria-label="Secondary navigation">
          {bottomLinks.map(({ label, path, icon }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className="flex items-center space-x-3 px-3 py-2 text-sm text-[#1d3557] rounded-md hover:bg-[#d9f7f1] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#a8dadc] transition"
            >
              <Icon icon={icon} className="text-xl" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
