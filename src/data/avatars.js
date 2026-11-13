// Character avatars for Jangal Little Boy
// Warm, welcoming, and culturally reflective friendly companions

export const AVATARS = [
  {
    id: 'boy_sun',
    name: 'Amadou',
    emoji: '👦🏾',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-400',
    accentColor: '#f59e0b',
    label: 'Smiling Boy',
  },
  {
    id: 'girl_teal',
    name: 'Kumba',
    emoji: '👧🏾',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-400',
    accentColor: '#14b8a6',
    label: 'Cheerful Girl',
  },
  {
    id: 'boy_terracotta',
    name: 'Modou',
    emoji: '🧒🏾',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-400',
    accentColor: '#f97316',
    label: 'Curious Explorer',
  },
  {
    id: 'girl_rose',
    name: 'Fatou',
    emoji: '👧🏿',
    bgColor: 'bg-rose-100',
    borderColor: 'border-rose-400',
    accentColor: '#f43f5e',
    label: 'Joyful Learner',
  },
  {
    id: 'cub_lion',
    name: 'Little Lion',
    emoji: '🦁',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-400',
    accentColor: '#eab308',
    label: 'Brave Cub',
  },
  {
    id: 'star_explorer',
    name: 'Bright Sun',
    emoji: '☀️',
    bgColor: 'bg-sky-100',
    borderColor: 'border-sky-400',
    accentColor: '#0ea5e9',
    label: 'Golden Sun',
  },
];

export function getAvatarById(avatarId) {
  return AVATARS.find(a => a.id === avatarId) || AVATARS[0];
}

