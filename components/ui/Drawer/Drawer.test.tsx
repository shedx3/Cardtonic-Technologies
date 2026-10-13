import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Drawer } from './Drawer'

const setup = (onClose = vi.fn()) => {
  render(
    <>
      <button>Opener</button>
      <Drawer open title="Transaction details" onClose={onClose}>
        <button>Inside</button>
      </Drawer>
    </>
  )
  return onClose
}

describe('Drawer', () => {
  it('is an accessible modal dialog', () => {
    setup()
    expect(screen.getByRole('dialog', { name: 'Transaction details' })).toHaveAttribute('aria-modal', 'true')
  })

  it('closes on Escape and via the close button', async () => {
    const onClose = setup()
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('does not close when clicking inside the panel', async () => {
    const onClose = setup()
    await userEvent.click(screen.getByText('Inside'))
    await userEvent.click(screen.getByRole('heading', { name: 'Transaction details' }))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes when clicking the overlay', async () => {
    const onClose = setup()
    await userEvent.click(screen.getByRole('dialog').parentElement!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('keeps Tab focus inside the dialog', async () => {
    setup()
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab()
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement)
  })

  it('restores focus to the opener on close', () => {
    const { rerender } = render(
      <Drawer open={false} title="T" onClose={() => {}}>
        x
      </Drawer>
    )
    const opener = document.createElement('button')
    document.body.append(opener)
    opener.focus()
    rerender(
      <Drawer open title="T" onClose={() => {}}>
        x
      </Drawer>
    )
    rerender(
      <Drawer open={false} title="T" onClose={() => {}}>
        x
      </Drawer>
    )
    expect(opener).toHaveFocus()
    opener.remove()
  })
})
