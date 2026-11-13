import { Link } from 'react-router-dom'
import { ArrowLeft, SearchX } from 'lucide-react'
import { AppLayout } from '../components/AppLayout'
import { primaryButtonClassName, secondaryButtonClassName } from '../components/ui'

export function NotFoundPage() {
  return (
    <AppLayout title="" subtitle="" centered>
      <section
        className="grid flex-1 content-center justify-items-center px-4 py-10 text-center"
        aria-labelledby="not-found-title"
      >
        <div className="grid size-16 place-items-center rounded-2xl border border-slate-200 bg-white text-blue-600 shadow-[var(--card-shadow)]">
          <SearchX className="size-8" aria-hidden="true" />
        </div>
        <p className="mb-1 mt-6 text-sm font-semibold tracking-[0.16em] text-blue-600">ERROR 404</p>
        <h1
          className="m-0 text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl"
          id="not-found-title"
        >
          Page not found
        </h1>
        <p className="mb-0 mt-3 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
          This page may have moved or the address might be incorrect. Let’s get you back on track.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link className={primaryButtonClassName} to="/dashboard">
            Go to dashboard
          </Link>
          <button
            className={secondaryButtonClassName}
            type="button"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Go back
          </button>
        </div>
      </section>
    </AppLayout>
  )
}
