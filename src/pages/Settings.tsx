import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaPalette, 
  FaBell, 
  FaLock, 
  FaCloudUploadAlt, 
  FaDownload, 
  FaTrash, 
  FaSignOutAlt,
  FaToggleOn,
  FaToggleOff,
  FaCheck,
  FaTimes,
  FaInfoCircle
} from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';

const Settings: React.FC = () => {
  const { user, profile, updateProfile, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'notifications' | 'privacy' | 'data'>('account');
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setPhotoURL(profile.photoURL || '');
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, [profile, user]);
  
  // Handle save profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({
        displayName,
        photoURL
      });
      
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect will happen automatically due to auth state change
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  return (
    <div className="settings-page p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
            <nav className="flex flex-col lg:flex-col">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center px-4 py-3 text-left ${
                  activeTab === 'account'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                }`}
              >
                <FaUser className="mr-3" />
                <span>Account</span>
              </button>
              
              <button
                onClick={() => setActiveTab('appearance')}
                className={`flex items-center px-4 py-3 text-left ${
                  activeTab === 'appearance'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                }`}
              >
                <FaPalette className="mr-3" />
                <span>Appearance</span>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center px-4 py-3 text-left ${
                  activeTab === 'notifications'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                }`}
              >
                <FaBell className="mr-3" />
                <span>Notifications</span>
              </button>
              
              <button
                onClick={() => setActiveTab('privacy')}
                className={`flex items-center px-4 py-3 text-left ${
                  activeTab === 'privacy'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                }`}
              >
                <FaLock className="mr-3" />
                <span>Privacy & Security</span>
              </button>
              
              <button
                onClick={() => setActiveTab('data')}
                className={`flex items-center px-4 py-3 text-left ${
                  activeTab === 'data'
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                }`}
              >
                <FaCloudUploadAlt className="mr-3" />
                <span>Data & Backup</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 mt-auto"
              >
                <FaSignOutAlt className="mr-3" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Content */}
        <div className="col-span-1 lg:col-span-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            {/* Account Settings */}
            {activeTab === 'account' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Account Settings</h2>
                
                {saveSuccess && (
                  <div className="mb-4 p-3 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg flex items-center">
                    <FaCheck className="mr-2" />
                    Profile updated successfully!
                  </div>
                )}
                
                <div className="flex items-center mb-6">
                  <div className="relative">
                    {photoURL ? (
                      <img 
                        src={photoURL} 
                        alt={displayName || email} 
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 text-2xl">
                        {displayName ? displayName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1 shadow-md">
                        <FaCloudUploadAlt />
                      </button>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                      {displayName || 'User'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">{email}</p>
                  </div>
                  
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="ml-auto px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
                
                {isEditing ? (
                  <form onSubmit={handleSaveProfile}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          disabled
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          To change your email, please contact support.
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="photoURL" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Profile Photo URL
                        </label>
                        <input
                          type="text"
                          id="photoURL"
                          value={photoURL}
                          onChange={(e) => setPhotoURL(e.target.value)}
                          placeholder="https://example.com/photo.jpg"
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Account Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Display Name</span>
                        <span className="text-slate-900 dark:text-white font-medium">{displayName || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Email</span>
                        <span className="text-slate-900 dark:text-white font-medium">{email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Account Created</span>
                        <span className="text-slate-900 dark:text-white font-medium">
                          {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Appearance Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white">Dark Mode</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Switch between light and dark themes
                      </p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className="text-2xl text-indigo-600 dark:text-indigo-400"
                    >
                      {darkMode ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>
                  
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Color Theme</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      <button className="w-full aspect-square rounded-lg bg-indigo-600 ring-2 ring-offset-2 ring-indigo-600"></button>
                      <button className="w-full aspect-square rounded-lg bg-violet-600"></button>
                      <button className="w-full aspect-square rounded-lg bg-pink-600"></button>
                      <button className="w-full aspect-square rounded-lg bg-emerald-600"></button>
                      <button className="w-full aspect-square rounded-lg bg-amber-600"></button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Theme color affects buttons, links, and accents throughout the app.
                    </p>
                  </div>
                  
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Font Size</h3>
                    <div className="flex items-center space-x-4">
                      <button className="px-3 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded-lg">
                        Small
                      </button>
                      <button className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                        Medium
                      </button>
                      <button className="px-3 py-1 text-base border border-slate-300 dark:border-slate-600 rounded-lg">
                        Large
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Notification Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white">Enable Notifications</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Receive notifications for important updates
                      </p>
                    </div>
                    <button
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className="text-2xl text-indigo-600 dark:text-indigo-400"
                    >
                      {notificationsEnabled ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>
                  
                  {notificationsEnabled && (
                    <>
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Notification Types</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white">Email Notifications</h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Receive notifications via email
                              </p>
                            </div>
                            <button
                              onClick={() => setEmailNotifications(!emailNotifications)}
                              className="text-2xl text-indigo-600 dark:text-indigo-400"
                            >
                              {emailNotifications ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white">Push Notifications</h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Receive notifications in your browser
                              </p>
                            </div>
                            <button
                              onClick={() => setPushNotifications(!pushNotifications)}
                              className="text-2xl text-indigo-600 dark:text-indigo-400"
                            >
                              {pushNotifications ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Notification Preferences</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="notifyDueDates"
                              checked={true}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                            />
                            <label htmlFor="notifyDueDates" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                              Due date reminders
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="notifyEvents"
                              checked={true}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                            />
                            <label htmlFor="notifyEvents" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                              Calendar events
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="notifyHabits"
                              checked={true}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                            />
                            <label htmlFor="notifyHabits" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                              Habit reminders
                            </label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Privacy & Security Settings */}
            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Privacy & Security</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Password</h3>
                    <button className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      Change Password
                    </button>
                  </div>
                  
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Two-Factor Authentication</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                      Add an extra layer of security to your account
                    </p>
                    <button className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      Enable 2FA
                    </button>
                  </div>
                  
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Data Privacy</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="shareUsageData"
                          checked={false}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                        />
                        <label htmlFor="shareUsageData" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                          Share anonymous usage data to help improve the app
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-3">Danger Zone</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                      These actions are irreversible
                    </p>
                    
                    <div className="space-y-3">
                      <button className="px-3 py-1.5 text-sm border border-red-300 text-red-600 dark:border-red-800 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                        Delete All Data
                      </button>
                      
                      <button className="px-3 py-1.5 text-sm border border-red-300 text-red-600 dark:border-red-800 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Data & Backup Settings */}
            {activeTab === 'data' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Data & Backup</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Export Data</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                      Download all your data as a JSON file
                    </p>
                    <button className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center">
                      <FaDownload className="mr-2" />
                      Export All Data
                    </button>
                  </div>
                  
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Sync Settings</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">Auto-Sync</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Automatically sync data across devices
                          </p>
                        </div>
                        <button className="text-2xl text-indigo-600 dark:text-indigo-400">
                          <FaToggleOn />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">Offline Mode</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Work offline and sync when connected
                          </p>
                        </div>
                        <button className="text-2xl text-indigo-600 dark:text-indigo-400">
                          <FaToggleOn />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Deploy Your App</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                      Host your own instance of Lock The Eff In
                    </p>
                    
                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 dark:text-white flex items-center">
                        <FaInfoCircle className="mr-2 text-indigo-500" />
                        Deployment Instructions
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        To deploy your own instance and allow friends to create accounts:
                      </p>
                      <ol className="text-sm text-slate-600 dark:text-slate-400 mt-2 space-y-2 list-decimal list-inside">
                        <li>Clone the repository from GitHub</li>
                        <li>Set up a Firebase project and configure authentication</li>
                        <li>Update the Firebase configuration in the app</li>
                        <li>Deploy to Vercel, Netlify, or Firebase Hosting</li>
                        <li>Share the URL with your friends!</li>
                      </ol>
                      <div className="mt-3">
                        <a 
                          href="https://github.com/yourusername/lock-the-eff-in" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View GitHub Repository
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
