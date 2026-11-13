export const panelClassName =
  'rounded-[10px] border border-slate-200 bg-white shadow-[var(--card-shadow)]'

const buttonBaseClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-55'

export const primaryButtonClassName = `${buttonBaseClassName} border-blue-600 bg-blue-600 font-semibold text-white shadow-sm hover:border-blue-700 hover:bg-blue-700 active:translate-y-px`

export const secondaryButtonClassName = `${buttonBaseClassName} border-slate-300 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50`

const iconButtonBaseClassName =
  'grid size-10 shrink-0 place-items-center rounded-md border border-transparent bg-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50'

export const iconButtonClassName = iconButtonBaseClassName

export const dangerIconButtonClassName = `${iconButtonClassName} hover:text-red-700`

export const textButtonClassName =
  'inline-flex min-h-8 items-center justify-center rounded-md border border-transparent bg-transparent px-1 py-1 text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-55'

export const sortButtonClassName =
  'inline-flex min-h-11 cursor-pointer items-center gap-1 border-0 bg-transparent p-0 font-[inherit] text-inherit transition hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'

export const textLinkClassName =
  'text-sm text-blue-600 no-underline hover:text-blue-700 hover:underline'
