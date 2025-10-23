'use server'
 
import { redirect } from 'next/navigation'

export default async function Home() {
  // Simply redirect to dashboard without revalidation
  redirect(`/dashboard/`)
  return (
    <div>
      <h2>
        hello
      </h2>
    </div>
  );
}
