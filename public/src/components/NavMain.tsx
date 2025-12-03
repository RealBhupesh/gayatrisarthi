'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { ModeToggle } from "../components/ThemeToggle"
import { Menu } from 'lucide-react'
import { useLocation } from "react-router-dom"
import { useState, useEffect } from "react"

interface NavMainProps {
    userData: any
    handleLogout: () => void
    handleMenuClick: (path: string) => void
}

const NavMain: React.FC<NavMainProps> = ({ userData, handleLogout, handleMenuClick }) => {
    const [menuOptions, setMenuOptions] = useState<string[]>([]);
    const location = useLocation();

    // Helper to map a menu label to a route path. Update here to keep paths in
    // sync with `react-router` routes.
    const optionToPath = (option: string) => {
        switch (option) {
            case "Dashboard":
                return "/dashboard";
            case "Profile":
                return "/profile";
            case "Global Leaderboard":
                return "/leaderboard";
            case "Preferences":
                return "/preferences";
            case "Quiz Categories":
                return "/quiz-categories";
            case "Create Quiz":
                return "/create-quiz";
            case "Admin Dashboard":
                return "/admin";
            default:
                return "/";
        }
    };

    useEffect(() => {
        const isAdmin = userData && userData.role === "admin";

        // Core links available for authenticated users.
        const coreLinks = [
            "Dashboard",
            "Profile",
            "Global Leaderboard",
            "Quiz Categories",
            "Preferences",
        ];

        // Admin-specific links.
        const adminLinks = isAdmin ? ["Create Quiz", "Admin Dashboard"] : [];

        // Always keep Logout as last item when user is authenticated
        const authExtras = userData ? ["Logout"] : [];

        // Combine links while preserving order.
        setMenuOptions([...coreLinks, ...adminLinks, ...authExtras]);
    }, [location.pathname, userData])

    return (
        <nav className="flex items-center justify-between p-1 bg-background">
            <div className="flex items-center space-x-4">
                <ModeToggle />
                {userData ? (
                    <div className="flex items-center space-x-3">
                        <Avatar>
                            <AvatarImage
                                src={localStorage.getItem("photoURLChhatraKey")!}
                                alt="profile_photo"
                            />
                            <AvatarFallback>
                                {userData?.fullName ? userData.fullName[0] : "?"}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                            Hello, {userData.fullName.split(" ")[0]}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center space-x-4">
                        <Skeleton className="size-8 rounded-full" />
                        <Skeleton className="h-6 w-[90px]" />
                    </div>
                )}
            </div>

            {/* Additional elements such as search can be placed here if needed */}

            {/* Desktop links */}
            <div className="hidden md:flex flex-wrap items-center gap-x-4 gap-y-2 justify-end max-w-full">
                {menuOptions.map((option) => (
                    option === "Logout" ? (
                        <Button key={option} variant="ghost" onClick={handleLogout}>
                            {option}
                        </Button>
                    ) : (
                        <Button
                            key={option}
                            variant={location.pathname === optionToPath(option) ? "secondary" : "ghost"}
                            onClick={() => handleMenuClick(optionToPath(option))}
                        >
                            {option}
                        </Button>
                    )
                ))}
            </div>

            {/* Mobile dropdown menu */}
            <div className="md:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {menuOptions.map((option, index) => (
                            <DropdownMenuItem
                                key={index}
                                onClick={() => {
                                    if (option === "Logout") handleLogout();
                                    else handleMenuClick(optionToPath(option));
                                }}
                            >
                                {option}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
};

export default NavMain

