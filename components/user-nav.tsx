"use client";

import {
  FolderKanban,
  KeyRound,
  LogOut,
  MessageSquare,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useV0ApiKeyModal } from "@/contexts/v0-api-key-modal-context";
import { authClient } from "@/lib/auth-client";

interface UserNavProps {
  session: {
    user?: {
      email?: string | null;
      name?: string | null;
      image?: string | null;
    } | null;
  } | null;
}

export function UserNav({ session }: UserNavProps) {
  const router = useRouter();
  const { openKeyModal } = useV0ApiKeyModal();
  const displayName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const isSignedOut = !session?.user;

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {isSignedOut ? <User className="h-4 w-4" /> : initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm leading-none">
              {isSignedOut ? "Not signed in" : displayName}
            </p>
            {session?.user?.email && (
              <p className="text-muted-foreground text-xs leading-none">
                {session.user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isSignedOut && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/projects" className="cursor-pointer">
                <FolderKanban className="mr-2 h-4 w-4" />
                <span>Projects</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/chats" className="cursor-pointer">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Chats</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                openKeyModal();
              }}
              className="cursor-pointer"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              <span>API Key</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {isSignedOut && (
          <>
            <DropdownMenuItem asChild>
              <a href="/register" className="cursor-pointer">
                <span>Create Account</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/login" className="cursor-pointer">
                <span>Sign In</span>
              </a>
            </DropdownMenuItem>
          </>
        )}
        {!isSignedOut && (
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
