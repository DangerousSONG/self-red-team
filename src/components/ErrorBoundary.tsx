import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Task page crashed', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="flex-1 overflow-x-hidden px-6 py-5">
        <Card>
          <CardContent className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
            <h2 className="text-xl font-semibold text-[var(--color-ink)]">页面状态需要刷新</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[var(--color-ink-secondary)]">
              本地缓存里的任务配置可能来自旧版本。点击下方按钮后会重新渲染当前页面。
            </p>
            <Button className="mt-5" onClick={() => this.setState({ hasError: false })}>
              重新加载页面状态
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }
}
