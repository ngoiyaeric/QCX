import { Button } from '@/components/ui/button'
import { ArrowRight, icons } from 'lucide-react'
import { Globe, Video, FileText, Search,
  CircleUserRound,
  Map,
  CalendarDays,
  TentTree} from 'lucide-react';



const exampleMessages = [
  {
    
    heading: "What is the best route and time for a Jog tomorrow Morning?",
    message: "What is the best route and time for a Jog tomorrow Morning?",
    icon: Map
  },
  {
    
    heading: "Plan me a safari trip",
    message: "Plan me a safari trip",
    icon: CalendarDays 

  },
  {
    heading: 'Recommend a nature video on rare species' ,
    message: 'Recommend a nature video on rare species',
    icon: Video
  },
  {
    heading: 'How far is mars today?',
    message: 'How far is mars today?',
    icon: Globe
  },

  {
    heading: 'Make a brunch reservation for me this weekend',
    message: 'Make a brunch reservation for me this weekend',
    icon: CalendarDays
  },

  {
    heading: 'Who owns that green building next to the subway station?',
    message: 'Who owns that green building next to the subway station?',
    icon: TentTree
  }


]
export function EmptyScreen({
  submitMessage,
  className
}: {
  submitMessage: (message: string) => void
  className?: string
}) {
  return (
    <div className={`mx-auto w-full transition-all ${className}`}>
      <div className="bg-background p-2">
        <div className="mt-4 flex flex-col items-start space-y-2 mb-4">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              name={message.message}
              onClick={async () => {
                submitMessage(message.message)
              }}
            >
              <ArrowRight size={16} className="mr-2 text-muted-foreground" />
              <message.icon size={16} className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
