import { ZoomableMedia } from './ZoomableMedia'
import { ExplanationPanel } from './ExplanationPanel'
import { orderFor } from '../../lib/quiz/shuffle'
import { LetterBadge, type BadgeState } from './LetterBadge'
import { AnswerLine, type OptionState } from './AnswerLine'
import { KIND_LABEL } from './kind-label'
import { answerKind, isCorrect } from '../../lib/quiz/correction'
import { correctIds, correctLettersText, partSlots, partText, type Slot } from '../../lib/quiz/letters'
import type { OptionId, QuestionV2 } from '../../lib/quiz/types'

interface QuestionCardProps {
  question: QuestionV2
  index: number // position dans la série, à partir de 0
  total: number
  picked: OptionId[][] // ids cochés, une liste par partie — source unique de la sélection
  revealed: boolean // correction affichée
  onPick: (partIndex: number, id: OptionId) => void // même handler pour l'énoncé et les cases du bas
  onSubmit: () => void
  onNext: () => void
  variant?: 'quiz' | 'exam' | 'correction' // quiz : correction immédiate ; exam : sans correction ; correction : relecture
  onPrev?: () => void // correction : question précédente
  onClose?: () => void // correction : croix, retour au débrief
  orders?: OptionId[][] // ordre affiché des options par partie (mélange) ; défaut = ordre du JSON
}

const TILE = 48
const CORRECTION_BAR = 96

/** Hauteur de la barre du bas : libellé, grille A-D (2 colonnes), bouton Valider. */
function barHeight(variant: string, slotCount: number): number {
  if (variant === 'correction') return CORRECTION_BAR
  const rows = Math.max(1, Math.ceil(slotCount / 2))
  return 8 + 20 + 6 + rows * TILE + (rows - 1) * 8 + 10 + 48 + 8
}
const SHOW_DRAFT_BADGE = process.env.NODE_ENV !== 'production'

const ACTION = {
  flex: 1,
  minWidth: 0,
  minHeight: 48,
  padding: '0 12px',
  background: 'hsl(var(--primary))',
  color: 'hsl(var(--ink))',
  border: 'none',
  borderRadius: 'var(--radius)',
  fontSize: 16,
  fontWeight: 700,
  fontFamily: 'var(--font-sans)',
} as const

function slotState(slot: Slot, isPicked: boolean, isRight: boolean, revealed: boolean): OptionState {
  if (!revealed) return isPicked ? 'checked' : 'idle'
  if (isRight) return isPicked ? 'correct' : 'missed'
  return isPicked ? 'wrong' : 'disabled'
}

/**
 * Carte question unique : image (zoom), énoncé, OUI/NON ou choix, barre du bas (cases A-D, Valider n/total),
 * puis correction. Aucun état local : la sélection vient de `picked`.
 */
export function QuestionCard({
  question: q,
  index,
  total,
  picked,
  revealed: revealedProp,
  onPick,
  onSubmit,
  onNext,
  variant = 'quiz',
  onPrev,
  onClose,
  orders: ordersProp,
}: QuestionCardProps) {
  const revealed = variant === 'correction' ? true : variant === 'exam' ? false : revealedProp
  const orders = ordersProp ?? orderFor(q) // mélange déterministe (graine = id)
  const slots = partSlots(q, orders)
  const right = correctIds(q)
  const ready = q.parts.every((_, i) => (picked[i]?.length ?? 0) > 0)
  const ok = revealed && isCorrect(q, picked)
  const isLast = index + 1 >= total
  const bar = barHeight(variant, slots.reduce((n, s) => n + s.length, 0))

  return (
    <>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: `calc(${bar}px + env(safe-area-inset-bottom) + 16px)`,
        }}
      >
        {variant === 'correction' && onClose && (
          <div style={{ position: 'sticky', top: 0, zIndex: 1, display: 'flex', justifyContent: 'flex-end', padding: '4px 8px 0' }}>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer la correction"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '1px solid hsl(var(--sand))',
                background: 'hsl(var(--bg))',
                color: 'hsl(var(--ink))',
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>
        )}
        {q.media ? (
          <div style={{ padding: '4px 12px 0' }}>
            <ZoomableMedia media={q.media} />
          </div>
        ) : null}

        <div style={{ padding: '16px 20px 0' }}>
          {q.context && (
            <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35, color: 'hsl(var(--ink))', marginBottom: 8 }}>{q.context}</p>
          )}
          {SHOW_DRAFT_BADGE && q.status === 'draft' && (
            <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 700, color: 'hsl(var(--muted))' }}>Brouillon</div>
          )}

          {q.parts.map((part, pi) => {
            const isYesNo = part.kind === 'yesno'
            return (
              <div key={pi} style={{ marginBottom: pi < q.parts.length - 1 ? 24 : 0 }}>
                <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35, color: 'hsl(var(--ink))', marginBottom: 4 }}>
                  {partText(part)}
                </p>
                <div
                  style={
                    isYesNo
                      ? { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 20 }
                      : { display: 'flex', flexDirection: 'column' }
                  }
                >
                  {slots[pi].map((slot) => (
                    <AnswerLine
                      key={slot.id}
                      letter={slot.letter}
                      text={slot.label}
                      state={slotState(slot, picked[pi]?.includes(slot.id) ?? false, right[pi].includes(slot.id), revealed)}
                      mono={variant === 'exam'}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {revealed && (
            <div style={{ marginTop: 20 }}>
              <div
                role="status"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius)',
                  fontSize: 16,
                  fontWeight: 700,
                  background: ok ? 'hsl(var(--right-soft))' : 'hsl(var(--wrong-soft))',
                  color: ok ? 'hsl(var(--right))' : 'hsl(var(--wrong))',
                }}
              >
                <span aria-hidden="true">{ok ? '✓' : '✕'}</span>
                {ok ? 'Bonne réponse !' : 'Mauvaise réponse'}
              </div>
              <ExplanationPanel
                explanation={q.explanation}
                commonMistake={q.common_mistake}
                answersText={correctLettersText(q, orders)}
              />
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 430,
          margin: '0 auto',
          height: `calc(${bar}px + env(safe-area-inset-bottom))`,
          padding: '8px 12px',
          paddingBottom: 'calc(8px + env(safe-area-inset-bottom))',
          display: 'flex',
          flexDirection: variant === 'correction' ? 'row' : 'column',
          alignItems: variant === 'correction' ? 'flex-end' : 'stretch',
          gap: 10,
          background: 'hsl(var(--bg))',
          borderTop: '1px solid hsl(var(--sand))',
        }}
      >
        {variant !== 'correction' && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'hsl(var(--ink))', textAlign: 'center', marginBottom: 6 }}>{KIND_LABEL[answerKind(q)]}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {slots.flatMap((partSlotList, pi) =>
                partSlotList.map((slot) => {
                  const isPicked = picked[pi]?.includes(slot.id) ?? false
                  const state = slotState(slot, isPicked, right[pi].includes(slot.id), revealed)
                  const badge: BadgeState = state === 'checked' || state === 'correct' || state === 'missed' || state === 'wrong' ? state : 'idle'
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      data-slot={`${pi}:${slot.id}`}
                      aria-label={`Case ${slot.letter}`}
                      aria-pressed={revealed ? undefined : isPicked}
                      disabled={revealed}
                      onClick={() => onPick(pi, slot.id)}
                      style={{
                        height: TILE,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 14,
                        background: isPicked && !revealed ? 'hsl(var(--sand))' : 'hsl(var(--surface))',
                        border: isPicked && !revealed ? '2px solid hsl(var(--structure))' : '1.5px solid hsl(var(--sand))',
                        borderRadius: 'var(--radius)',
                        padding: 0,
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <LetterBadge letter={slot.letter} state={badge} mono={variant === 'exam'} />
                      <span
                        aria-hidden="true"
                        style={{
                          width: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 6,
                          border: '1.5px solid hsl(var(--muted))',
                          background: isPicked ? 'hsl(var(--structure))' : 'transparent',
                          color: '#fff',
                          fontSize: 16,
                          lineHeight: 1,
                        }}
                      >
                        {isPicked ? '✓' : ''}
                      </span>
                    </button>
                  )
                }),
              )}
            </div>
          </div>
        )}
        {variant === 'correction' ? (
          <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={onPrev} disabled={index === 0} style={{ ...ACTION, flex: 1, background: 'hsl(var(--surface))', border: '1.5px solid hsl(var(--sand))', opacity: index === 0 ? 0.5 : 1 }}>
              Précédent
            </button>
            <button type="button" onClick={onNext} style={{ ...ACTION, flex: 1 }}>
              {isLast ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={revealed ? onNext : onSubmit}
            disabled={!revealed && !ready}
            style={{ ...ACTION, flex: 'none', width: '100%', minHeight: 48, opacity: !revealed && !ready ? 0.5 : 1 }}
          >
            {revealed ? (isLast ? 'Résultats' : 'Suivant') : variant === 'exam' ? (isLast ? 'Terminer' : 'Valider') : `Valider (${index + 1}/${total})`}
          </button>
        )}
      </div>
    </>
  )
}
