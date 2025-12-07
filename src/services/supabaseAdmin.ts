import { supabase } from '../lib/supabase';

const SESSION_KEY = 'admin_session';

interface AdminSession {
  username: string;
  id: number;
  expiresAt: number;
}

export const adminService = {
  async login(username: string, password: string): Promise<{ success: boolean; requiresPasswordChange?: boolean; error?: string }> {
    try {
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !admin) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      const bcryptjs = await import('bcryptjs');
      const validPassword = await bcryptjs.compare(password, admin.password_hash);

      if (!validPassword) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      const session: AdminSession = {
        username: admin.username,
        id: admin.id,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      return { 
        success: true, 
        requiresPasswordChange: admin.requires_password_change 
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro no servidor' };
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const session = this.getSession();
      if (!session) {
        return { success: false, error: 'Não autenticado' };
      }

      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', session.username)
        .single();

      if (error || !admin) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      const bcryptjs = await import('bcryptjs');
      const validPassword = await bcryptjs.compare(currentPassword, admin.password_hash);

      if (!validPassword) {
        return { success: false, error: 'Senha atual incorreta' };
      }

      const newPasswordHash = await bcryptjs.hash(newPassword, 10);

      const { error: updateError } = await supabase
        .from('admins')
        .update({ 
          password_hash: newPasswordHash, 
          requires_password_change: false 
        })
        .eq('username', session.username);

      if (updateError) {
        return { success: false, error: 'Erro ao atualizar senha' };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao trocar senha:', error);
      return { success: false, error: 'Erro no servidor' };
    }
  },

  getSession(): AdminSession | null {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (!sessionStr) return null;

      const session: AdminSession = JSON.parse(sessionStr);
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }

      return session;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  async getStats() {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [visitorsRes, eventsRes, registrationsRes, pageViewsRes, visitors24hRes] = await Promise.all([
        supabase.from('visitors').select('id', { count: 'exact' }),
        supabase.from('events').select('id', { count: 'exact' }),
        supabase.from('registrations').select('id', { count: 'exact' }),
        supabase.from('page_views').select('id', { count: 'exact' }),
        supabase.from('visitors').select('id', { count: 'exact' }).gte('last_visit', yesterday.toISOString())
      ]);

      return {
        totalVisitors: visitorsRes.count || 0,
        totalEvents: eventsRes.count || 0,
        totalRegistrations: registrationsRes.count || 0,
        totalPageViews: pageViewsRes.count || 0,
        visitorsLast24h: visitors24hRes.count || 0
      };
    } catch (error) {
      console.error('Erro ao buscar stats:', error);
      return {
        totalVisitors: 0,
        totalEvents: 0,
        totalRegistrations: 0,
        totalPageViews: 0,
        visitorsLast24h: 0
      };
    }
  },

  async getVisitors(limit = 100) {
    try {
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('last_visit', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { visitors: data || [] };
    } catch (error) {
      console.error('Erro ao buscar visitantes:', error);
      return { visitors: [] };
    }
  },

  async getRegistrations(limit = 100) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          visitors (
            ip_address,
            city,
            country,
            device_type
          )
        `)
        .order('registered_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const registrations = (data || []).map((reg: any) => ({
        ...reg,
        ip_address: reg.visitors?.ip_address,
        city: reg.visitors?.city,
        country: reg.visitors?.country,
        device_type: reg.visitors?.device_type
      }));

      return { registrations };
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      return { registrations: [] };
    }
  },

  async getDemographics() {
    try {
      const { data: visitors, error } = await supabase
        .from('visitors')
        .select('age_range, gender, occupation, education_level, interests')
        .not('age_range', 'is', null);

      if (error) throw error;

      const ageDistribution: Record<string, number> = {};
      const genderDistribution: Record<string, number> = {};
      const occupationDistribution: Record<string, number> = {};
      const educationDistribution: Record<string, number> = {};
      const interestsCount: Record<string, number> = {};

      (visitors || []).forEach((v: any) => {
        if (v.age_range) ageDistribution[v.age_range] = (ageDistribution[v.age_range] || 0) + 1;
        if (v.gender) genderDistribution[v.gender] = (genderDistribution[v.gender] || 0) + 1;
        if (v.occupation) occupationDistribution[v.occupation] = (occupationDistribution[v.occupation] || 0) + 1;
        if (v.education_level) educationDistribution[v.education_level] = (educationDistribution[v.education_level] || 0) + 1;
        if (v.interests) {
          v.interests.split(',').forEach((i: string) => {
            const interest = i.trim();
            if (interest) interestsCount[interest] = (interestsCount[interest] || 0) + 1;
          });
        }
      });

      return {
        ageDistribution: Object.entries(ageDistribution).map(([age, count]) => ({ age, count })),
        genderDistribution: Object.entries(genderDistribution).map(([gender, count]) => ({ gender, count })),
        occupationDistribution: Object.entries(occupationDistribution).map(([occupation, count]) => ({ occupation, count })),
        educationDistribution: Object.entries(educationDistribution).map(([education, count]) => ({ education, count })),
        topInterests: Object.entries(interestsCount).map(([interest, count]) => ({ interest, count })),
        averageConfidence: { age_range: 0.5, gender: 0.5, occupation: 0.5, education_level: 0.5, interests: 0.5 },
        totalProfiles: visitors?.length || 0
      };
    } catch (error) {
      console.error('Erro ao buscar demographics:', error);
      return {
        ageDistribution: [],
        genderDistribution: [],
        occupationDistribution: [],
        educationDistribution: [],
        topInterests: [],
        averageConfidence: { age_range: 0, gender: 0, occupation: 0, education_level: 0, interests: 0 },
        totalProfiles: 0
      };
    }
  },

  async getVideoConfig() {
    try {
      const { data, error } = await supabase
        .from('video_config')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { video: data };
    } catch (error) {
      console.error('Erro ao buscar video config:', error);
      return { video: null };
    }
  },

  async saveVideoConfig(config: { video_url: string; video_type: string; button_delay_seconds: number }) {
    try {
      await supabase
        .from('video_config')
        .update({ is_active: false })
        .eq('is_active', true);

      const { data, error } = await supabase
        .from('video_config')
        .insert({
          video_url: config.video_url,
          video_type: config.video_type,
          button_delay_seconds: config.button_delay_seconds,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, video: data };
    } catch (error) {
      console.error('Erro ao salvar video config:', error);
      return { success: false, error: 'Erro ao salvar configuração' };
    }
  },

  async getVisitorDetails(visitorId: string) {
    try {
      const [visitorRes, eventsRes, pageViewsRes, signalsRes, demographicsRes] = await Promise.all([
        supabase.from('visitors').select('*').eq('visitor_id', visitorId).single(),
        supabase.from('events').select('*').eq('visitor_id', visitorId).order('timestamp', { ascending: false }).limit(50),
        supabase.from('page_views').select('*').eq('visitor_id', visitorId).order('viewed_at', { ascending: false }).limit(50),
        supabase.from('visitor_signals').select('*').eq('visitor_id', visitorId).order('created_at', { ascending: false }).limit(1),
        supabase.from('inferred_demographics').select('*').eq('visitor_id', visitorId).order('inferred_at', { ascending: false }).limit(1)
      ]);

      return {
        visitor: visitorRes.data,
        events: eventsRes.data || [],
        pageViews: pageViewsRes.data || [],
        signals: signalsRes.data?.[0] || null,
        demographics: demographicsRes.data?.[0] || null
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes do visitante:', error);
      return null;
    }
  },

  async exportRegistrations() {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          visitors (
            ip_address,
            city,
            country,
            device_type,
            browser,
            os
          )
        `)
        .order('registered_at', { ascending: false });

      if (error) throw error;
      return { registrations: data || [] };
    } catch (error) {
      console.error('Erro ao exportar registros:', error);
      return { registrations: [] };
    }
  },

  async createAdmin(username: string, password: string) {
    try {
      const { data: existing } = await supabase
        .from('admins')
        .select('id')
        .eq('username', username)
        .single();

      if (existing) {
        return { success: false, error: 'Admin já existe' };
      }

      const bcryptjs = await import('bcryptjs');
      const hashedPassword = await bcryptjs.hash(password, 10);

      const { error } = await supabase
        .from('admins')
        .insert({
          username,
          password_hash: hashedPassword,
          requires_password_change: true
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erro ao criar admin:', error);
      return { success: false, error: 'Erro ao criar admin' };
    }
  }
};
