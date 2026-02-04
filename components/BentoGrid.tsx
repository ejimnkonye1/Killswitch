'use client'

import { motion } from 'framer-motion'
import { TrendingDown, Lock, Bell, BarChart3 } from 'lucide-react'

// Brand Icons
const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1DB954">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
)

const NetflixIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#E50914">
    <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z"/>
  </svg>
)

export function BentoGrid() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-semibold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl">
            Everything you need to take control of your subscriptions
          </p>
        </motion.div>

        {/* Asymmetric Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max"
        >
          {/* Card 1: Large Feature - Cost Tracking */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 lg:row-span-2 group p-8 md:p-12 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl hover:border-[#333333] hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <TrendingDown className="w-12 h-12 text-white mb-4" strokeWidth={1.5} />
                <h3 className="text-3xl font-semibold text-white mb-2">
                  Smart Cost Tracking
                </h3>
                <p className="text-base text-gray-400 max-w-sm">
                  See exactly where your money goes with detailed spending analytics and monthly breakdowns.
                </p>
              </div>
            </div>
            {/* Mockup visualization */}
            <motion.div
              className="mt-12 p-6 bg-black rounded-2xl border border-[#222222]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="space-y-3"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <SpotifyIcon />
                    <span className="text-sm text-gray-400">Spotify</span>
                  </div>
                  <span className="text-sm text-white font-medium">$12.99</span>
                </div>
                <div className="h-1 bg-[#222222] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#1DB954] rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: '25%' }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                  />
                </div>
              </motion.div>
              <motion.div
                className="space-y-3 mt-4"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <NetflixIcon />
                    <span className="text-sm text-gray-400">Netflix</span>
                  </div>
                  <span className="text-sm text-white font-medium">$19.99</span>
                </div>
                <div className="h-1 bg-[#222222] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#E50914] rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: '33%' }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    viewport={{ once: true }}
                  />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Card 2: Alerts */}
          <motion.div
            variants={itemVariants}
            className="group p-8 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl hover:border-[#333333] hover:scale-[1.02] transition-all duration-300"
          >
            <Bell className="w-10 h-10 text-white mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold text-white mb-2">
              Smart Alerts
            </h3>
            <p className="text-sm text-gray-400">
              Never miss a renewal or trial expiry with timely notifications.
            </p>
          </motion.div>

          {/* Card 3: Kill Switch */}
          <motion.div
            variants={itemVariants}
            className="group p-8 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl hover:border-[#333333] hover:scale-[1.02] transition-all duration-300"
          >
            <Lock className="w-10 h-10 text-white mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold text-white mb-2">
              Kill Switch
            </h3>
            <p className="text-sm text-gray-400">
              One-click cancellation with pre-written emails and direct links.
            </p>
          </motion.div>

          {/* Card 4: Analytics - spans 2 cols */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 group p-8 md:p-12 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl hover:border-[#333333] hover:scale-[1.02] transition-all duration-300"
          >
            <BarChart3 className="w-12 h-12 text-white mb-4" strokeWidth={1.5} />
            <h3 className="text-2xl font-semibold text-white mb-2">
              Advanced Analytics
            </h3>
            <p className="text-base text-gray-400 max-w-sm mb-8">
              Visualize spending trends and identify optimization opportunities.
            </p>
            {/* Simple chart visualization */}
            <div className="flex items-end justify-between gap-2 h-16">
              {[40, 60, 35, 75, 50, 80, 55].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="flex-1 bg-gray-600 rounded-t transition-all duration-300 hover:bg-gray-400"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
