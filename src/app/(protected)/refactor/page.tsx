"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Code, Search, CheckCircle, XCircle } from 'lucide-react'
import useProject from '@/hooks/use-project'
import { toast } from 'sonner'
import { refactorAgent } from './action'

const CodebaseScanCard = () => {

  const {project, projectId} =  useProject()
  const [isScanning, setIsScanning] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [status, setStatus] = React.useState('')

  const handleScan = async () => {
    setIsScanning(true)
    setProgress(0)
    setStatus('success')
    
    try {

      await refactorAgent(project?.githubUrl!, projectId)
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      setStatus('success')
      
      setTimeout(() => {
        setIsScanning(false)
        setProgress(0)
        setStatus('')
        toast.success("PR request from new branch sent, please check your repo")
      }, 500)
      
    } catch (error) {
      setStatus('error')
      setTimeout(() => {
        setIsScanning(false)
        setProgress(0)
        setStatus('')
        toast.success("Too much traffic please try later")
      }, 500)
    }
  }

  return (
    <Card className='col-span-2 flex flex-col items-center justify-center py-4'>
      {!isScanning && (
        <>
          <Code className="h-10 w-10 animate-bounce text-black" />
          <h3 className="mt-1 text-sm font-semibold text-gray-900">
            Refactor Codebase
          </h3>
          <p className="mt-0 text-center text-sm text-gray-500">
            Let Congming refactor potentially poorly written files in your codebase so that you don't have to spend hours refactoring them.
            <br />
            You will receive a new branch pull request message on your repo after Congming's refactor agent finishes it's job.
          </p>
          <div className="mt-3">
            <Button onClick={handleScan} disabled={isScanning}
            
            >
              <Search className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Refactor
            </Button>
          </div>
        </>
      )}

      {isScanning && (
        <div className='flex flex-col items-center'>
          <div className="relative size-20">
            <svg className="size-20 -rotate-90" viewBox="0 0 36 36">
              <path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke="#99999"
                strokeWidth="3"
              />
              <path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke="#0a0a0a"
                strokeWidth="3"
                strokeDasharray={`${progress}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-black">{progress}%</span>
            </div>
          </div>
          
          {progress === 100 && status === 'success' && (
            <div className="flex items-center mt-2 text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              <p className="text-sm">Refactored successfully!</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex items-center mt-2 text-red-600">
              <XCircle className="w-4 h-4 mr-1" />
              <p className="text-sm">Refactor failed. Please try again.</p>
            </div>
          )}
          
          {progress < 100 && (
            <p className='mt-2 text-sm text-gray-500 text-center'>
              Refactoring codebase...
            </p>
          )}
        </div>
      )}
    </Card>
  )
}

export default CodebaseScanCard