import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'
import { checkUser } from '@/lib/checkUser'

const Header = async() => {
   const user = await checkUser();

  return (
    <header className=" h-16  w-full bg-gray-300 shadow-md ">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo on the left */}
        <Link href="/" className="text-2xl font-bold text-gray-800">
          MoneyGuru
        </Link>

        {/* Authentication buttons on the right */}
        <div className="flex items-center space-x-4 ">
          <Link href="/dashboard">
              <Button className="mr-4 bg-blue-600">Dashboard</Button>
          </Link>
          {
            user?.userName && (
              <span className='md:block hidden'>Welcome Back!{" "}{user?.userName}</span>
            )
          }
          <SignedOut onClick={() => {window.location.href = '/sign-in'}}>
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
