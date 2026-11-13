import { NavLink, useNavigate } from 'react-router-dom'
import { useState, type ReactNode } from 'react'
import {
  ChevronLeft,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  ScanSearch,
  Settings,
  ShieldCheck,
  Target,
} from 'lucide-react'

const navigation = [
  { label: 'Dashboard', to: '/dashboard', Icon: LayoutDashboard },
  { label: 'Targets', to: '/targets', Icon: Target },
  { label: 'Scans', to: '/scans', Icon: ScanSearch },
  { label: 'Findings', to: '/findings', Icon: ClipboardList },
  { label: 'Reports', to: '/reports', Icon: FileText },
  { label: 'Settings', to: '/settings', Icon: Settings },
]

export function AppLayout({
  title,
  subtitle,
  children,
  fitViewport = false,
  centered = false,
}: {
  title: string
  subtitle: string
  children: ReactNode
  fitViewport?: boolean
  centered?: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  function signOut() {
    sessionStorage.removeItem('dashboard-authenticated')
    navigate('/login')
  }

  return (
    <div
      className={`flex min-h-dvh bg-slate-50 text-slate-800${fitViewport ? ' h-dvh overflow-hidden' : ''}`}
    >
      <a
        className="fixed left-3 top-3 z-30 -translate-y-[160%] rounded-lg bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white focus:translate-y-0"
        href="#page-content"
      >
        Skip to content
      </a>
      <aside
        className={`sticky top-0 flex h-dvh shrink-0 flex-col border-r border-slate-200 bg-white px-[18px] py-7 transition-[width,padding] duration-300 ease-in-out max-[760px]:w-16 max-[760px]:px-2 max-[520px]:w-[54px] max-[520px]:px-[5px] max-[520px]:py-[18px]${collapsed ? ' w-[76px]' : ' w-[248px]'}`}
      >
        <div className="relative flex min-h-12 items-center">
          <div
            className={`flex min-h-12 min-w-0 items-center overflow-hidden text-slate-800 transition-[gap,padding] duration-300 ease-in-out${collapsed ? ' justify-center gap-0 px-0' : ' gap-3 px-2.5'}`}
          >
            <span className="grid size-[30px] shrink-0 place-items-center text-blue-600">
              <ShieldCheck className="size-7" />
            </span>
            <span
              className={`min-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold tracking-tight transition-[max-width,opacity] duration-200 ease-in-out max-[760px]:hidden${collapsed ? ' max-w-0 opacity-0' : ' max-w-[150px] opacity-100'}`}
              aria-hidden={collapsed}
            >
              Website Scanner
            </span>
          </div>
          <button
            className="absolute right-[-38px] top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:text-blue-600 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 max-[760px]:hidden"
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            aria-controls="primary-navigation"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={`size-[15px] transition-transform duration-300 ease-in-out${collapsed ? ' rotate-180' : ''}`}
            />
          </button>
        </div>
        <nav
          id="primary-navigation"
          className="mt-9 grid gap-2 max-[760px]:gap-[7px]"
          aria-label="Main navigation"
        >
          {navigation.map(({ label, to, Icon }) => (
            <NavLink
              className={({ isActive }) =>
                `flex min-h-11 w-full items-center rounded-lg text-left text-[15px] font-medium text-slate-600 no-underline transition-[background-color,color,gap,padding] duration-300 ease-in-out hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 max-[760px]:justify-center max-[760px]:gap-0 max-[760px]:px-0 max-[520px]:min-h-11${collapsed ? ' justify-center gap-0 px-0' : ' gap-3 px-3'}${isActive ? ' bg-blue-50 font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-600' : ''}`
              }
              key={to}
              to={to}
              end={to === '/dashboard'}
              title={label}
              aria-label={label}
            >
              <Icon className="size-[19px] shrink-0 max-[520px]:size-[18px]" aria-hidden="true" />
              <span
                className={`min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out max-[760px]:hidden${collapsed ? ' max-w-0 opacity-0' : ' max-w-[150px] opacity-100'}`}
                aria-hidden={collapsed}
              >
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto grid gap-2 border-t border-slate-100 pt-4">
          <button
            className={`flex min-h-10 w-full items-center rounded-lg text-left text-[15px] font-medium text-slate-600 transition-[background-color,color,gap,padding] duration-300 ease-in-out hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 max-[760px]:justify-center max-[760px]:gap-0 max-[760px]:px-0${collapsed ? ' justify-center gap-0 px-0' : ' gap-3 px-3'}`}
            type="button"
            onClick={signOut}
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut className="size-[19px] shrink-0" aria-hidden="true" />
            <span
              className={`min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-in-out max-[760px]:hidden${collapsed ? ' max-w-0 opacity-0' : ' max-w-[150px] opacity-100'}`}
              aria-hidden={collapsed}
            >
              Sign out
            </span>
          </button>
        </div>
      </aside>
      <main
        id="page-content"
        className={`min-w-0 flex-1${fitViewport ? ' h-dvh min-h-0 overflow-hidden' : ''}`}
      >
        <div
          className={`mx-auto w-full max-w-[1160px] px-3 py-5 sm:px-5 lg:px-6${fitViewport || centered ? ' flex min-h-dvh flex-col' : ''}`}
        >
          {!centered && (
            <header className="mb-3 flex shrink-0 items-end justify-between">
              <div>
                <h1 className="m-0 text-2xl font-semibold leading-[1.3] tracking-tight text-slate-800">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mb-0 mt-1.5 text-[15px] leading-relaxed text-slate-600">
                    {subtitle}
                  </p>
                )}
              </div>
            </header>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
