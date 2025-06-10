import React from 'react';
import { motion } from 'framer-motion';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`bg-white shadow-lg border border-gray-200 rounded-lg px-8 pt-6 pb-8 mb-4 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card; 