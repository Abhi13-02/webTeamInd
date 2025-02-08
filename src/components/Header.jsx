import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { checkUser } from '@/lib/checkUser'

const Header = async() => {
  await checkUser();
  
  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50 ">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo on the left */}
        <Link href="/" className="text-2xl font-bold text-gray-800">
          MyWebsite
        </Link>

        {/* Authentication buttons on the right */}
        <div className="flex items-center space-x-4 ">
          <SignedOut>
            <SignInButton forceRedirectUrl='/dashboard'>
              <Button >
                Login
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: 'w-10 h-10',
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}

export default Header
