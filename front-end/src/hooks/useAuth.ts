import useAuthStore from '@/store/authStore';
import { useStore } from 'zustand';

const useAuth = () => {
  return useStore(useAuthStore);
};

export default useAuth; 