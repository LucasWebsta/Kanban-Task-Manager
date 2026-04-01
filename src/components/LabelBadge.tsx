import type { Label } from '../types'

interface Props {
  label: Label
  size?: 'sm' | 'xs'
}

export default function LabelBadge({ label, size = 'xs' }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}`}
      style={{ backgroundColor: label.color + '22', color: label.color, border: `1px solid ${label.color}44` }}
    >
      {label.name}
    </span>
  )
}
