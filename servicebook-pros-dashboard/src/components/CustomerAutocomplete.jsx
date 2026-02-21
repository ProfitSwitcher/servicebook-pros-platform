import React, { useState, useEffect, useRef } from 'react'

/**
 * CustomerAutocomplete — searchable typeahead for selecting a customer.
 *
 * Props:
 *   customers   — array of customer objects [{ id, name, email, phone }, ...]
 *   value       — currently selected customer_id (string or number, '' if none)
 *   onChange    — called with { customer_id, customer_name } when selection changes
 *   placeholder — input placeholder text (default: "Search customers...")
 *   className   — extra classes for the wrapper div
 */
const CustomerAutocomplete = ({
  customers = [],
  value = '',
  onChange,
  placeholder = 'Search customers...',
  className = '',
}) => {
  const selectedCustomer = customers.find(c => String(c.id) === String(value)) || null
  const [inputValue, setInputValue] = useState(selectedCustomer?.name || '')
  const [isOpen, setIsOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  // Keep input in sync when value prop changes (e.g. sessionStorage auto-fill)
  useEffect(() => {
    const c = customers.find(c => String(c.id) === String(value))
    setInputValue(c?.name || '')
  }, [value, customers])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
        // If user typed but didn't select, revert to last valid selection
        if (selectedCustomer) {
          setInputValue(selectedCustomer.name)
        } else {
          setInputValue('')
        }
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [selectedCustomer])

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(inputValue.toLowerCase()) ||
    c.email?.toLowerCase().includes(inputValue.toLowerCase()) ||
    c.phone?.includes(inputValue)
  )

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    setIsOpen(true)
    setHighlighted(0)
    // Clear selection if user is typing
    if (value) {
      onChange({ customer_id: '', customer_name: '' })
    }
  }

  const handleSelect = (customer) => {
    setInputValue(customer.name)
    setIsOpen(false)
    onChange({ customer_id: String(customer.id), customer_name: customer.name })
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setIsOpen(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[highlighted]) handleSelect(filtered[highlighted])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      if (selectedCustomer) setInputValue(selectedCustomer.name)
    }
  }

  const handleClear = () => {
    setInputValue('')
    setIsOpen(false)
    onChange({ customer_id: '', customer_name: '' })
    inputRef.current?.focus()
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        {(inputValue || value) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 leading-none text-lg"
            tabIndex={-1}
          >
            &times;
          </button>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filtered.map((customer, idx) => (
            <li
              key={customer.id}
              onMouseDown={() => handleSelect(customer)}
              onMouseEnter={() => setHighlighted(idx)}
              className={`px-3 py-2 cursor-pointer text-sm ${
                idx === highlighted ? 'bg-blue-50 text-blue-800' : 'hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{customer.name}</div>
              {(customer.email || customer.phone) && (
                <div className="text-xs text-gray-500">
                  {customer.email}{customer.email && customer.phone ? ' · ' : ''}{customer.phone}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {isOpen && customers.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm text-gray-500">
          Loading customers...
        </div>
      )}

      {isOpen && customers.length > 0 && inputValue.length > 0 && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm text-gray-500">
          No customers found matching "{inputValue}"
        </div>
      )}
    </div>
  )
}

export default CustomerAutocomplete
