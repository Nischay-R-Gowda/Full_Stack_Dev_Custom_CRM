import { forwardRef } from 'react'

const inputClasses = "w-full px-3 py-2 bg-white dark:bg-surface-800 dark:text-surface-100 dark:border-surface-700 dark:placeholder:text-surface-500 border border-surface-300 dark:border-surface-700 rounded-lg text-surface-800 dark:text-surface-100 text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"

const Label = ({ children, required }) => (
  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">{children}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
)

export const Input = forwardRef(function Input({ className = '', label, error, required, ...props }, ref) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <input ref={ref} className={`${inputClasses} ${error ? 'border-red-300 ring-1 ring-red-300' : ''} ${className}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
})

export const Select = forwardRef(function Select({ className = '', label, error, options = [], placeholder = 'Select...', required, ...props }, ref) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <select ref={ref} className={`${inputClasses} ${error ? 'border-red-300 ring-1 ring-red-300' : ''} ${className}`} {...props}>
        <option value="">{placeholder}</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea({ className = '', label, error, required, ...props }, ref) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <textarea ref={ref} className={`${inputClasses} ${error ? 'border-red-300 ring-1 ring-red-300' : ''} resize-y min-h-[80px] ${className}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
})

export default Input
