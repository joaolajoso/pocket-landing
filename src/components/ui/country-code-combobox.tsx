import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { countryCodes, CountryCode } from "@/data/countryCodes";

interface CountryCodeComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function CountryCodeCombobox({
  value,
  onValueChange,
  className,
}: CountryCodeComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedCountry = countryCodes.find((c) => c.code === value);

  // Filter countries based on search query
  const filteredCountries = React.useMemo(() => {
    if (!searchQuery) return countryCodes;
    
    const query = searchQuery.toLowerCase();
    return countryCodes.filter(
      (country) =>
        country.country.toLowerCase().includes(query) ||
        country.code.includes(query) ||
        country.flag.includes(query)
    );
  }, [searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-[130px] h-14 justify-between bg-white/10 border-white/20 text-white rounded-xl hover:bg-white/15 hover:text-white focus:border-pink-500 focus:ring-pink-500/20",
            className
          )}
        >
          <span className="flex items-center gap-1.5 truncate">
            <span>{selectedCountry?.flag}</span>
            <span className="text-sm">{value}</span>
          </span>
          <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[280px] p-0 bg-[#1a1a2e] border-white/20" 
        align="start"
      >
        <Command className="bg-transparent">
          <div className="flex items-center border-b border-white/10 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-white/50" />
            <input
              placeholder="Pesquisar país..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-11 w-full bg-transparent py-3 text-sm text-white placeholder:text-white/50 outline-none"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-auto">
            {filteredCountries.length === 0 ? (
              <div className="py-6 text-center text-sm text-white/50">
                Nenhum país encontrado.
              </div>
            ) : (
              <CommandGroup>
                {filteredCountries.map((country) => (
                  <div
                    key={country.code}
                    onClick={() => {
                      onValueChange(country.code);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 cursor-pointer text-white hover:bg-white/10 transition-colors",
                      value === country.code && "bg-white/10"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        value === country.code ? "opacity-100 text-pink-500" : "opacity-0"
                      )}
                    />
                    <span className="text-lg">{country.flag}</span>
                    <span className="font-medium">{country.code}</span>
                    <span className="text-white/50 text-sm truncate flex-1">
                      {country.country}
                    </span>
                  </div>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
