'use client'
import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface PROPS{
  aiOutput:string;
}

function OutputSection({aiOutput}:PROPS) {
  const [content, setContent] = useState<string>("Generated Content will Appear here");

  useEffect(() => {
    if (aiOutput) {
      setContent(aiOutput);
    }
  }, [aiOutput]);

  return (
    <div className='bg-white shadow-lg border'>
      <div className='flex justify-between items-center p-5'>
        <h2 className='font-medium text-lg '>Generated Content</h2>
        <Button className='flex gap-2'
        onClick={()=>navigator.clipboard.writeText(content)}><Copy className='w-4 h-4'/> Copy</Button>

      </div>
      <MDEditor
        value={content}
        onChange={(value) => setContent(value || '')}
        height="600px"
        data-color-mode="light"
      />
    </div>
  )
}

export default OutputSection
