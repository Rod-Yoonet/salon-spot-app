'use client';

import { Bell, Settings } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';

export default function Header() {
  const { user } = useUser();

  return (
    <header className="h-16 bg-white border-b border-grey-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-grey-800">
          {/* Page title will be set by individual pages */}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="p-2 hover:bg-grey-100 rounded-lg transition-colors relative">
          <Bell className="h-5 w-5 text-grey-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>

        {/* Settings */}
        <button className="p-2 hover:bg-grey-100 rounded-lg transition-colors">
          <Settings className="h-5 w-5 text-grey-600" />
        </button>

        {/* User Profile with Clerk */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-grey-800">{user.firstName || user.emailAddresses[0].emailAddress}</p>
              <p className="text-xs text-grey-500">
                {user.publicMetadata?.role as string || 'Team Member'}
              </p>
            </div>
          )}
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}
