import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Pencil, Plus, Trash2, X } from 'lucide-react'
import { AppLayout } from '../../components/AppLayout'
import { DataTable, type DataTableColumn } from '../../components/DataTable'
import { ResourceState } from '../../components/ResourceState'
import { FormInput, FormSelect } from '../../components/FormControl'
import {
  dangerIconButtonClassName,
  iconButtonClassName,
  panelClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  textLinkClassName,
} from '../../components/ui'
import { useApiResource } from '../../hooks/useApiResource'
import { mockApi, type Environment, type Target } from '../../data/mockApi'
import { formatDateTime } from '../../utils/format'

type TargetFormValues = {
  name: string
  url: string
  environment: Environment
  authenticated: boolean
  username: string
  password: string
}

const emptyTargetForm: TargetFormValues = {
  name: '',
  url: '',
  environment: 'staging',
  authenticated: false,
  username: '',
  password: '',
}

function TargetDialog({
  target,
  onClose,
  onSave,
}: {
  target: Target | null
  onClose: () => void
  onSave: (values: TargetFormValues) => Promise<void>
}) {
  const [values, setValues] = useState<TargetFormValues>(() =>
    target
      ? {
          name: target.name,
          url: target.url,
          environment: target.environment,
          authenticated: target.authenticated,
          username: '',
          password: '',
        }
      : emptyTargetForm,
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSave(values)
      onClose()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save target.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 grid overflow-auto place-items-center bg-slate-900/35 p-6 max-[520px]:items-start max-[520px]:p-3"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="w-full max-w-[520px] rounded-xl border border-slate-200 bg-white p-[22px] shadow-[0_18px_50px_rgba(15,23,42,0.18)] max-[520px]:p-[17px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="target-dialog-title"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="m-0 text-[15px] font-semibold text-slate-700" id="target-dialog-title">
              {target ? 'Edit target' : 'Add target'}
            </h2>
            <p className="mb-0 mt-1 text-sm text-slate-600">
              Only add websites or APIs you are authorized to test.
            </p>
          </div>
          <button
            className={`${iconButtonClassName} bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800`}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="size-[18px]" aria-hidden="true" />
          </button>
        </div>
        <form className="mt-5 grid gap-[15px]" onSubmit={(event) => void submit(event)}>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-600">Display name</span>
            <FormInput
              required
              maxLength={80}
              value={values.name}
              onChange={(event) => setValues({ ...values, name: event.target.value })}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-600">URL</span>
            <FormInput
              required
              type="url"
              placeholder="https://example.com"
              value={values.url}
              onChange={(event) => setValues({ ...values, url: event.target.value })}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-600">Environment</span>
            <FormSelect
              value={values.environment}
              onChange={(event) =>
                setValues({ ...values, environment: event.target.value as Environment })
              }
            >
              <option value="staging">Staging</option>
              <option value="production">Production</option>
              <option value="dev">Development</option>
            </FormSelect>
          </label>
          <fieldset className="m-0 min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <legend className="sr-only">Authentication</legend>
            <label className="flex min-h-6 cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <input
                className="size-4 shrink-0 accent-blue-600"
                type="checkbox"
                checked={values.authenticated}
                onChange={(event) => setValues({ ...values, authenticated: event.target.checked })}
              />
              <span className="font-medium">Use authentication</span>
              <span className="ml-auto text-xs text-slate-500">Optional</span>
            </label>
            {values.authenticated && (
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 max-[520px]:grid-cols-1">
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-slate-600">Username</span>
                  <FormInput
                    autoComplete="username"
                    required={!target || !target.authenticated}
                    placeholder={target?.authenticated ? 'Leave blank to keep current' : ''}
                    value={values.username}
                    onChange={(event) => setValues({ ...values, username: event.target.value })}
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-slate-600">Password</span>
                  <span className="relative block">
                    <FormInput
                      className="w-full pr-11"
                      autoComplete="new-password"
                      required={!target || !target.authenticated}
                      type={passwordVisible ? 'text' : 'password'}
                      placeholder={target?.authenticated ? 'Leave blank to keep current' : ''}
                      value={values.password}
                      onChange={(event) => setValues({ ...values, password: event.target.value })}
                    />
                    <button
                      className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600"
                      type="button"
                      onClick={() => setPasswordVisible((visible) => !visible)}
                      aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                      aria-pressed={passwordVisible}
                    >
                      {passwordVisible ? (
                        <EyeOff className="size-[18px]" aria-hidden="true" />
                      ) : (
                        <Eye className="size-[18px]" aria-hidden="true" />
                      )}
                    </button>
                  </span>
                </label>
              </div>
            )}
          </fieldset>
          {error && (
            <p className="my-2.5 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <div className="mt-1 flex justify-end gap-2">
            <button className={secondaryButtonClassName} type="button" onClick={onClose}>
              Cancel
            </button>
            <button className={primaryButtonClassName} type="submit" disabled={saving}>
              {saving ? 'Saving…' : target ? 'Save changes' : 'Add target'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export function TargetsPage() {
  const resource = useApiResource(mockApi.getTargets)
  const [dialogTarget, setDialogTarget] = useState<Target | null | undefined>(undefined)
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)

  async function saveTarget(values: TargetFormValues) {
    const url = new URL(values.url)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Enter an HTTP or HTTPS URL.')
    }
    const input = {
      name: values.name.trim(),
      url: url.toString().replace(/\/$/, ''),
      environment: values.environment,
      authenticated: values.authenticated,
      credentials: values.authenticated
        ? { username: values.username, password: values.password }
        : undefined,
    }
    if (dialogTarget) await mockApi.updateTarget(dialogTarget.id, input)
    else await mockApi.addTarget(input)
    resource.reload()
  }

  async function removeTarget(target: Target) {
    if (!window.confirm(`Remove ${target.name}?`)) return
    setActionError('')
    setBusy(true)
    try {
      await mockApi.removeTarget(target.id)
      resource.reload()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to remove target.')
    } finally {
      setBusy(false)
    }
  }

  const columns: DataTableColumn<Target>[] = [
    {
      key: 'name',
      header: 'Name / URL',
      widthClassName: 'w-[31%] max-[760px]:w-[27%]',
      renderCell: (target) => (
        <>
          <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-slate-700">
            {target.name}
          </span>
          <span className="mt-[3px] block overflow-hidden text-ellipsis whitespace-nowrap text-sm text-slate-500">
            {target.url}
          </span>
        </>
      ),
      titleForRow: (target) => `${target.name} — ${target.url}`,
    },
    {
      key: 'environment',
      header: 'Environment',
      widthClassName: 'w-[15%] max-[760px]:w-[13%]',
      renderCell: (target) => <span className="capitalize">{target.environment}</span>,
    },
    {
      key: 'last-scanned',
      header: 'Last scanned',
      widthClassName: 'w-[24%] max-[760px]:w-[22%]',
      renderCell: (target) => formatDateTime(target.lastScannedAt),
    },
    {
      key: 'findings',
      header: 'Open findings',
      widthClassName: 'w-[16%]',
      renderCell: (target) => (
        <Link className={textLinkClassName} to={`/findings?targetId=${target.id}`}>
          {target.openFindings}
        </Link>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      widthClassName: 'w-[14%] max-[760px]:w-[22%]',
      className: 'max-[760px]:px-1',
      renderCell: (target) => (
        <span className="inline-flex items-center gap-[3px]">
          <button
            className={iconButtonClassName}
            type="button"
            title={`Edit ${target.name}`}
            aria-label={`Edit ${target.name}`}
            onClick={() => setDialogTarget(target)}
          >
            <Pencil className="size-[15px]" />
          </button>
          <button
            className={dangerIconButtonClassName}
            type="button"
            title={`Remove ${target.name}`}
            aria-label={`Remove ${target.name}`}
            disabled={busy}
            onClick={() => void removeTarget(target)}
          >
            <Trash2 className="size-[15px]" />
          </button>
        </span>
      ),
    },
  ]

  return (
    <AppLayout title="Targets" subtitle="Manage the websites and services you monitor.">
      <section className={`mt-4 p-4 sm:p-5 ${panelClassName}`}>
        <div className="mb-3 flex items-center justify-between gap-4 max-[520px]:items-start max-[520px]:flex-col">
          <div>
            <h2 className="m-0 text-[15px] font-semibold text-slate-700">Monitored targets</h2>
            <p className="mb-0 mt-1 text-sm text-slate-600">Websites and APIs currently in scope</p>
          </div>
          <button
            className={primaryButtonClassName}
            type="button"
            onClick={() => setDialogTarget(null)}
          >
            <Plus className="size-[15px]" /> Add target
          </button>
        </div>
        {actionError && (
          <p className="my-2.5 text-sm text-red-700" role="alert">
            {actionError}
          </p>
        )}
        {resource.data && !resource.data.length && resource.status === 'success' ? (
          <div className="grid justify-items-center px-4 py-7 text-center text-sm text-slate-600">
            <p className="mb-3">No targets added yet.</p>
            <button
              className={secondaryButtonClassName}
              type="button"
              onClick={() => setDialogTarget(null)}
            >
              Add your first target
            </button>
          </div>
        ) : (
          <>
            <ResourceState
              loading={resource.status === 'loading'}
              error={resource.error}
              empty={false}
              onRetry={resource.reload}
            />
            {resource.data && (
              <DataTable
                ariaLabel="Targets"
                columns={columns}
                rows={resource.data}
                getRowKey={(target) => target.id}
                minWidth={900}
              />
            )}
          </>
        )}
      </section>
      {dialogTarget !== undefined && (
        <TargetDialog
          target={dialogTarget}
          onClose={() => setDialogTarget(undefined)}
          onSave={saveTarget}
        />
      )}
    </AppLayout>
  )
}
