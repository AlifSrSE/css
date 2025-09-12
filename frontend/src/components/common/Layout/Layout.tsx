import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Navigation/Sidebar';
import { Header } from '../Navigation/Header';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};