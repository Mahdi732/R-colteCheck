import { AppColors } from '@/constants/styles';
import { Stack } from 'expo-router';

export default function ParcelleLayout() {
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
