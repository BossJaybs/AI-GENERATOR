'use client'
import React, { useContext, useState, use } from 'react'
import FormSection from '../_component/FormSection'
import OutputSection from '../_component/OutputSection'
import { TEMPLATE } from '../../_components/TemplateListSection'
// import Templates from '@/app/(data)/Templates'
import { ArrowLeft} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { TotalUsageContext } from '@/app/(context)/TotalUsageContext'
import { generateAIContent } from '@/utils/actions'

interface PROPS{
  params: Promise<{
    'template-slug':string
  }>
}

function CreateNewContent(props:PROPS) {
  const params = use(props.params);
  // const selectedtemplate:TEMPLATE|undefined = Templates?.find((item)=>item.slug == params['template-slug'])
  const selectedtemplate = undefined as TEMPLATE | undefined
  const [loading, setLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string>('');
  const {user} = useUser();
  const { totalUsage, setTotalUsage } = useContext(TotalUsageContext);
 
  
  const GenerateAIContent = async (formData: any) => {
    if (totalUsage >= 20000) {
      alert('Free usage limit reached. Please upgrade to continue.');
      return;
    } else {
      setLoading(true);
      try {
        const selectedPrompt = selectedtemplate?.aiPrompt || '';
        const cleanedText = await generateAIContent(formData, selectedPrompt, selectedtemplate?.slug || '', user?.primaryEmailAddress?.emailAddress || '');
        console.log(cleanedText);
        setAiOutput(cleanedText);
      } catch (err: any) {
        console.error('AI generate error:', err);
        alert(err?.message || 'The AI service is temporarily unavailable. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className='p-10'>
      <Link href={"/dashboard"}>
        <Button ><ArrowLeft />Back</Button>
      </Link>
      <div className='grid grid-cols-1 md:grid-cols-3  gap-10 py-5'>
        <FormSection selectedTemplate={selectedtemplate} userFormInput={(v: any) => GenerateAIContent(v)} loading = {loading} />
        <div className='col-span-2'>
          <OutputSection aiOutput = {aiOutput} />
        </div>

      </div>
    </div>
    
  )
}

export default CreateNewContent
