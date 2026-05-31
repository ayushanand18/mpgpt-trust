"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserSearchProps {
  onSearch: (searchType: string, searchValue: string) => void
  disabled?: boolean
}

export function UserSearch({ onSearch, disabled }: UserSearchProps) {
  const [searchType, setSearchType] = useState("memberId")
  const [searchValue, setSearchValue] = useState("")

  const handleSearch = () => {
    if (searchValue.trim()) {
      onSearch(searchType, searchValue)
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Select value={searchType} onValueChange={setSearchType} disabled={disabled}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="memberId">Member ID</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="phoneNumber">Phone Number</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex flex-1 gap-2">
        <Input
          placeholder={`Search by ${searchType}...`}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          disabled={disabled}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={disabled} className="shrink-0">
          {disabled ? "Searching..." : <><Search className="h-4 w-4 mr-2" /> Search</>}
        </Button>
      </div>
    </div>
  )
}
