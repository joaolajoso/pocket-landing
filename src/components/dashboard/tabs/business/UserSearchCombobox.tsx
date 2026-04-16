import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Search, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface PocketCVUser {
  id: string;
  name: string | null;
  slug: string | null;
  email: string | null;
  avatar_url: string | null;
  headline: string | null;
  is_member: boolean;
}

interface UserSearchComboboxProps {
  value: string;
  onSelect: (email: string, user: PocketCVUser) => void;
  organizationId?: string;
  disabled?: boolean;
}

export function UserSearchCombobox({ value, onSelect, organizationId, disabled }: UserSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<PocketCVUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PocketCVUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async (term: string) => {
    if (term.length < 1) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data, error: rpcError } = await supabase.rpc('search_pocketcv_users', {
        search_term: term,
        exclude_org_id: organizationId || null
      });

      if (rpcError) {
        console.error('Error searching users:', rpcError);
        setError('Erro ao pesquisar usuários');
        setUsers([]);
        return;
      }

      setUsers(data || []);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Erro ao pesquisar usuários');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length > 0) {
        searchUsers(searchTerm);
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, organizationId]);

  const handleSelect = (user: PocketCVUser) => {
    if (!user.email || user.is_member) return;
    
    setSelectedUser(user);
    onSelect(user.email, user);
    setOpen(false);
    setSearchTerm("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={selectedUser.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {selectedUser.name?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{selectedUser.name || selectedUser.email}</span>
              {selectedUser.slug && (
                <span className="text-muted-foreground text-xs">@{selectedUser.slug}</span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Pesquisar usuário PocketCV...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            className="flex h-11 w-full border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Digite @nickname ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin opacity-50" />}
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2">
            {error && (
              <div className="py-6 text-center text-sm text-destructive">
                {error}
              </div>
            )}
            {!error && !loading && searchTerm.length > 0 && users.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Nenhum usuário encontrado.
              </div>
            )}
            {!error && !loading && searchTerm.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Digite para pesquisar usuários
              </div>
            )}
            {!error && users.length > 0 && (
              <div className="space-y-1">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelect(user)}
                    disabled={user.is_member}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-md text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "focus:outline-none focus:bg-accent focus:text-accent-foreground"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {user.name || "Sem nome"}
                        </span>
                        {user.slug && (
                          <span className="text-muted-foreground text-xs">
                            @{user.slug}
                          </span>
                        )}
                        {user.is_member && (
                          <Badge variant="secondary" className="text-xs">
                            Já é membro
                          </Badge>
                        )}
                      </div>
                      {user.headline && (
                        <p className="text-xs text-muted-foreground truncate">
                          {user.headline}
                        </p>
                      )}
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
