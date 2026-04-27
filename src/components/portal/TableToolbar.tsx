import { Search, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  filterType?: string;
  onFilterType?: (v: string) => void;
  filterHostel?: string;
  onFilterHostel?: (v: string) => void;
  filterDate?: Date | null;
  onFilterDate?: (v: Date | null) => void;
  hostels?: string[];
}

export const TableToolbar = ({ search, onSearch, filterType, onFilterType, filterHostel, onFilterHostel, filterDate, onFilterDate, hostels = [] }: Props) => (
  <div className="flex flex-wrap items-center gap-3 mb-4">
    <div className="relative flex-1 min-w-[220px]">
      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search by student / reg no. / parent…"
        className="pl-9 bg-card"
      />
    </div>
    {onFilterType && (
      <Select value={filterType} onValueChange={onFilterType}>
        <SelectTrigger className="w-[180px] bg-card">
          <Filter className="h-4 w-4 mr-1 text-muted-foreground" />
          <SelectValue placeholder="Permission type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="day_out">Day Out</SelectItem>
          <SelectItem value="night_out">Night Out</SelectItem>
          <SelectItem value="special">Special Permission</SelectItem>
        </SelectContent>
      </Select>
    )}
    {onFilterHostel && (
      <Select value={filterHostel} onValueChange={onFilterHostel}>
        <SelectTrigger className="w-[180px] bg-card">
          <SelectValue placeholder="Hostel" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All hostels</SelectItem>
          {hostels.map((h) => (
            <SelectItem key={h} value={h}>{h}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
    {onFilterDate && (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[180px] bg-card justify-start text-left font-normal">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            {filterDate ? format(filterDate, "MMM dd, yyyy") : "Pick date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={filterDate || undefined}
            onSelect={onFilterDate}
          />
        </PopoverContent>
      </Popover>
    )}
  </div>
);
