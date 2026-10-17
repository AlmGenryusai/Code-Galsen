import { describe, it, expect } from 'vitest'
import { formatCode, isValidCode } from './code'

describe('formatCode', () => {
  it.each([
    ['gals7k3p9qxm', 'GALS-7K3P-9QXM'],
    ['GALS-7K3P-9QXM', 'GALS-7K3P-9QXM'],
    [' gals 7k3p 9qxm ', 'GALS-7K3P-9QXM'],
    ['gals_7k3p.9qxm', 'GALS-7K3P-9QXM'],
    ['GALS-7K3P-9QXM-EXTRA', 'GALS-7K3P-9QXM'],
    ['ga', 'GA'],
    ['gals', 'GALS'],
    ['gals7', 'GALS-7'],
    ['GALS-', 'GALS'],
    ['gals7k3p9', 'GALS-7K3P-9'],
    ['', ''],
  ])('%j → %j', (input, expected) => {
    expect(formatCode(input)).toBe(expected)
  })
})

describe('isValidCode', () => {
  it('accepte le format GALS-XXXX-XXXX', () => {
    expect(isValidCode('GALS-7K3P-9QXM')).toBe(true)
  })

  it.each(['GALS-7K3P-9QX', 'GALT-7K3P-9QXM', 'gals-7k3p-9qxm', 'GALS7K3P9QXM', 'GALS-7K3P-9QX!', ''])(
    'refuse %j',
    (code) => {
      expect(isValidCode(code)).toBe(false)
    },
  )

  it('valide tout code complet sorti de formatCode', () => {
    expect(isValidCode(formatCode('gals7k3p9qxm'))).toBe(true)
  })
})
