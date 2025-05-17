import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

export default function NotFound() {
  const AlertCircleIcon = getIcon('alert-circle');
  const HomeIcon = getIcon('Home');
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex justify-center mb-6">
          <AlertCircleIcon className="h-20 w-20 text-secondary" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-surface-800 dark:text-surface-100">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-surface-700 dark:text-surface-200">
          Page Not Found
        </h2>
        
        <p className="text-surface-600 dark:text-surface-400 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center px-5 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors shadow-md"
        >
          <HomeIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-16 text-surface-500 dark:text-surface-500"
      >
        <p className="text-sm">
          &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}