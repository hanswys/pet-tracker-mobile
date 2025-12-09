import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  const baseClasses = 'rounded-lg px-6 py-3 items-center justify-center';
  const variantClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-200',
    danger: 'bg-red-600',
  };

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        disabled || loading ? 'opacity-50' : ''
      }`}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#000' : '#fff'} />
      ) : (
        <Text
          className={`font-semibold text-base ${
            variant === 'secondary' ? 'text-gray-800' : 'text-white'
          }`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

