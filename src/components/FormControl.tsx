import type { ComponentPropsWithoutRef } from 'react'

const formControlClassName =
  'min-h-[42px] w-full min-w-0 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-60'

function getClassName(className?: string) {
  return className ? `${formControlClassName} ${className}` : formControlClassName
}

export function FormInput({ className, ...props }: ComponentPropsWithoutRef<'input'>) {
  return <input {...props} className={getClassName(className)} />
}

export function FormSelect({ className, ...props }: ComponentPropsWithoutRef<'select'>) {
  return <select {...props} className={getClassName(className)} />
}

export function FormTextarea({ className, ...props }: ComponentPropsWithoutRef<'textarea'>) {
  return <textarea {...props} className={getClassName(className)} />
}
