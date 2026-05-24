import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#F3F5F7',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',
  text: '#12212B',
  textMuted: '#5B6B75',
  textHint: '#8C98A4',
  border: '#D8D6CF',
  borderSoft: '#E7E5DF',
  teal: '#0097A7',
  tealDeep: '#00696F',
  success: '#1D9E75',
  successLight: '#E8F7F1',
  warning: '#F59E0B',
  warningLight: '#FFF6DE',
  danger: '#E24B4A',
  dangerDeep: '#A32D2D',
  dangerLight: '#FFF1F0',
  info: '#378ADD',
  infoLight: '#ECF4FF',
  accent: '#7F77DD',
  accentLight: '#F2F0FF',
};

export const projectPalettes = [
  { bg: '#FFFFFF', border: '#E0DFD8', dot: '#B8B7B0', text: '#5F5E5A', gradient: ['#0097A7', '#00696F'] as const },
  { bg: '#FFFDF5', border: '#F9E4A0', dot: '#F59E0B', text: '#7A4A0A', gradient: ['#F59E0B', '#B45309'] as const },
  { bg: '#F4FAF5', border: '#A5D6A7', dot: '#1D9E75', text: '#085041', gradient: ['#1D9E75', '#085041'] as const },
  { bg: '#F0F7FF', border: '#90CAF9', dot: '#378ADD', text: '#0C447C', gradient: ['#378ADD', '#185FA5'] as const },
  { bg: '#FFF0F4', border: '#F48FB1', dot: '#E24B4A', text: '#A32D2D', gradient: ['#E24B4A', '#A32D2D'] as const },
  { bg: '#F5F3FF', border: '#CE93D8', dot: '#7F77DD', text: '#3C3489', gradient: ['#7F77DD', '#534AB7'] as const },
  { bg: '#FFF5F2', border: '#FFAB91', dot: '#D85A30', text: '#712B13', gradient: ['#D85A30', '#993C1D'] as const },
  { bg: '#F0FAFA', border: '#80DEEA', dot: '#0097A7', text: '#004D5C', gradient: ['#0097A7', '#004D5C'] as const },
  { bg: '#FBF5FF', border: '#CE93D8', dot: '#9C27B0', text: '#4A148C', gradient: ['#9C27B0', '#4A148C'] as const },
];

export const getProjectPalette = (project?: { id?: number; color?: number } | null) => {
  if (!project) {
    return projectPalettes[0];
  }

  const colorIndex = project.color && project.color > 0
    ? project.color % projectPalettes.length
    : ((project.id ?? 0) % (projectPalettes.length - 1)) + 1;

  return projectPalettes[colorIndex];
};

export const screen = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingBottom: 28 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shadow: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 4,
  },
});

export const priorityTone = (priority: string) => {
  if (priority === 'High') {
    return { bg: colors.dangerLight, text: colors.danger };
  }
  if (priority === 'Medium') {
    return { bg: colors.warningLight, text: '#7A4A0A' };
  }
  return { bg: '#EAF7F1', text: '#085041' };
};

export const statusTone = (status: string) => {
  if (status === 'Completed') {
    return { bg: colors.successLight, text: colors.success };
  }
  if (status === 'In Progress') {
    return { bg: colors.infoLight, text: '#185FA5' };
  }
  return { bg: '#F1F5F9', text: colors.textMuted };
};

export const formatDate = (value: string) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const toInputDate = (value: string) => {
  if (!value) {
    return '';
  }
  return value.slice(0, 10);
};

export const daysLate = (deadline: string) => {
  const diff = Math.floor((Date.now() - new Date(deadline).getTime()) / 86400000);
  return diff > 0 ? diff : 0;
};

export const isDueSoon = (deadline: string) => {
  const diff = Math.floor((new Date(deadline).getTime() - Date.now()) / 86400000);
  return diff >= 0 && diff <= 3;
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
};
