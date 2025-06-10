import React from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-black text-white flex flex-col"
    >
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">EXP App</h2>
        {user && <p className="text-sm text-gray-400">Welcome</p>}
      </div>
      <nav className="flex-1 p-4">
        <ul>
          <li>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `block p-2 rounded hover:bg-gray-900 ${isActive ? 'bg-gray-800' : ''}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/Grafana" 
              className={({ isActive }) => 
                `block p-2 rounded hover:bg-gray-900 ${isActive ? 'bg-gray-800' : ''}`
              }
            >
              Grafana
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar; 