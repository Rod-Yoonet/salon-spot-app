'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  GraduationCap,
  MessageSquare,
  Truck,
  CheckSquare,
  UserCog
} from 'lucide-react';

const menuItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/'
  },
  {
    label: 'Tasks',
    icon: CheckSquare,
    href: '/tasks'
  },
  {
    label: 'Customers',
    icon: Users,
    href: '/customers'
  },
  {
    label: 'Sales Pipeline',
    icon: TrendingUp,
    href: '/pipeline'
  },
  {
    label: 'VA Training',
    icon: GraduationCap,
    href: '/training'
  },
  {
    label: 'FAQ Management',
    icon: MessageSquare,
    href: '/faqs'
  },
  {
    label: 'Supplier Outreach',
    icon: Truck,
    href: '/suppliers'
  },
  {
    label: 'User Management',
    icon: UserCog,
    href: '/users'
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-grey-200 flex flex-col shadow-sm">
      {/* Logo/Brand */}
      <div className="h-16 flex items-center px-6 border-b border-grey-200">
        <Link href="/" className="flex items-center">
          <Image
            src="/salon-spot-logo.avif"
            alt="The Salon Spot"
            width={137}
            height={52}
            className="h-auto"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-grey-600 hover:bg-grey-50 hover:text-grey-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-grey-200">
        <div className="text-xs text-grey-500 text-center">
          © 2025 Salon Spot
        </div>
      </div>
    </aside>
  );
}
