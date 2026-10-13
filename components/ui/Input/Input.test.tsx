import { render, screen } from '@testing-library/react'
import { Input } from './Input'

describe('Input', () => {
  it('associates the label with the control', () => {
    render(<Input label="Amount" />)
    expect(screen.getByLabelText('Amount')).toBeInTheDocument()
  })

  it('describes the control with its error', () => {
    render(<Input label="Amount" error="Too small" />)
    expect(screen.getByLabelText('Amount')).toHaveAccessibleDescription('Too small')
  })
})
