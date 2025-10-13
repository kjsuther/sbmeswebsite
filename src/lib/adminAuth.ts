import bcrypt from 'bcryptjs';
import { supabase } from './supabase';

const ADMIN_SESSION_KEY = 'chatbot_admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const initializeAdminPassword = async (password: string): Promise<void> => {
  const hashedPassword = await bcrypt.hash(password, 10);

  await supabase.from('admin_config').upsert({
    key: 'admin_password',
    value: { hash: hashedPassword },
  });
};

export const verifyAdminPassword = async (password: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('admin_config')
    .select('value')
    .eq('key', 'admin_password')
    .single();

  if (error || !data) {
    const defaultPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    await initializeAdminPassword(defaultPassword);
    return password === defaultPassword;
  }

  const storedHash = data.value.hash;
  return await bcrypt.compare(password, storedHash);
};

export const createAdminSession = (): void => {
  const session = {
    timestamp: Date.now(),
    expires: Date.now() + SESSION_DURATION,
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
};

export const isAdminAuthenticated = (): boolean => {
  const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!sessionData) return false;

  try {
    const session = JSON.parse(sessionData);
    return session.expires > Date.now();
  } catch {
    return false;
  }
};

export const clearAdminSession = (): void => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

export const updateAdminPassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  const isValid = await verifyAdminPassword(currentPassword);

  if (!isValid) {
    return { success: false, message: 'Current password is incorrect' };
  }

  await initializeAdminPassword(newPassword);

  return { success: true, message: 'Password updated successfully' };
};
