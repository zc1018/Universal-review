import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200/80">
      <div className="container mx-auto px-4 py-5 text-center">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          万能评价 Agent
        </h1>
        <p className="text-md text-slate-500 mt-1">由AI驱动的虚拟用户画像反馈</p>
      </div>
    </header>
  );
};