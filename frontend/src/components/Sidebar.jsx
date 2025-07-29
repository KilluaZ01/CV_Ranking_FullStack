import React from "react";
import { Icon } from "@iconify/react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="w-64 min-h-screen bg-[#f1faee] shadow-xl p-6 flex flex-col border-r-4 border-[#a8dadc]">
      <div className="flex items-center mb-8">
        <img
          src="https://i.pravatar.cc/42"
          alt="Avatar"
          className="w-12 h-12 rounded-full border-2 border-[#e63946] mr-3"
        />
        <span className="font-semibold text-[#1d3557] text-lg">Zidan Rai</span>
      </div>

      <nav className="flex-1 space-y-3 text-sm">
        <NavItem
          icon="mdi:folder"
          label="Evaluation"
          active={currentPath === "/"}
          onClick={() => navigate("/")}
        />
        <NavItem
          icon="mdi:file-document-outline"
          label="Documents"
          active={currentPath === "/documents"}
          onClick={() => navigate("/documents")}
        />
        <NavItem
          icon="mdi:star-outline"
          label="Important"
          active={currentPath === "/important"}
          onClick={() => navigate("/important")}
        />
        <NavItem
          icon="mdi:archive-outline"
          label="Archive"
          active={currentPath === "/archive"}
          onClick={() => navigate("/archive")}
        />
      </nav>

      <button
        onClick={() => navigate("/new-project")}
        className="mt-auto py-2 px-4 bg-[#e63946] hover:bg-[#c72f3f] text-white font-semibold rounded-xl shadow transition duration-200"
      >
        + New Project
      </button>

      <div className="mt-6 text-xs text-[#1d3557] space-y-2">
        <p className="hover:text-[#e63946] cursor-pointer transition">How it works</p>
        <p className="hover:text-[#e63946] cursor-pointer transition">Features</p>
        <p className="hover:text-[#e63946] cursor-pointer transition">FAQs</p>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition duration-150 ${
      active
        ? "bg-[#457b9d] text-white shadow-sm"
        : "text-[#1d3557] hover:bg-[#a8dadc] hover:text-[#1d3557]"
    }`}
  >
    <Icon icon={icon} className="mr-3 text-xl" />
    {label}
  </div>
);

export default Sidebar;
