'use client'

import { useState, useTransition } from 'react'
import { Button } from './ui/button'
import { Share } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
  DialogTitle
} from './ui/dialog'
// import { shareChat } from '@/lib/actions/chat'; // TODO: Re-evaluate/reimplement sharing with Supabase
import { toast } from 'sonner'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { Spinner } from './ui/spinner'

interface ChatShareProps {
  chatId: string
  className?: string
}

export function ChatShare({ chatId, className }: ChatShareProps) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const { copyToClipboard } = useCopyToClipboard({ timeout: 1000 })
  const [shareUrl, setShareUrl] = useState('')

  // const handleShare = async () => {
  //   startTransition(() => {
  //     setOpen(true)
  //   })
  //   // TODO: Re-evaluate/reimplement sharing with Supabase
  //   // const result = await shareChat(chatId)
  //   // if (!result) {
  //   //   toast.error('Failed to share chat')
  //   //   return
  //   // }

  //   // if (!result.sharePath) {
  //   //   toast.error('Could not copy link to clipboard')
  //   //   return
  //   // }

  //   // const url = new URL(result.sharePath, window.location.href)
  //   // setShareUrl(url.toString())
  //   toast.info("Sharing functionality is currently disabled.");
  //   setOpen(false); // Close dialog if opened by trigger
  // }

  // const handleCopy = () => {
  //   if (shareUrl) {
  //     copyToClipboard(shareUrl)
  //     toast.success('Link copied to clipboard')
  //     setOpen(false)
  //   } else {
  //     toast.error('No link to copy')
  //   }
  // }

  // TODO: Re-evaluate/reimplement sharing with Supabase. For now, disable the UI.
  if (true) { // Conditionally disable the share button/dialog
    return null; // Or return a disabled button: <Button className={className} variant="ghost" size="icon" disabled><Share size={14} /></Button>
  }

  return (
    <div className={className}>
      {/* <Dialog
        open={open}
        onOpenChange={open => setOpen(open)}
        aria-labelledby="share-dialog-title"
        aria-describedby="share-dialog-description"
      >
        <DialogTrigger asChild>
          <Button
            className="rounded-full"
            size="icon"
            variant={'ghost'}
            // onClick={() => setOpen(true)} // Original trigger
            onClick={() => { // Temporarily disable direct opening, or let handleShare manage it
                toast.info("Sharing functionality is currently disabled.");
            }}
          >
            <Share size={14} />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share link to search result</DialogTitle>
            <DialogDescription>
              Anyone with the link will be able to view this search result.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="items-center">
            {!shareUrl && (
              // <Button onClick={handleShare} disabled={pending} size="sm">
              //   {pending ? <Spinner /> : 'Get link'}
              // </Button>
              <Button disabled={true} size="sm">Get link (Disabled)</Button>
            )}
            {shareUrl && (
              // <Button onClick={handleCopy} disabled={pending} size="sm">
              //   {'Copy link'}
              // </Button>
              <Button disabled={true} size="sm">Copy link (Disabled)</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  )
}
