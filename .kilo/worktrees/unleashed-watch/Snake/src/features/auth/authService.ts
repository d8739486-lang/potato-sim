import { supabase, mapProfile } from '../../core/supabase';
import type { Profile } from '../../core/supabase';
import { useAuthStore } from './useAuthStore';
import { toast } from 'sonner';

/** Получить текущую сессию и профиль при старте приложения */
export async function initAuth(): Promise<void> {
  const { setProfile, setLoading } = useAuthStore.getState();
  setLoading(true);

  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    await loadProfile(session.user.id);
  }

  setLoading(false);

  // Слушаем изменения сессии (logout, login в другой вкладке)
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      await loadProfile(session.user.id);
    } else {
      setProfile(null);
    }
  });
}

async function loadProfile(userId: string): Promise<void> {
  const { setProfile } = useAuthStore.getState();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    setProfile(null);
    return;
  }

  // Проверяем бан
  const banResult = await checkActiveBan(userId);
  if (banResult) {
    const until = banResult.banned_until
      ? `до ${new Date(banResult.banned_until).toLocaleDateString('ru-RU')}`
      : 'навсегда';
    toast.error(`Аккаунт заблокирован ${until}. Причина: ${banResult.reason}`, {
      duration: 10000,
    });
    await supabase.auth.signOut();
    setProfile(null);
    return;
  }

  setProfile(mapProfile(data as Record<string, unknown>));
}

async function checkActiveBan(userId: string) {
  const { data } = await supabase
    .from('bans')
    .select('reason, banned_until')
    .eq('user_id', userId)
    .or(`banned_until.is.null,banned_until.gt.${new Date().toISOString()}`)
    .limit(1)
    .maybeSingle();

  return data;
}

export interface SignUpData {
  password: string;
  username: string;
  honeypot: string; // Должен быть пустым
}

// Генерируем технический email из никнейма (скрыт от пользователя)
function usernameToEmail(username: string): string {
  return `${username.toLowerCase()}@neon-snake.game`;
}

export async function signUp({ password, username, honeypot }: SignUpData): Promise<{ error?: string }> {
  // Honeypot: если заполнен — бот
  if (honeypot.trim() !== '') {
    return { error: 'Ошибка валидации.' };
  }

  // Проверяем уникальность никнейма
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existing) {
    return { error: 'Этот никнейм уже занят. Придумайте другой.' };
  }

  const { error } = await supabase.auth.signUp({
    email: usernameToEmail(username),
    password,
    options: {
      data: { username },
    },
  });

  if (error) return { error: error.message };
  return {};
}

export async function signIn(username: string, password: string): Promise<{ error?: string }> {
  const { error, data } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });
  if (error) {
    console.error('Supabase Login Error:', error);
    return { error: `Ошибка входа: ${error.message}` };
  }
  return {};
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function changePassword(newPassword: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return {};
}

export async function deleteAccount(): Promise<{ error?: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'Нет сессии' };

  // Удаляем профиль (auth.users удалится каскадно через RLS-политику)
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', session.user.id);

  if (error) return { error: error.message };

  // Затем удаляем самого пользователя
  await supabase.rpc('delete_user');
  await supabase.auth.signOut();
  return {};
}

export async function updateStats(delta: {
  deaths?: number;
  wins?: number;
  apples?: number;
}): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const userId = session.user.id;

  // Получаем текущие значения
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_deaths, total_wins, total_apples_eaten')
    .eq('id', userId)
    .single();

  if (!profile) return;

  const updates: Record<string, number> = {};
  if (delta.deaths) updates.total_deaths = (profile.total_deaths as number) + delta.deaths;
  if (delta.wins) updates.total_wins = (profile.total_wins as number) + delta.wins;
  if (delta.apples) updates.total_apples_eaten = (profile.total_apples_eaten as number) + delta.apples;

  if (Object.keys(updates).length > 0) {
    await supabase.from('profiles').update(updates).eq('id', userId);

    // Обновляем локальный стор
    const { profile: currentProfile, setProfile } = useAuthStore.getState();
    if (currentProfile) {
      setProfile({
        ...currentProfile,
        totalDeaths: updates.total_deaths ?? currentProfile.totalDeaths,
        totalWins: updates.total_wins ?? currentProfile.totalWins,
        totalApplesEaten: updates.total_apples_eaten ?? currentProfile.totalApplesEaten,
      });
    }
  }
}

export type { Profile };
