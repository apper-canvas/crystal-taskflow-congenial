import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { getIcon } from '../utils/iconUtils';

export default function MainFeature({ onTaskAction, updateStats }) {
  // Task states
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'), // Tomorrow
    status: 'not-started'
  });
  
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('dueDate');
  const [view, setView] = useState('list'); // 'list' or 'kanban'
  
  // Store tasks in localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateStats(tasks);
  }, [tasks, updateStats]);
  
  // Add a new task
  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    const task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: format(new Date(Date.now() + 86400000), 'yyyy-MM-dd'),
      status: 'not-started'
    });
    
    onTaskAction('add', task);
  };
  
  // Update task
  const updateTask = (e) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;
    
    const updatedTask = {
      ...editingTask,
      updatedAt: new Date().toISOString()
    };
    
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    
    setEditingTask(null);
    onTaskAction('update', updatedTask);
  };
  
  // Delete task
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    onTaskAction('delete', { id });
  };
  
  // Change task status
  const changeStatus = (id, newStatus) => {
    const taskToUpdate = tasks.find(task => task.id === id);
    if (!taskToUpdate) return;
    
    const updatedTask = {
      ...taskToUpdate,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    
    setTasks(tasks.map(task => 
      task.id === id ? updatedTask : task
    ));
    
    if (newStatus === 'completed') {
      onTaskAction('complete', updatedTask);
    } else {
      onTaskAction('update', updatedTask);
    }
  };
  
  // Handle input changes for new task
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };
  
  // Handle input changes for editing task
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingTask({ ...editingTask, [name]: value });
  };
  
  // Filter tasks based on current filter
  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    // Apply filter
    switch (filter) {
      case 'not-started':
      case 'in-progress':
      case 'completed':
      case 'on-hold':
        filtered = filtered.filter(task => task.status === filter);
        break;
      case 'high-priority':
        filtered = filtered.filter(task => task.priority === 'high' || task.priority === 'urgent');
        break;
      case 'today':
        const today = format(new Date(), 'yyyy-MM-dd');
        filtered = filtered.filter(task => task.dueDate === today);
        break;
      default:
        // 'all' - no filtering
        break;
    }
    
    // Apply sorting
    switch (sort) {
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'dueDate':
        filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        break;
      case 'status':
        const statusOrder = { 'not-started': 0, 'in-progress': 1, 'on-hold': 2, 'completed': 3 };
        filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
      default:
        // Default to sorting by created date
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    return filtered;
  };
  
  const filteredTasks = getFilteredTasks();
  
  // Group tasks by status for Kanban view
  const getKanbanColumns = () => {
    const columns = {
      'not-started': {
        title: 'Not Started',
        icon: 'circle',
        tasks: []
      },
      'in-progress': {
        title: 'In Progress',
        icon: 'loader',
        tasks: []
      },
      'on-hold': {
        title: 'On Hold',
        icon: 'pause',
        tasks: []
      },
      'completed': {
        title: 'Completed',
        icon: 'check-circle',
        tasks: []
      }
    };
    
    // Filter tasks into columns
    filteredTasks.forEach(task => {
      if (columns[task.status]) {
        columns[task.status].tasks.push(task);
      }
    });
    
    return columns;
  };
  
  const kanbanColumns = getKanbanColumns();
  
  return (
    <div className="space-y-8">
      {/* Task Form */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <PlusCircleIcon className="h-5 w-5 text-primary mr-2" />
          {editingTask ? 'Edit Task' : 'Add New Task'}
        </h2>
        
        <form onSubmit={editingTask ? updateTask : addTask} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={editingTask ? editingTask.title : newTask.title}
                onChange={editingTask ? handleEditChange : handleInputChange}
                placeholder="Enter task title"
                className="input"
                required
              />
            </div>
            
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={editingTask ? editingTask.dueDate : newTask.dueDate}
                onChange={editingTask ? handleEditChange : handleInputChange}
                className="input"
              />
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={editingTask ? editingTask.priority : newTask.priority}
                onChange={editingTask ? handleEditChange : handleInputChange}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={editingTask ? editingTask.status : newTask.status}
                onChange={editingTask ? handleEditChange : handleInputChange}
                className="input"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={editingTask ? editingTask.description : newTask.description}
              onChange={editingTask ? handleEditChange : handleInputChange}
              placeholder="Optional task description"
              rows="3"
              className="input"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            {editingTask && (
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={editingTask ? !editingTask.title : !newTask.title}
            >
              {editingTask ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </motion.div>
      
      {/* Task Management Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input py-1.5 max-w-xs"
          >
            <option value="all">All Tasks</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="high-priority">High Priority</option>
            <option value="today">Due Today</option>
          </select>
          
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input py-1.5 max-w-xs"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="title">Sort by Title</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
        
        <div className="flex gap-2 bg-surface-100 dark:bg-surface-800 p-1 rounded-lg">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded-md flex items-center ${
              view === 'list' 
                ? 'bg-white dark:bg-surface-700 shadow-sm' 
                : 'text-surface-600 dark:text-surface-400'
            }`}
          >
            <ListIcon className="h-4 w-4 mr-2" />
            List
          </button>
          <button
            onClick={() => setView('kanban')}
            className={`px-3 py-1.5 rounded-md flex items-center ${
              view === 'kanban' 
                ? 'bg-white dark:bg-surface-700 shadow-sm' 
                : 'text-surface-600 dark:text-surface-400'
            }`}
          >
            <LayoutIcon className="h-4 w-4 mr-2" />
            Kanban
          </button>
        </div>
      </div>
      
      {/* Task List View */}
      {view === 'list' && (
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 card bg-surface-50 dark:bg-surface-800 border border-dashed">
              <InboxIcon className="h-12 w-12 text-surface-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-surface-600 dark:text-surface-400">No tasks found</h3>
              <p className="text-surface-500 dark:text-surface-500 mt-1">
                Add a new task to get started or try changing your filters.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={deleteTask}
                  onEdit={setEditingTask}
                  onChangeStatus={changeStatus}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      )}
      
      {/* Kanban Board View */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(kanbanColumns).map(([status, column]) => {
            const ColumnIcon = getIcon(column.icon);
            return (
              <div key={status} className="card bg-surface-50 dark:bg-surface-800">
                <div className="flex items-center mb-4">
                  <ColumnIcon className={`h-5 w-5 mr-2 ${getStatusColor(status)}`} />
                  <h3 className="font-medium">{column.title}</h3>
                  <span className="ml-auto bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 px-2 py-0.5 rounded-full text-xs">
                    {column.tasks.length}
                  </span>
                </div>
                
                <div className="space-y-3 max-h-[500px] overflow-y-auto p-1">
                  {column.tasks.length === 0 ? (
                    <div className="text-center py-5 text-surface-500 dark:text-surface-500 border border-dashed border-surface-300 dark:border-surface-700 rounded-lg">
                      No tasks
                    </div>
                  ) : (
                    <AnimatePresence>
                      {column.tasks.map(task => (
                        <KanbanCard
                          key={task.id}
                          task={task}
                          onDelete={deleteTask}
                          onEdit={setEditingTask}
                          onChangeStatus={changeStatus}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onDelete, onEdit, onChangeStatus }) {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="card hover:shadow-md transition-all"
    >
      <div className="flex items-start sm:items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <button 
              onClick={() => onChangeStatus(task.id, task.status === 'completed' ? 'not-started' : 'completed')} 
              className={`p-2 -m-2 mr-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors ${getCheckboxStyle(task.status)}`}
              aria-label={task.status === 'completed' ? "Mark as incomplete" : "Mark as complete"}
            >
              {task.status === 'completed' ? <CheckSquareIcon className="h-5 w-5" /> : <SquareIcon className="h-5 w-5" />}
            </button>
            <h3 className={`font-medium truncate ${task.status === 'completed' ? 'line-through text-surface-500 dark:text-surface-500' : ''}`}>
              {task.title}
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center mt-2 gap-2">
            <span className={`task-pill ${getPriorityColor(task.priority)}`}>
              <FlagIcon className="h-3 w-3 mr-1" />
              {capitalizeFirstLetter(task.priority)}
            </span>
            
            <span className={`task-pill ${getStatusColor(task.status)}`}>
              {getStatusIcon(task.status)}
              {formatStatus(task.status)}
            </span>
            
            <span className="task-pill bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {formatDate(task.dueDate)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1.5 text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-md transition-colors"
            aria-label="Show details"
          >
            {showDetails ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-md transition-colors"
            aria-label="Edit task"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-surface-600 hover:text-red-500 dark:text-surface-400 dark:hover:text-red-400 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-md transition-colors"
            aria-label="Delete task"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {showDetails && task.description && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700"
        >
          <p className="text-surface-700 dark:text-surface-300 whitespace-pre-line">
            {task.description}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function KanbanCard({ task, onDelete, onEdit, onChangeStatus }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-surface-800 rounded-lg p-3 shadow-sm border border-surface-200 dark:border-surface-700 hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-surface-500 dark:text-surface-500' : ''}`}>
          {task.title}
        </h4>
        <div className="flex items-center">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-700 rounded transition-colors"
            aria-label="Edit task"
          >
            <EditIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-surface-600 hover:text-red-500 dark:text-surface-400 dark:hover:text-red-400 hover:bg-surface-100 dark:hover:bg-surface-700 rounded transition-colors"
            aria-label="Delete task"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-surface-600 dark:text-surface-400 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}
      
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <span className={`task-pill ${getPriorityColor(task.priority)} text-[10px]`}>
          <FlagIcon className="h-2.5 w-2.5 mr-0.5" />
          {capitalizeFirstLetter(task.priority)}
        </span>
        
        <span className="task-pill bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 text-[10px]">
          <CalendarIcon className="h-2.5 w-2.5 mr-0.5" />
          {formatDate(task.dueDate)}
        </span>
      </div>
      
      <div className="mt-3 pt-2 border-t border-surface-100 dark:border-surface-700 flex justify-between items-center">
        <div className="flex space-x-1">
          {['not-started', 'in-progress', 'on-hold', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => onChangeStatus(task.id, status)}
              className={`p-1 rounded-full ${task.status === status ? 'bg-surface-200 dark:bg-surface-700' : 'hover:bg-surface-100 dark:hover:bg-surface-800'}`}
              title={formatStatus(status)}
            >
              {getStatusDot(status)}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Helper functions
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.getTime() === today.getTime()) {
    return 'Today';
  } else if (date.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }
  
  return format(date, 'MMM d');
}

function formatStatus(status) {
  switch(status) {
    case 'not-started': return 'Not Started';
    case 'in-progress': return 'In Progress';
    case 'on-hold': return 'On Hold';
    case 'completed': return 'Completed';
    default: return capitalizeFirstLetter(status);
  }
}

function getPriorityColor(priority) {
  switch(priority) {
    case 'low': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
    case 'urgent': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    default: return 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200';
  }
}

function getStatusColor(status) {
  switch(status) {
    case 'not-started': return 'text-blue-500 dark:text-blue-400';
    case 'in-progress': return 'text-yellow-500 dark:text-yellow-400';
    case 'on-hold': return 'text-purple-500 dark:text-purple-400';
    case 'completed': return 'text-green-500 dark:text-green-400';
    default: return 'text-surface-500 dark:text-surface-400';
  }
}

function getCheckboxStyle(status) {
  if (status === 'completed') {
    return 'text-green-500 dark:text-green-400';
  }
  return 'text-surface-400 dark:text-surface-500';
}

function getStatusIcon(status) {
  let Icon;
  
  switch(status) {
    case 'not-started':
      Icon = getIcon('Circle');
      break;
    case 'in-progress':
      Icon = getIcon('Loader');
      break;
    case 'on-hold':
      Icon = getIcon('Pause');
      break;
    case 'completed':
      Icon = getIcon('CheckCircle');
      break;
    default:
      Icon = getIcon('Circle');
  }
  
  return <Icon className="h-3 w-3 mr-1" />;
}

function getStatusDot(status) {
  let color;
  
  switch(status) {
    case 'not-started':
      color = 'bg-blue-500';
      break;
    case 'in-progress':
      color = 'bg-yellow-500';
      break;
    case 'on-hold':
      color = 'bg-purple-500';
      break;
    case 'completed':
      color = 'bg-green-500';
      break;
    default:
      color = 'bg-surface-500';
  }
  
  return <div className={`h-2 w-2 rounded-full ${color}`}></div>;
}

// Icon components
const PlusCircleIcon = getIcon('plus-circle');
const TrashIcon = getIcon('trash-2');
const EditIcon = getIcon('edit');
const FlagIcon = getIcon('flag');
const CalendarIcon = getIcon('calendar');
const ChevronDownIcon = getIcon('chevron-down');
const ChevronUpIcon = getIcon('chevron-up');
const CheckSquareIcon = getIcon('check-square');
const SquareIcon = getIcon('square');
const ListIcon = getIcon('list');
const LayoutIcon = getIcon('layout');
const InboxIcon = getIcon('inbox');