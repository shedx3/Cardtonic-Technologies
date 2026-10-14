'use client'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { cx } from '@/lib/cx'
import { Field } from '../Field'
import { Icon } from '../Icon'
import type { SelectOption } from './Select'
import styles from './Select.module.css'

export interface SelectMenuProps {
  label: string
  hideLabel?: boolean
  options: readonly SelectOption[]
  value: string
  onValueChange: (value: string) => void
  fieldClassName?: string
}

/** Select's `menu` mode: a listbox with a styled popover, for where the design specifies the open state. */
export function SelectMenu({
  label,
  hideLabel,
  options,
  value,
  onValueChange,
  fieldClassName,
}: SelectMenuProps) {
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  )
  const [active, setActive] = useState(selectedIndex)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const openList = () => {
    setActive(selectedIndex)
    setOpen(true)
  }
  const choose = (index: number) => {
    onValueChange(options[index].value)
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault()
        if (!open) return openList()
        const step = e.key === 'ArrowDown' ? 1 : -1
        setActive((i) => (i + step + options.length) % options.length)
        break
      }
      case 'Home':
      case 'End':
        if (open) {
          e.preventDefault()
          setActive(e.key === 'Home' ? 0 : options.length - 1)
        }
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (open) choose(active)
        else openList()
        break
      case 'Escape':
        if (open) {
          e.preventDefault()
          setOpen(false)
        }
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <Field label={label} htmlFor={`${id}-button`} hideLabel={hideLabel} className={fieldClassName}>
      <div className={styles.control} ref={rootRef}>
        <button
          id={`${id}-button`}
          type="button"
          className={styles.menuButton}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={onKeyDown}
        >
          <span>{options[selectedIndex]?.label}</span>
          <Icon name="chevron-down" size={16} className={styles.menuChevron} />
        </button>
        {open && (
          <ul id={`${id}-list`} role="listbox" aria-label={label} className={styles.menuList}>
            {options.map((option, i) => (
              <li
                key={option.value}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={option.value === value}
                className={cx(
                  styles.menuOption,
                  option.value === value && styles.menuSelected,
                  i === active && styles.menuActive
                )}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Field>
  )
}
