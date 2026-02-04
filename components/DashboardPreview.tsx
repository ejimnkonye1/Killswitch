'use client'

import { motion } from 'framer-motion'

// Brand Icons as SVG components
const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1DB954">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
)

const NetflixIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#E50914">
    <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z"/>
  </svg>
)

const AdobeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#FF0000">
    <path d="M0 0h9.6L16.8 24H7.2L5.4 18H0V0zm24 0h-9.6L7.2 24h9.6l1.8-6H24V0zM12 8.4L14.4 16h-4.8L12 8.4z"/>
  </svg>
)

const OpenAIIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#10A37F">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
  </svg>
)

export function DashboardPreview() {
  const subscriptions = [
    { name: 'Spotify', price: '$12.99', renewalDate: 'Mar 15', icon: SpotifyIcon },
    { name: 'Netflix', price: '$19.99', renewalDate: 'Mar 20', icon: NetflixIcon },
    { name: 'Adobe Creative', price: '$59.99', renewalDate: 'Mar 10', icon: AdobeIcon },
    { name: 'ChatGPT Pro', price: '$20.00', renewalDate: 'Mar 25', icon: OpenAIIcon },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0,
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
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] relative z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-semibold text-white mb-4">
            Your Dashboard Awaits
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl">
            Get a complete overview of all your subscriptions and spending at a glance
          </p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div 
          className="group relative"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div className="p-8 md:p-12 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl hover:border-[#333333] transition-all duration-300 overflow-hidden">
            {/* Header */}
            <motion.div 
              className="mb-8 pb-8 border-b border-[#1a1a1a]"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold text-white mb-2">
                My Subscriptions
              </h3>
              <p className="text-gray-400">
                Total monthly: <span className="text-white font-semibold">$112.97</span>
              </p>
            </motion.div>

            {/* Subscription List */}
            <motion.div 
              className="space-y-4 mb-12"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {subscriptions.map((sub, index) => {
                const Icon = sub.icon
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-center justify-between p-4 bg-black rounded-xl border border-[#222222] hover:border-[#333333] transition-all duration-200 hover:scale-[1.02] hover:translate-x-1"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                        <Icon />
                      </div>
                      <div>
                        <p className="text-white font-medium">{sub.name}</p>
                        <p className="text-xs text-gray-500">Renews {sub.renewalDate}</p>
                      </div>
                    </div>
                    <p className="text-white font-semibold">{sub.price}</p>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Summary Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-4 p-6 bg-black rounded-2xl border border-[#1a1a1a]"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants}>
                <p className="text-xs text-gray-500 mb-1">Total Annual</p>
                <p className="text-xl font-bold text-white">$1,355.64</p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <p className="text-xs text-gray-500 mb-1">Active Subs</p>
                <p className="text-xl font-bold text-white">12</p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <p className="text-xs text-gray-500 mb-1">Potential Savings</p>
                <p className="text-xl font-bold text-white">$248</p>
              </motion.div>
            </motion.div>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </motion.div>
      </div>
    </section>
  )
}
