"use client";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SignOutButton from "@/components/Buttons/SignOutButton";
import { Role } from "@prisma/client";
import { Session } from "next-auth";

export function UserNav({
  user,
  userRole,
}: {
  user: Session["user"];
  userRole: Role;
}) {
  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative  rounded-full"
              >
                <Avatar>
                  <AvatarFallback className="bg-transparent">
                    {user.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-y-2">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <p className="text-sm font-medium leading-none">{user.role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <SignOutButton
          loading={
            <>
              <LogOut
                size={18}
                className="w-4 h-4 mr-3 text-muted-foreground"
              />
              <p>Signing Out</p>
            </>
          }
          variant="outline"
          className="w-full justify-center h-10"
        >
          <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
          Sign out
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
