import React, { useState } from 'react'
import { Button } from './ui/button'
import { X } from 'lucide-react'

const CalendarSettingsModal = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleToggle = (category, field) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field]
      }
    }))
  }

  const handleSave = () => {
    onSettingsChange(localSettings)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Calendar settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Time Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time zone
            </label>
            <select 
              value={localSettings.timezone}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="GMT-06:00">(GMT-06:00) Mountain Time - Denver</option>
              <option value="GMT-05:00">(GMT-05:00) Eastern Time - New York</option>
              <option value="GMT-06:00">(GMT-06:00) Central Time - Chicago</option>
              <option value="GMT-08:00">(GMT-08:00) Pacific Time - Los Angeles</option>
              <option value="GMT-05:00">(GMT-05:00) Eastern Time - Miami</option>
            </select>
          </div>

          {/* Display Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Only display business hours
              </label>
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, businessHoursOnly: !prev.businessHoursOnly }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.businessHoursOnly ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.businessHoursOnly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Display US holidays
              </label>
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, showHolidays: !prev.showHolidays }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localSettings.showHolidays ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localSettings.showHolidays ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Calendar Items Options */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Calendar items options</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="amount"
                    checked={localSettings.displayOptions.amount}
                    onChange={() => handleToggle('displayOptions', 'amount')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="amount" className="text-sm text-gray-700">Amount</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="arrivalWindow"
                    checked={localSettings.displayOptions.arrivalWindow}
                    onChange={() => handleToggle('displayOptions', 'arrivalWindow')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="arrivalWindow" className="text-sm text-gray-700">Arrival window</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cityState"
                    checked={localSettings.displayOptions.cityState}
                    onChange={() => handleToggle('displayOptions', 'cityState')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="cityState" className="text-sm text-gray-700">City, State</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="customer"
                    checked={localSettings.displayOptions.customer}
                    onChange={() => handleToggle('displayOptions', 'customer')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="customer" className="text-sm text-gray-700">Customer</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="description"
                    checked={localSettings.displayOptions.description}
                    onChange={() => handleToggle('displayOptions', 'description')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="description" className="text-sm text-gray-700">Description</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="jobName"
                    checked={localSettings.displayOptions.jobName}
                    onChange={() => handleToggle('displayOptions', 'jobName')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="jobName" className="text-sm text-gray-700">Job name</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="jobNumber"
                    checked={localSettings.displayOptions.jobNumber}
                    onChange={() => handleToggle('displayOptions', 'jobNumber')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="jobNumber" className="text-sm text-gray-700">Job number</label>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="jobTags"
                    checked={localSettings.displayOptions.jobTags}
                    onChange={() => handleToggle('displayOptions', 'jobTags')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="jobTags" className="text-sm text-gray-700">Job tags</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="phoneNumber"
                    checked={localSettings.displayOptions.phoneNumber}
                    onChange={() => handleToggle('displayOptions', 'phoneNumber')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="phoneNumber" className="text-sm text-gray-700">Phone number</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="schedule"
                    checked={localSettings.displayOptions.schedule}
                    onChange={() => handleToggle('displayOptions', 'schedule')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="schedule" className="text-sm text-gray-700">Schedule</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="street"
                    checked={localSettings.displayOptions.street}
                    onChange={() => handleToggle('displayOptions', 'street')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="street" className="text-sm text-gray-700">Street</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="team"
                    checked={localSettings.displayOptions.team}
                    onChange={() => handleToggle('displayOptions', 'team')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="team" className="text-sm text-gray-700">Team</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="zipCode"
                    checked={localSettings.displayOptions.zipCode}
                    onChange={() => handleToggle('displayOptions', 'zipCode')}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="zipCode" className="text-sm text-gray-700">Zip code</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CalendarSettingsModal

