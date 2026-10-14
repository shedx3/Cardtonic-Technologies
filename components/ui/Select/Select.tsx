import { useId, type SelectHTMLAttributes } from 'react'
import { cx } from '@/lib/cx'
import { Field } from '../Field'
import { Icon } from '../Icon'
import { SelectMenu, type SelectMenuProps } from './SelectMenu'
import styles from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
}

export interface NativeSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: string
  hideLabel?: boolean
  options: readonly SelectOption[]
  fieldClassName?: string
  menu?: undefined
}

/**
 * A native <select> by default, which gets the platform picker on mobile. Pass `menu` for a styled
 * popover panel where the design specifies the open state (the native popup can't be themed).
 */
export type SelectProps = NativeSelectProps | (SelectMenuProps & { menu: true })

export function Select(props: SelectProps) {
  if (props.menu) return <SelectMenu {...props} />
  return <NativeSelect {...props} />
}

function NativeSelect({
  label,
  hideLabel,
  options,
  fieldClassName,
  className,
  id,
  ...rest
}: NativeSelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  return (
    <Field label={label} htmlFor={selectId} hideLabel={hideLabel} className={fieldClassName}>
      <div className={styles.control}>
        <select id={selectId} className={cx(styles.select, className)} {...rest}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={16} className={styles.chevron} />
      </div>
    </Field>
  )
}
