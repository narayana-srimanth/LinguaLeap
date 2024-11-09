import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { Trophy, Star, Gamepad2, Brain, Target, Sparkles, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useUserStore } from '../stores/userStore';
import axios from 'axios';
import { useEffect } from 'react';

const MAX_DINO_LEVEL = 5;
const MAX_MEMORY_LEVEL = Math.floor(10 / 3);

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  onClick: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, icon, progress, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="bg-indigo-700 rounded-lg p-6 cursor-pointer border-2 border-indigo-600 hover:border-green-400 transition-all shadow-lg hover:shadow-green-400/20"
    onClick={onClick}
  >
    <div className="relative">
      <div className="absolute -top-2 left-0 w-full h-2 bg-indigo-800/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-400 transition-all duration-500 shadow-[0_0_8px_rgba(74,222,128,0.5)]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      
      <div className="mt-4 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-pixel text-indigo-100 mb-2">{title}</h3>
          <p className="text-sm text-indigo-200 font-pixel leading-relaxed">{description}</p>
        </div>
        <div className="text-yellow-400">
          {icon}
        </div>
      </div>
    </div>
  </motion.div>
);

interface LanguageSectionProps {
  title: string;
  games: {
    title: string;
    description: string;
    icon: React.ReactNode;
    progress: number;
    onClick: () => void;
  }[];
}

const LanguageSection: React.FC<LanguageSectionProps> = ({ title, games }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-12"
  >
    <h2 className="text-2xl font-pixel text-indigo-100 mb-6 flex items-center gap-2">
      <Sparkles className="h-5 w-5 text-yellow-400" />
      {title}
    </h2>
    <div className="grid md:grid-cols-2 gap-6">
      {games.map((game, index) => (
        <GameCard key={index} {...game} />
      ))}
    </div>
  </motion.div>
);

interface AchievementBadgeProps {
  achievement: {
    title: string;
    icon: React.ReactNode;
    unlocked: boolean;
  };
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`p-4 rounded-lg ${
      achievement.unlocked
        ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.3)]'
        : 'bg-indigo-800/50 border border-indigo-700'
    } transition-all duration-300`}
    title={achievement.title}
  >
    <div className={`${achievement.unlocked ? 'text-indigo-900' : 'text-indigo-400'}`}>
      {achievement.icon}
    </div>
  </motion.div>
);

interface LogoutModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ onClose, onConfirm }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-indigo-800 p-8 rounded-lg pixel-border max-w-md w-full border-2 border-indigo-700"
    >
      <h2 className="text-2xl font-pixel text-yellow-400 mb-4">Leaving So Soon?</h2>
      <p className="text-indigo-200 font-pixel mb-6">Your progress is saved. Ready to take a break?</p>
      
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConfirm}
          className="flex-1 p-3 bg-red-500 text-white font-pixel rounded-lg
                   border-b-4 border-red-700 hover:bg-red-600
                   active:border-b-0 active:mt-1 transition-all"
        >
          Logout
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="flex-1 p-3 bg-indigo-600 text-white font-pixel rounded-lg
                   border-b-4 border-indigo-800 hover:bg-indigo-700
                   active:border-b-0 active:mt-1 transition-all"
        >
          Stay
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

const DashboardScreen = () => {
  const navigate = useNavigate();
  const { level: memoryLevel, highScore: memoryHighScore } = useGameStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [totalXP, setTotalXP] = useState(0); // Total XP state
  const user = useUserStore((state) => state.user);

  if (!user) {
    navigate('/login'); // Redirect to login if no user data
    return null;
  }

  // Fetch total XP when the component mounts or when user.name changes
  useEffect(() => {
    const getUserXP = async () => {
      if (!user?.name) {
        console.error("User name is not available");
        return;
      }

      try {
        // API call to get totalXP by user name
        const response = await axios.get(`/api/users/${user.name}/totalXP`);
        
        if (response.status === 200) {
          console.log(response.data.totalXP);
          setTotalXP(response.data.totalXP); // Update totalXP state
        } else {
          console.error('Failed to fetch user XP');
        }
      } catch (error) {
        console.error("Error fetching XP:", error);
      }
    };

    getUserXP();
  }, [user?.name]); // Re-run when user.name changes

  // Define user data (for local fallback)
  const [userData] = useState({
    name: localStorage.getItem('playerName') || 'Player One',
    dinoLevel: 3,
    dinoHighScore: 1200,
  });

  // Achievements
  const achievements = [
    {
      title: "Spanish Master",
      icon: <Trophy className="h-8 w-8" />,
      unlocked: userData.dinoHighScore >= 1000,
    },
    {
      title: "Memory Expert",
      icon: <Brain className="h-8 w-8" />,
      unlocked: memoryHighScore >= 1000,
    },
    {
      title: "Quick Learner",
      icon: <Target className="h-8 w-8" />,
      unlocked: totalXP >= 500,
    },
  ];

  // Handle logout
  const handleLogout = () => {
    setShowLogoutModal(false);
    toast.success('Successfully logged out!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900">
      <div className="container mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-800/30 rounded-2xl p-8 mb-12 border border-indigo-700/50 backdrop-blur-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-pixel text-indigo-100 leading-tight mb-2">
                Welcome back,
                <span className="block text-green-400">{user.name}!</span>
              </h1>
              <div className="flex items-center gap-3 bg-indigo-900/50 px-4 py-2 rounded-lg inline-block">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="font-pixel text-indigo-200">Total XP: {totalXP}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-4">
                {achievements.map((achievement, index) => (
                  <AchievementBadge key={index} achievement={achievement} />
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLogoutModal(true)}
                className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-6 h-6 text-red-400" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="space-y-12">
          <LanguageSection
            title="Spanish Games"
            games={[ 
              {
                title: "Dino Runner",
                description: "Learn Spanish while running from obstacles! Master vocabulary through an exciting endless runner game.",
                icon: <Gamepad2 className="h-8 w-8" />,
                progress: userData.dinoLevel / MAX_DINO_LEVEL,
                onClick: () => navigate('/dinoGame'),
              },
            ]}
          />

          <LanguageSection
            title="French Games"
            games={[ 
              {
                title: "Memory Match",
                description: "Match French words with their meanings! Improve your vocabulary through this engaging memory game.",
                icon: <Brain className="h-8 w-8" />,
                progress: memoryLevel / MAX_MEMORY_LEVEL,
                onClick: () => navigate('/memoryGame'),
              },
            ]}
          />
        </div>

        <AnimatePresence>
          {showLogoutModal && (
            <LogoutModal
              onClose={() => setShowLogoutModal(false)}
              onConfirm={handleLogout}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DashboardScreen;
