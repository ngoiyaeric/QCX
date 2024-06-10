import React from 'react'
import Link from 'next/link'
import { SiDiscord, SiGithub, SiTwitter } from 'react-icons/si'
import { Button } from './ui/button'

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        width: '100%',
        height: '7.75%',
        padding: '1rem 1.5rem',
        position: 'fixed',
        bottom: 0,
        right: 0
      }}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-10">
          <Link href="https://discord.com/invite/WEPSzPbWtq" passHref>
            <Button variant="ghost" size="icon">
              <SiDiscord size={24} />
            </Button>
          </Link>
          <Link href="https://github.com/QueueLab/MapGPT" passHref>
            <Button variant="ghost" size="icon">
              <SiGithub size={24} />
            </Button>
          </Link>
          <Link href="https://twitter.com" passHref>
            <Button variant="ghost" size="icon">
              <SiTwitter size={24} />
            </Button>
          </Link>
        </div>
        <div className="w-1/2 left-justified p-4">
          <p>&copy; {new Date().getFullYear()} Queue Enterprise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer