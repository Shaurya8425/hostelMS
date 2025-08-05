import React, { useState, useEffect } from "react";

interface SearchBarProps {
  initialValue: string;
  placeholder: string;
  onSearch: (value: string) => void;
  className?: string;
}

// This component is memoized to prevent unnecessary re-renders
const SearchBar = React.memo(
  ({ initialValue, placeholder, onSearch, className = "" }: SearchBarProps) => {
    // Local state for the input value
    const [inputValue, setInputValue] = useState(initialValue);

    // Update local state when prop changes
    useEffect(() => {
      setInputValue(initialValue);
    }, [initialValue]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // We'll debounce in this component rather than in the parent
      const timer = setTimeout(() => {
        onSearch(newValue);
      }, 500);

      return () => clearTimeout(timer);
    };

    return (
      <input
        type='text'
        placeholder={placeholder}
        className={`border px-4 py-2 rounded shadow-sm ${className}`}
        value={inputValue}
        onChange={handleChange}
      />
    );
  }
);

export default SearchBar;
