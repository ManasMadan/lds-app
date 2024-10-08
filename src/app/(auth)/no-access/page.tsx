import SignOutButton from "@/components/Buttons/SignOutButton";
import { LogOut } from "lucide-react";
import React from "react";

export default function page() {
  return (
    <div>
      No Access
      <SignOutButton
        loading={
          <>
            <LogOut className="w-4 h-4 mr-3 text-muted-foreground" size={18} />
            <p>Signing Out</p>
          </>
        }
      >
        <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
        Sign Out
      </SignOutButton>
    </div>
  );
}
