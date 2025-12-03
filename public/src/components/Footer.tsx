import React from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { GraduationCap } from "lucide-react";

const Footer = () => {
  const handleEmailClick = () => {
    window.location.href = "mailto:supportvidhyasarthi@gmail.com";
  };

  return (
    <footer className="border-t py-6">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Vidhyasarthi</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {/* <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link> */}
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleEmailClick();
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="text-center text-xs">
        © {new Date().getFullYear()} Vidhyasarthi. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
