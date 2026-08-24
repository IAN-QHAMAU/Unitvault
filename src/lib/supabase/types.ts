export type ResourceType = 'Notes' | 'Past Paper'

export interface University {
  id: string
  name: string
  short_name: string
  created_at: string
}

export interface Unit {
  id: string
  university_id: string
  code: string
  name: string
  year: number | null
  semester: number | null
  department: string | null
  created_at: string
  updated_at: string
  university?: University
}

export interface Profile {
  id: string
  display_name: string | null
  role: 'student' | 'admin'
  created_at: string
  updated_at: string
}

export interface Resource {
  id: string
  unit_id: string
  title: string
  description: string | null
  file_url: string
  file_path: string
  resource_type: ResourceType
  year: number | null
  semester: number | null
  uploaded_by: string | null
  created_at: string
  updated_at: string
  unit?: Unit
  profile?: Profile
}

export interface SavedResource {
  id: string
  user_id: string
  resource_id: string
  saved_at: string
  resource?: Resource
}

export interface Database {
  public: {
    Tables: {
      universities: {
        Row: University
        Insert: Omit<University, 'id' | 'created_at'>
        Update: Partial<Omit<University, 'id' | 'created_at'>>
      }
      units: {
        Row: Unit
        Insert: Omit<Unit, 'id' | 'created_at' | 'updated_at' | 'university'>
        Update: Partial<Omit<Unit, 'id' | 'created_at' | 'updated_at' | 'university'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'created_at' | 'updated_at'>>
      }
      resources: {
        Row: Resource
        Insert: Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'unit' | 'profile'>
        Update: Partial<Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'unit' | 'profile'>>
      }
      saved_resources: {
        Row: SavedResource
        Insert: Omit<SavedResource, 'id' | 'saved_at'>
        Update: Partial<Omit<SavedResource, 'id' | 'saved_at'>>
      }
    }
  }
}
