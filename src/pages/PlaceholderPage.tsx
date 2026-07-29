import { Construction } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface PlaceholderPageProps {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <Card className="w-full max-w-xl">
        <CardContent className="flex flex-col items-center px-8 py-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
            <Construction className="h-5 w-5" />
          </div>
          <Badge variant="outline" className="mb-3 font-mono">
            MODULE READY FOR BINDING
          </Badge>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">{title}</h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--color-ink-secondary)]">
            {description}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
