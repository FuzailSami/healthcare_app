interface AppointmentCardProps {
  patientName: string
  doctorName: string
  date: string
  time: string
  reason?: string
  isPast?: boolean
  onRemove: () => void
}

export function AppointmentCard({
  patientName,
  doctorName,
  date,
  time,
  reason,
  isPast,
  onRemove
}: AppointmentCardProps) {
  return (
    <div className="relative group overflow-hidden bg-dark-200/50 hover:bg-dark-200 rounded-xl p-5 transition-all duration-300 border border-gray-800 hover:border-gray-700">
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-100">{patientName}</h3>
            <p className="text-sm text-gray-400">{doctorName}</p>
          </div>
          <button
            onClick={onRemove}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isPast
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
            }`}
          >
            {isPast ? "Remove" : "Cancel"}
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-400">{date}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-400">{time}</span>
          </div>

          {reason && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-400">{reason}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
