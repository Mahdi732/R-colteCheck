import { AppColors } from '@/constants/styles';
import { Stack } from 'expo-router';

export default function RecolteLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: AppColors.primary },
        headerTintColor: AppColors.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    />
  );
}
