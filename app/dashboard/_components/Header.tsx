import React from 'react'
import { Search, Menu } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'

interface HeaderProps {
  onToggleSidebar: () => void;
}

function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <div className='relative p-5 shadow-sm border-2 flex justify-between items-center bg-white'>
      <button
        onClick={onToggleSidebar}
        className='md:hidden p-2 rounded-md hover:bg-gray-100'
        aria-label="Toggle sidebar"
      >
        <Menu className='h-6 w-6' />
      </button>
      {/* <div className='flex gap-2 items-center p-2 border rounded-md max-w-md'>
        <Search/>
        <input type="text" placeholder='Search....' className='outline-none' />
      </div> */}

    </div>
  )
}

export default Header
