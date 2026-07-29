import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[var(--color-brand-soft)] text-[var(--color-brand)]',
        success: 'border-transparent bg-[var(--color-success-soft)] text-[var(--color-success)]',
        warning: 'border-transparent bg-[var(--color-warning-soft)] text-[var(--color-warning)]',
        danger: 'border-transparent bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
        muted: 'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-ink-secondary)]',
        outline: 'border-[var(--color-border-strong)] bg-white text-[var(--color-ink-secondary)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
