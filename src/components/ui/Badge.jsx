const colorMap = {
  gray: 'bg-surface-100 text-surface-700',
  red: 'bg-[#fff0eb] text-[#a45142]',
  green: 'bg-[#e8f4ec] text-[#347454]',
  blue: 'bg-[#eaf1ff] text-[#4567ae]',
  yellow: 'bg-[#fff5da] text-[#927024]',
  indigo: 'bg-[#eeecff] text-[#5849ae]',
  purple: 'bg-[#f4eaff] text-[#8051a8]',
  pink: 'bg-[#ffebf2] text-[#a34e73]',
  emerald: 'bg-[#e5f5f1] text-[#287667]',
}

export function Badge({ children, color = 'gray', size = 'md', dot }) {
  return (
    <span className={`inline-flex items-center gap-1 border border-current/10 font-medium ${colorMap[color] || colorMap.gray} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'} rounded-sm`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />}
      {children}
    </span>
  )
}
