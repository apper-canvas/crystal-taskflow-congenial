import * as Icons from 'lucide-react';

export const getIcon = (iconName) => {
  // Convert kebab-case to PascalCase
  if (typeof iconName === 'string' && iconName.includes('-')) {
    const pascalCase = iconName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    iconName = pascalCase;
  }
  
  return Icons[iconName] || Icons.AlertCircle;
};