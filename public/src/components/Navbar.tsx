import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { To, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const handleMenuClick = (path: To) => {
    navigate(path);
  };
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleMenuClick("/dashboard")}>
            Dashboard
          </DropdownMenuItem>
          {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
          <DropdownMenuItem onClick={() => handleMenuClick("/")}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <h1 className="text-xl font-bold">Vidyasarthi</h1>
    </div>
  );
}
