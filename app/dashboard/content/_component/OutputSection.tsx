'use client'
import React from 'react'
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';


interface PROPS{
  aiOutput:string;
}

function OutputSection({aiOutput}:PROPS) {
  
  return (
    <div className='bg-white shadow-lg border'>
      <div className='flex justify-between items-center p-5'>
        <h2 className='font-medium text-lg '>Generated Content</h2>
        <Button className='flex gap-2'
        onClick={()=>navigator.clipboard.writeText(aiOutput)}><Copy className='w-4 h-4'/> Copy</Button>

      </div>
      <MDEditor
        value={aiOutput}
        preview="preview"
        height="600px"
      />
    </div>
  )
}

export default OutputSection
