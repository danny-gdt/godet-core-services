import React from 'react';
import { motion } from 'framer-motion';

type ButtonProps = React.ComponentProps<typeof motion.button> & {
  isLoading?: boolean;
};

const Button: React.FC<ButtonProps> = ({ children, isLoading = false, ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={isLoading}
      className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-500"
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </motion.button>
  );
};

export default Button; 