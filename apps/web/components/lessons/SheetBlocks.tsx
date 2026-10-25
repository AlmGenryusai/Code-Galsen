import { BlockView } from './BlockView'
import type { Sheet } from '@/lib/lessons/types'

/** Les blocs d'une fiche, dans l'ordre. */
export function SheetBlocks({ sheet }: { sheet: Sheet }) {
  return (
    <>
      {sheet.blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </>
  )
}
