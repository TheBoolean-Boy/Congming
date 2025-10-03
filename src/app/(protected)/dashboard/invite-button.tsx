"use client"
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import useProject from '@/hooks/use-project'
import React from 'react'
import { toast } from 'sonner'

const InviteButton = () => {
  const { projectId } = useProject()
  const [openState, setOpenState] = React.useState(false)
  const [inviteUrl, setInviteUrl] = React.useState("")

  React.useEffect(() => {
    if (typeof window !== "undefined" && projectId) {
      setInviteUrl(`${window.location.origin}/join/${projectId}`)
    }
  }, [projectId])

  const handleCopy = () => {
    if (!inviteUrl) return
    navigator.clipboard.writeText(inviteUrl)
    toast.success("Copied to clipboard")
  }

  return (
    <>
      <Dialog open={openState} onOpenChange={setOpenState}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-gray-500'>
            Share this link with your team
          </p>
          <Input
            className='mt-4'
            readOnly
            onClick={handleCopy}
            value={inviteUrl}
          />
        </DialogContent>
      </Dialog>
      <Button
        className='hover:scale-102 cursor-pointer'
        size="sm"
        onClick={() => setOpenState(true)}
      >
        Invite Members
      </Button>
    </>
  )
}

export default InviteButton
