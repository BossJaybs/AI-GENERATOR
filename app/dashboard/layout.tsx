'use client'
import React, { useState } from 'react'
import SideNav from './_components/SideNav';
import Header from './_components/Header';
import { TotalUsageContext } from '../(context)/TotalUsageContext';


function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [totalUsage, setTotalUsage] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  return (
    <TotalUsageContext.Provider value={{ totalUsage, setTotalUsage }}>
    <div className='bg-slate-100 h-full'>
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      {isSidebarOpen && <div className='fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden' onClick={() => setIsSidebarOpen(false)}></div>}
      <div className={`md:w-64 fixed z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <SideNav onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className='md:ml-64'>
        {children}
      </div>
    </div>
    </TotalUsageContext.Provider>

  )
}

export default layout

