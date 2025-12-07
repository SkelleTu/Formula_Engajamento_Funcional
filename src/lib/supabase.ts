import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export type Visitor = {
  id?: number
  visitor_id: string
  first_visit?: string
  last_visit?: string
  ip_address?: string
  country?: string
  city?: string
  region?: string
  user_agent?: string
  device_type?: string
  browser?: string
  os?: string
  referrer?: string
  landing_page?: string
  total_visits?: number
  total_time_spent?: number
  age_range?: string
  gender?: string
  interests?: string
  occupation?: string
  education_level?: string
}

export type PageView = {
  id?: number
  visitor_id: string
  page_url?: string
  page_title?: string
  session_id?: string
  time_spent?: number
  scroll_depth?: number
  viewed_at?: string
}

export type Event = {
  id?: number
  visitor_id: string
  event_type: string
  event_data?: Record<string, unknown>
  page_url?: string
  session_id?: string
  timestamp?: string
}

export type Registration = {
  id?: number
  visitor_id: string
  email?: string
  name?: string
  phone?: string
  registration_data?: Record<string, unknown>
  registered_at?: string
}

export type VideoConfig = {
  id?: number
  video_url: string
  video_type: string
  button_delay_seconds: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type Admin = {
  id?: number
  username: string
  password_hash: string
  requires_password_change?: boolean
  created_at?: string
}

export type VisitorSignal = {
  id?: number
  visitor_id: string
  fingerprint_id?: string
  timezone?: string
  language?: string
  languages?: string[]
  screen_resolution?: string
  color_depth?: number
  hardware_concurrency?: number
  device_memory?: number
  platform?: string
  touch_support?: boolean
  cookie_enabled?: boolean
  do_not_track?: string
  hour_of_day?: number
  day_of_week?: number
  is_weekday?: boolean
  is_business_hours?: boolean
  referrer?: string
  landing_page?: string
  created_at?: string
}

export type InferredDemographic = {
  id?: number
  visitor_id: string
  age_range?: string
  gender?: string
  occupation?: string
  education_level?: string
  interests?: string
  confidence_score?: number
  algorithm_version?: string
  inferred_at?: string
}
