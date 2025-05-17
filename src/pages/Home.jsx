import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainFeature from '../components/MainFeature';
import { getIcon } from '../utils/iconUtils';

export default function Home({ context }) {
  const { toast } = context;
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  
  // Update stats when tasks change
  const updateStats = (tasks) => {
    const completed = tasks.filter(task => task.status === 'completed').length;
    setStats({
      totalTasks: tasks.length,
      completedTasks: completed,
      pendingTasks: tasks.length - completed
    });
  };
  
  // Handle task actions from child components
  const handleTaskAction = (action, taskData) => {
    switch(action) {
      case 'add':
        toast.success('Task added successfully!');
        break;
      case 'update':
        toast.info('Task updated');
        break;
      case 'delete':
        toast.info('Task removed');
        break;
      case 'complete':
        toast.success('Task completed! 🎉');
        break;
      default:
        break;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <CheckSquareIcon className="h-10 w-10 text-primary mr-2" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              TaskFlow
            </h1>
          </div>
          <p className="text-surface-600 dark:text-surface-400 max-w-2xl mx-auto text-lg">
            Organize, track, and complete your tasks efficiently with our intuitive task management system.
          </p>
        </motion.div>
      </header>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
      >
        <StatCard 
          title="Total Tasks" 
          value={stats.totalTasks} 
          icon="ListTodo"
          color="bg-blue-500"
        />
        <StatCard 
          title="Completed" 
          value={stats.completedTasks} 
          icon="CheckCircle"
          color="bg-green-500"
        />
        <StatCard 
          title="Pending" 
          value={stats.pendingTasks} 
          icon="Clock"
          color="bg-amber-500"
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <MainFeature 
          onTaskAction={handleTaskAction}
          updateStats={updateStats}
        />
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const Icon = getIcon(icon);
  
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className={`${color} rounded-lg p-3 mr-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-surface-700 dark:text-surface-300">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Icon components
const CheckSquareIcon = getIcon('CheckSquare');