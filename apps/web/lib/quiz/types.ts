// Format unique des questions — source : content/questions.json
// Règles contenu : CLAUDE.md §Contenu (aucun chiffre légal sans source)

export interface Question {
  id: string
  theme: string
  text: string
  options: { id: string; text: string }[]
  correctId: string
  explanation: string
  legal_ref: string | null // article de loi ou décret ; null = non sourcé
  status: 'draft' | 'published'
  needs_review?: boolean // chiffre non sourcé : à faire valider par un moniteur
}
