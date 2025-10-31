import { render, screen } from '@testing-library/react'

import { App } from './App.jsx'

describe('App', () => {
  it('renders key role cards', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: /academic lifecycle/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/Dean Workspace/i)).toBeInTheDocument()
    expect(screen.getByText(/Registrar Console/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /API Health Check/i })).toHaveAttribute(
      'href',
      'http://localhost:4000/health'
    )
  })
})
