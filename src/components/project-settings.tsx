'use client'
import { useEffect, useState, useTransition } from 'react'
import { Loader2, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import {
  changeProjectDescription,
  renameProject,
} from '@/data/projects/project-settings'
import { Textarea } from './ui/textarea'
import { deleteProject } from '@/data/projects/delete-project'
import { toast } from 'sonner'

export default function ProjectSettings({
  projects,
  projectID,
  servers,
}: {
  projects: Project
  projectID: string
  servers?: Server[]
}) {
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    if (projects) {
      setNewName(projects.title ?? '')
      setNewDescription(projects.description ?? '')
    }
  }, [projects])

  if (!projects) {
    return <div className="p-4">Project not found</div>
  }

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        if (servers && servers.length > 0) {
          toast.error('Cannot delete project. Please delete all servers first.')
          return
        }

        await deleteProject(projects.id)
        toast.success('Successfully deleted project.')
        router.push('/dashboard')
        router.refresh()
      } catch (error) {
        console.error('Failed to delete project:', error)
        toast.error('An error occurred while deleting the project.')
      }
    })
  }

  const handleClick = async () => {
    if (!newName && !newDescription) {
      toast.error('Insert a name or description to save changes.')
      return
    }

    startTransition(async () => {
      try {
        await renameProject(Number(projectID), newName)
        await changeProjectDescription(Number(projectID), newDescription)
        toast.success('Updated project successfully!')
        router.refresh()
      } catch (error) {
        console.error('Error saving changes:', error)
        toast.error('Failed to save changes.')
      }
    })
  }

  return (
    <Card className="w-full rounded-none">
      <CardHeader>
        <CardTitle className="text-2xl">Project Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="group relative flex-grow">
            <label
              htmlFor="projectName"
              className="absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-sm text-muted-foreground/70 transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium has-[+input:not(:placeholder-shown)]:text-foreground"
            >
              <span className="inline-flex bg-background px-2">
                Project Name
              </span>
            </label>
            <Input
              id="projectName"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder=""
              className="w-full"
            />
          </div>
          <div className="group relative flex-grow">
            <label
              htmlFor="projectDescription"
              className="absolute top-0 block translate-y-2 cursor-text px-1 text-sm text-muted-foreground/70 transition-all group-focus-within:pointer-events-none group-focus-within:-translate-y-1/2 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-foreground has-[+textarea:not(:placeholder-shown)]:pointer-events-none has-[+textarea:not(:placeholder-shown)]:-translate-y-1/2 has-[+textarea:not(:placeholder-shown)]:cursor-default has-[+textarea:not(:placeholder-shown)]:text-xs has-[+textarea:not(:placeholder-shown)]:font-medium has-[+textarea:not(:placeholder-shown)]:text-foreground"
            >
              <span className="inline-flex bg-background px-2">
                Description
              </span>
            </label>
            <Textarea
              id="projectDescription"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder=""
              className="w-full"
            />
          </div>
          <Button
            onClick={handleClick}
            disabled={isPending}
            className="self-start text-white"
          >
            {isPending ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : (
              <Save className="mr-1 size-4" />
            )}
            Save Changes
          </Button>
        </div>
        <Separator />
        <div>
          <h3 className="text-lg font-semibold mb-2">Remove Project</h3>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-1 size-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-1 size-4" />
                )}
                Permanently Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to delete this project?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your project and remove all of its contents from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button variant="destructive" onClick={handleDelete} asChild>
                  <AlertDialogAction>Confirm</AlertDialogAction>
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
