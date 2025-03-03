import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, Users, FileText, Settings, Home } from 'lucide-react';

interface AdminLayoutProps {
    user: User;
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ user, children }) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
        { name: 'User Management', href: '/admin/users', icon: Users },
        { name: 'Task Overview', href: '/task-dashboard', icon: FileText },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    const NavItems = () => (
        <nav className="space-y-1 px-2">
            {navigation.map((item) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                        <Icon className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
                        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                            <div className="flex items-center flex-shrink-0 px-4">
                                <h1 className="text-xl font-bold">Admin Panel</h1>
                            </div>
                            <div className="mt-5 flex-1">
                                <NavItems />
                            </div>
                        </div>
                        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                            <div className="flex items-center">
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-700">{user.name}</p>
                                    <p className="text-xs font-medium text-gray-500">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <div className="md:hidden">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-1 mt-1">
                            <MenuIcon className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                        <div className="py-4">
                            <div className="flex items-center mb-6">
                                <h1 className="text-xl font-bold">Admin Panel</h1>
                            </div>
                            <NavItems />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main content */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
