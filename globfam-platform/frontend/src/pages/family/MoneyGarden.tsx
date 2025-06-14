import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface Plant {
  id: string;
  type: 'seed' | 'sprout' | 'plant' | 'flower' | 'tree';
  value: number;
  age: number;
  name: string;
  emoji: string;
}

interface MoneyGardenProps {
  childId: string;
  childName: string;
  totalSavings: number;
  currency: string;
}

const plantStages = [
  { type: 'seed', emoji: '🌰', minValue: 0, growthTime: 0 },
  { type: 'sprout', emoji: '🌱', minValue: 10, growthTime: 7 },
  { type: 'plant', emoji: '🌿', minValue: 25, growthTime: 14 },
  { type: 'flower', emoji: '🌸', minValue: 50, growthTime: 21 },
  { type: 'tree', emoji: '🌳', minValue: 100, growthTime: 30 },
];

const achievements = [
  { id: 'first_save', name: 'First Seed', icon: '🌟', requirement: 'Save your first dollar' },
  { id: 'week_streak', name: 'Weekly Warrior', icon: '🔥', requirement: 'Save for 7 days straight' },
  { id: 'goal_reached', name: 'Goal Getter', icon: '🎯', requirement: 'Reach your first goal' },
  { id: 'hundred_saved', name: 'Century Club', icon: '💯', requirement: 'Save $100 total' },
];

export function MoneyGarden({ childId, childName, totalSavings, currency }: MoneyGardenProps) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [coins, setCoins] = useState(Math.floor(totalSavings));
  const [weather, setWeather] = useState<'sunny' | 'rainy' | 'rainbow'>('sunny');

  // Calculate how many plants based on savings
  useEffect(() => {
    const plantsCount = Math.floor(totalSavings / 20);
    const newPlants: Plant[] = [];
    
    for (let i = 0; i < Math.min(plantsCount, 12); i++) {
      const value = 20 + (i * 10);
      const stage = plantStages.find(s => value >= s.minValue) || plantStages[0];
      
      newPlants.push({
        id: `plant-${i}`,
        type: stage.type as any,
        value,
        age: Math.floor(Math.random() * 30) + stage.growthTime,
        name: `Plant ${i + 1}`,
        emoji: stage.emoji,
      });
    }
    
    setPlants(newPlants);
  }, [totalSavings]);

  // Weather changes
  useEffect(() => {
    const interval = setInterval(() => {
      const weathers: Array<'sunny' | 'rainy' | 'rainbow'> = ['sunny', 'sunny', 'rainy', 'rainbow'];
      setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const waterPlant = (plant: Plant) => {
    setSelectedPlant(plant);
    setShowReward(true);
    
    // Add coins animation
    setCoins(prev => prev + 1);
    
    setTimeout(() => {
      setShowReward(false);
      setSelectedPlant(null);
    }, 2000);
  };

  return (
    <div className="bg-gradient-to-b from-sky-200 to-green-100 rounded-2xl p-6 min-h-[600px] relative overflow-hidden">
      {/* Weather Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {weather === 'sunny' && (
          <div className="absolute top-4 right-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-6xl"
            >
              ☀️
            </motion.div>
          </div>
        )}
        {weather === 'rainy' && (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xl"
                initial={{ top: -20, left: `${Math.random() * 100}%` }}
                animate={{ top: '100%' }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                💧
              </motion.div>
            ))}
          </div>
        )}
        {weather === 'rainbow' && (
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
            <div className="text-8xl opacity-50">🌈</div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="relative z-10 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {childName}'s Money Garden
        </h2>
        <div className="flex items-center gap-4">
          <div className="bg-white/80 rounded-lg px-4 py-2">
            <span className="text-sm text-gray-600">Total Saved</span>
            <p className="text-xl font-bold text-prosperity-green">
              {currency}{totalSavings}
            </p>
          </div>
          <div className="bg-white/80 rounded-lg px-4 py-2">
            <span className="text-sm text-gray-600">Garden Coins</span>
            <p className="text-xl font-bold text-warm-gold flex items-center gap-1">
              <span>🪙</span> {coins}
            </p>
          </div>
        </div>
      </div>

      {/* Garden Plot */}
      <div className="relative z-10 bg-gradient-to-b from-transparent to-green-200/50 rounded-xl p-8 min-h-[300px]">
        <div className="grid grid-cols-4 gap-4">
          {plants.map((plant, index) => (
            <motion.div
              key={plant.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => waterPlant(plant)}
                className={clsx(
                  'text-4xl p-2 rounded-lg transition-all',
                  selectedPlant?.id === plant.id && 'bg-yellow-200'
                )}
              >
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                >
                  {plant.emoji}
                </motion.div>
              </motion.button>
              <div className="text-xs text-center mt-1 text-gray-700">
                ${plant.value}
              </div>
            </motion.div>
          ))}
          
          {/* Empty plots for future plants */}
          {[...Array(Math.max(0, 12 - plants.length))].map((_, i) => (
            <div
              key={`empty-${i}`}
              className="relative p-2 border-2 border-dashed border-gray-300 rounded-lg h-16 flex items-center justify-center"
            >
              <span className="text-gray-400 text-sm">Empty</span>
            </div>
          ))}
        </div>

        {/* Reward Animation */}
        <AnimatePresence>
          {showReward && selectedPlant && (
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: -20 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <div className="bg-yellow-300 text-yellow-900 px-4 py-2 rounded-full font-bold shadow-lg">
                +1 🪙 Great job!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Achievements */}
      <div className="relative z-10 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Achievements</h3>
        <div className="flex gap-2 flex-wrap">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={clsx(
                'bg-white/80 rounded-lg p-3 flex items-center gap-2',
                totalSavings > (index + 1) * 25 ? 'opacity-100' : 'opacity-50'
              )}
            >
              <span className="text-2xl">{achievement.icon}</span>
              <div>
                <p className="text-sm font-medium">{achievement.name}</p>
                <p className="text-xs text-gray-600">{achievement.requirement}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Garden Tips */}
      <div className="relative z-10 mt-6 bg-white/80 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Garden Tip:</span> Save regularly to help your plants grow! 
          Each plant represents your savings milestones. The more you save, the bigger your garden becomes!
        </p>
      </div>
    </div>
  );
}