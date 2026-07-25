import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renderiza el título del juego', () => {
    render(<App />)
    expect(screen.getByText('ROYAL CLOVER')).toBeInTheDocument()
  })
})
