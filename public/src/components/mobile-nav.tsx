"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

const handleEmailClick = () => {
    window.location.href = "mailto:supportvidhyasarthi@gmail.com";
}

export function MobileNav() {
    const [open, setOpen] = useState(false)

    const handleNavClick = (targetId: string) => {
        setOpen(false) // Close the menu
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4">
                    <a
                        href="#about"
                        onClick={(e) => {
                            e.preventDefault()
                            handleNavClick("about")
                        }}
                        className="text-lg font-semibold hover:text-primary"
                    >
                        About
                    </a>
                    <a
                        href="#features"
                        onClick={(e) => {
                            e.preventDefault()
                            handleNavClick("features")
                        }}
                        className="text-lg font-semibold hover:text-primary"
                    >
                        Features
                    </a>
                    <a
                        href="#testimonials"
                        onClick={(e) => {
                            e.preventDefault()
                            handleNavClick("testimonials")
                        }}
                        className="text-lg font-semibold hover:text-primary"
                    >
                        Testimonials
                    </a>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            setOpen(false)
                            handleEmailClick()
                        }}
                        className="text-lg font-semibold hover:text-primary"
                    >
                        Contact
                    </a>
                </nav>
            </SheetContent>
        </Sheet>
    )
}
