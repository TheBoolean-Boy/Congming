"use client"

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import useProject from '@/hooks/use-project'
import useRefetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react'
import React, { useState } from 'react'
import { toast } from 'sonner'

function ArchiveButton() {
  const [open, setOpen] = useState(false)
  const { projectId } = useProject()
  const archiveProject = api.project.archiveProject.useMutation()
  const refetch = useRefetch()

  const handleArchive = () => {
    archiveProject.mutate(
      { projectId },
      {
        onSuccess: () => {
          toast.success("Project deleted successfully")
          refetch()
          setOpen(false)
        },
        onError: () => {
          toast.error("Failed to delete project")
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className='cursor-pointer hover:scale-102'
          size='sm'
          variant='destructive'
        >
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this project? This action can be reversed later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => setOpen(false)}
            disabled={archiveProject.isPending}
          >
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleArchive}
            disabled={archiveProject.isPending}
          >
            {archiveProject.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ArchiveButton