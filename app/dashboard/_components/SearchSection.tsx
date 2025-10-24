import { Search } from 'lucide-react'
import React from 'react'
import Image from 'next/image'

function SearchSection({onSearchInput}:any) {
  

  return (
    <div className='p-10 bg-gradient-to-br from-purple-500 via-purple-700 to-blue-600 flex flex-col justify-center items-center text-white'>
      <div className='mb-3 flex items-center justify-center'>
        <div className='relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-36 lg:w-36 xl:h-40 xl:w-40'>
          <Image
            src='/group2-logo.png'
            alt='Group 2 Content Generator'
            fill
            sizes='(max-width: 640px) 96px, (max-width: 768px) 112px, (max-width: 1024px) 144px, (max-width: 1280px) 160px, 192px'
            priority
            className='object-contain'
          />
        </div>
      </div>
      <h2 className='text-3xl font-bold'>Browse all Templates</h2>
      <p>What Would you Like to create today ??</p>
      <div className='w-full flex justify-center items-center'>
        <div className='flex gap-2 items-center p-2 border rounded bg-white my-5 w-[50%]'>
            <Search className='text-primary '/>
            <input type="text" placeholder='Search...' 
            onChange={(event)=>onSearchInput(event.target.value)}
            className='bg-transparent-md w-full outline-none text-black'/>
        </div>
      </div>
    </div>
  )
}

export default SearchSection
SearchSection   