import React from "react";
import { Icon } from "@iconify/react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <aside className="w-64 bg-white p-6 flex flex-col shadow-lg">
      <div className="flex items-center mb-8">
        <img
          src="https://i.pravatar.cc/42"
          alt="Avatar"
          className="w-12 h-12 rounded-full mr-3 border-2 border-pink-200"
        />
        <span className="font-semibold text-gray-800 text-lg">Zidan Rai</span>
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
        className="mt-auto py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white rounded-lg shadow-md transition duration-200"
      >
        + New Project
      </button>

      <div className="mt-6 text-xs text-gray-500 space-y-2">
        <p className="hover:text-pink-600 cursor-pointer">How it works</p>
        <p className="hover:text-pink-600 cursor-pointer">Features</p>
        <p className="hover:text-pink-600 cursor-pointer">FAQs</p>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center px-4 py-2 rounded-lg cursor-pointer text-sm transition duration-150 ${
      active
        ? "bg-pink-500 text-white font-semibold shadow-sm"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
    }`}
  >
    <Icon icon={icon} className="mr-3 text-xl" />
    {label}
  </div>
);

export default Sidebar;
