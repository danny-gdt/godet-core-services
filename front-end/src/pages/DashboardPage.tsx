import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import axiosClient from '@/api/axiosClient';
import Card from '@/components/ui/Card';

const DashboardPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const fetchInitiated = useRef(false);

  useEffect(() => {
    if (user || fetchInitiated.current) {
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axiosClient.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };
    
    fetchInitiated.current = true;
    fetchUser();
  }, [user, setUser]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {user ? (
        <Card>
          <h2 className="text-xl font-bold mb-4">Welcome to the dashboard!</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
        </Card>
      ) : (
        <p>Loading user data...</p>
      )}
    </motion.div>
  );
};

export default DashboardPage; 