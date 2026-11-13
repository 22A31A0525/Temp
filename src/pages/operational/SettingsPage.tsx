import { useState, type FormEvent } from 'react'
import { Moon, Sun } from 'lucide-react'
import { AppLayout } from '../../components/AppLayout'
import { FormInput } from '../../components/FormControl'
import { panelClassName, primaryButtonClassName } from '../../components/ui'
import { applyTheme, getSavedTheme, type Theme } from '../../utils/preferences'

const defaultProfile = {
  name: 'Security Analyst',
  email: 'analyst@example.com',
}

export function SettingsPage() {
  const [theme, setTheme] = useState<Theme>(getSavedTheme)
  const [name, setName] = useState(
    () => localStorage.getItem('dashboard-profile-name') ?? defaultProfile.name,
  )
  const [email, setEmail] = useState(
    () => localStorage.getItem('dashboard-profile-email') ?? defaultProfile.email,
  )
  const [saved, setSaved] = useState(false)

  function changeTheme(nextTheme: Theme) {
    applyTheme(nextTheme)
    setTheme(nextTheme)
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    localStorage.setItem('dashboard-profile-name', name.trim())
    localStorage.setItem('dashboard-profile-email', email.trim())
    setName(name.trim())
    setEmail(email.trim())
    setSaved(true)
  }

  return (
    <AppLayout title="Settings" subtitle="">
      <div className="mt-4 grid max-w-[760px] gap-4">
        <section className={`p-4 sm:p-5 ${panelClassName}`} aria-labelledby="profile-title">
          <h2 className="m-0 text-[15px] font-semibold text-slate-800" id="profile-title">
            Profile
          </h2>
          <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
            <label className="grid min-w-0 gap-1.5 text-sm font-medium text-slate-600">
              <span>Name</span>
              <FormInput
                autoComplete="name"
                required
                maxLength={80}
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setSaved(false)
                }}
              />
            </label>
            <label className="grid min-w-0 gap-1.5 text-sm font-medium text-slate-600">
              <span>Email</span>
              <FormInput
                autoComplete="email"
                required
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setSaved(false)
                }}
              />
            </label>
            <div className="flex items-center gap-3 sm:col-span-2">
              <button className={primaryButtonClassName} type="submit">
                Save profile
              </button>
              {saved && (
                <p className="m-0 text-sm text-green-700" role="status">
                  Profile saved.
                </p>
              )}
            </div>
          </form>
        </section>

        <section className={`p-4 sm:p-5 ${panelClassName}`} aria-labelledby="appearance-title">
          <h2 className="m-0 text-[15px] font-semibold text-slate-800" id="appearance-title">
            Appearance
          </h2>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="m-0 text-sm font-medium text-slate-700">Color theme</p>
              <p className="mb-0 mt-1 text-sm text-slate-500">Saved on this device.</p>
            </div>
            <div
              className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1"
              role="group"
              aria-label="Color theme"
            >
              <button
                className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600${theme === 'light' ? ' bg-white text-slate-800 shadow-sm' : ' text-slate-600 hover:text-slate-800'}`}
                type="button"
                aria-pressed={theme === 'light'}
                onClick={() => changeTheme('light')}
              >
                <Sun className="size-4" aria-hidden="true" />
                Light
              </button>
              <button
                className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600${theme === 'dark' ? ' bg-slate-200 text-slate-800 shadow-sm' : ' text-slate-600 hover:text-slate-800'}`}
                type="button"
                aria-pressed={theme === 'dark'}
                onClick={() => changeTheme('dark')}
              >
                <Moon className="size-4" aria-hidden="true" />
                Dark
              </button>
            </div>
          </div>
        </section>

        <section className={`p-4 sm:p-5 ${panelClassName}`} aria-labelledby="api-key-title">
          <h2 className="m-0 text-[15px] font-semibold text-slate-800" id="api-key-title">
            API key
          </h2>
          <FormInput
            className="mt-4"
            id="api-key"
            type="password"
            placeholder="Not configured"
            aria-label="API key"
            disabled
          />
        </section>
      </div>
    </AppLayout>
  )
}
