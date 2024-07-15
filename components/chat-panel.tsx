'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { AI, UIState } from '@/app/actions'
import { useUIState, useActions } from 'ai/rsc'
import { cn } from '@/lib/utils'
import { UserMessage } from './user-message'
import { Button } from './ui/button'
import { ArrowRight, Plus, Paperclip } from 'lucide-react'
import { EmptyScreen } from './empty-screen'
import Textarea from 'react-textarea-autosize'
import { nanoid } from 'ai'

interface ChatPanelProps {
  messages: UIState
}

export function ChatPanel({ messages }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [, setMessages] = useUIState<typeof AI>()
  const { submit } = useActions()
  const [isButtonPressed, setIsButtonPressed] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [showEmptyScreen, setShowEmptyScreen] = useState(false)
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

 

  // Focus on input when button is pressed
  useEffect(() => {
    if (isButtonPressed) {
      inputRef.current?.focus()
      setIsButtonPressed(false)
    }
  }, [isButtonPressed])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Clear messages if button is pressed
    if (isButtonPressed) {
      handleClear()
      setIsButtonPressed(false)
    }

    // Add user message to UI state
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        component: <UserMessage message={input} />
      }
    ])

    // Submit and get response message
    const formData = new FormData(e.currentTarget)
    const responseMessage = await submit(formData)
    setMessages(currentMessages => [...currentMessages, responseMessage as any])
  }

  // Clear messages
  const handleClear = () => {
    router.push('/')
  }

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent): void => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setShowDropdown(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);



  useEffect(() => {
    // Focus on input when the page loads
    inputRef.current?.focus()
  }, [])
  

  // If there are messages and the new button has not been pressed, display the new Button
  if (messages.length > 0 && !isButtonPressed) {
    return (
      <div className="fixed bottom-2 md:bottom-8 left-2 flex justify-start items-center mx-auto pointer-events-none">
        <Button
          type="button"
          variant={'secondary'}
          className="rounded-full bg-secondary/80 group transition-all hover:scale-105 pointer-events-auto"
          onClick={() => handleClear()}
        >
          <span className="text-sm mr-2 group-hover:block hidden animate-in fade-in duration-300">
            New
          </span>
          <Plus size={18} className="group-hover:rotate-90 transition-all" />
        </Button>
      </div>
    )
  }

  function handleOption2Click(event: React.MouseEvent<HTMLButtonElement>): void {
    throw new Error('Function not implemented.')

  }
  
  const handleOption1Click = () => {
    const reader = new FileReader();
    //add file to gpt4o context 
    reader.onload = () => {
      // Store the file content in localStorage
      localStorage.setItem('uploadedFile', reader.result as string)
      alert('File content stored in local storage')
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        // Store the file content in localStorage
        localStorage.setItem('uploadedFile', reader.result as string)
        alert('File content stored in local storage')
      }
      reader.readAsText(file)
    }
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="fixed top-10 left-2 bottom-8 w-1/2 flex flex-col items-start justify-center">
      <form onSubmit={handleSubmit} className="max-w-full w-full px-6">
        <div className="relative flex items-start w-full">
          <Textarea
            ref={inputRef}
            name="input"
            rows={1}
            maxRows={5}
            tabIndex={0}
            placeholder="Ask a question..."
            spellCheck={false}
            value={input}
            className="resize-none w-full min-h-12 rounded-fill bg-muted border border-input pl-4 pr-20 pt-3 pb-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'"
            onChange={e => {
              setInput(e.target.value)
              setShowEmptyScreen(e.target.value.length === 0)
            }}
            onKeyDown={e => {
              // Enter should submit the form
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                // Prevent the default action to avoid adding a new line
                if (input.trim().length === 0) {
                  e.preventDefault()
                  return
                }
                e.preventDefault()
                const textarea = e.target as HTMLTextAreaElement
                textarea.form?.requestSubmit()
              }
            }}
            onHeightChange={height => {
              // Ensure inputRef.current is defined
              if (!inputRef.current) return

              // The initial height and left padding is 70px and 2rem
              const initialHeight = 70
              // The initial border radius is 32px
              const initialBorder = 32
              // The height is incremented by multiples of 20px
              const multiple = (height - initialHeight) / 20

              // Decrease the border radius by 4px for each 20px height increase
              const newBorder = initialBorder - 4 * multiple
              // The lowest border radius will be 8px
              inputRef.current.style.borderRadius =
                Math.max(8, newBorder) + 'px'
            }}
            onFocus={() => setShowEmptyScreen(true)}
            onBlur={() => setShowEmptyScreen(false)}
          />
          
          {/* Paperclip icon with dropdown */}
          <div className={cn('relative')}>
            <Button
              type="button"
              variant={'ghost'}
              size={'icon'}
              className={cn("absolute right-12 top-6 transform -translate-y-1/2")}
              onClick={toggleDropdown}
            >
              <Paperclip size={20} />
            </Button>

            {showDropdown && (
              <div className={cn("absolute top-10 right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none")}>
                <div ref={dropdownRef} className={cn("py-1")} role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  {/* Dropdown menu options */}
                  <button onClick={handleOption1Click} className={cn("block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left")}role="menuitem">
                    My Computer
                  </button>
                  <button onClick={handleOption2Click} className={cn("block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left")} role="menuitem">
                    Drive
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            size={'icon'}
            variant={'ghost'}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            disabled={input.length === 0}
          >
            <ArrowRight size={20} />
          </Button>
        </div>
        <EmptyScreen
          submitMessage={message => {
            setInput(message)
          }}
          className={cn(showEmptyScreen ? 'visible' : 'invisible')}
        />
      </form>
    </div>
  )
}
