import data from '../../content/panneaux.json'

export interface SignFamily {
  id: string
  title: string
  free?: boolean // visible sans licence
  items: string[] // ids de SIGNS
}

export const FAMILIES = data.families as SignFamily[]
