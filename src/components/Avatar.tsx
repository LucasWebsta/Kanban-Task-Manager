import type { TeamMember } from '../types'

interface Props {
  member: TeamMember
  size?: 'sm' | 'md'
}

export default function Avatar({ member, size = 'sm' }: Props) {
  const initials = member.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const sizeClass = size === 'sm' ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-xs'

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: member.color }}
      title={member.name}
    >
      {initials}
    </div>
  )
}
