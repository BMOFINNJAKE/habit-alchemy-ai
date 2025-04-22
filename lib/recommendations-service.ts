import { create } from "zustand"
import { persist } from "zustand/middleware"

export type RecommendationType = "Focus" | "Break" | "Health" | "Sleep" | "Stress" | "Energy"

export interface Recommendation {
  id: string
  title: string
  description: string
  type: RecommendationType
  source: "Huberman" | "Examine" | "Other"
  actions: {
    primary: {
      label: string
      action: "timer" | "reminder" | "learn"
    }
    secondary: {
      label: string
      action: "learn"
    }
  }
  completed?: boolean
  completedAt?: number
  createdAt: number
}

interface RecommendationsState {
  recommendations: Recommendation[]
  activeFilter: RecommendationType | "All" | "Completed" | "Active"
  generateRecommendations: (type?: RecommendationType) => void
  completeRecommendation: (id: string) => void
  resetRecommendation: (id: string) => void
  deleteRecommendation: (id: string) => void
  setActiveFilter: (filter: RecommendationType | "All" | "Completed" | "Active") => void
  getFilteredRecommendations: () => Recommendation[]
  clearCompletedRecommendations: () => void
  addCustomRecommendation: (recommendation: Omit<Recommendation, "id" | "createdAt">) => string
}

// Huberman Lab protocols and recommendations
const hubermanProtocols: Recommendation[] = [
  {
    id: "strategic-break",
    title: "Take a strategic break",
    description:
      "Regular breaks improve focus and cognitive function. Try the 50-10 rule: 50 minutes of work followed by a 10-minute break.",
    type: "Break",
    source: "Huberman",
    actions: {
      primary: {
        label: "Set timer",
        action: "timer",
      },
      secondary: {
        label: "Learn more",
        action: "learn",
      },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
  },
  {
    id: "schedule-breaks",
    title: "Schedule strategic breaks",
    description:
      "Taking short breaks every 50-90 minutes can help maintain optimal focus and cognitive function throughout your workday.",
    type: "Break",
    source: "Huberman",
    actions: {
      primary: {
        label: "Set timer",
        action: "timer",
      },
      secondary: {
        label: "Learn more",
        action: "learn",
      },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6, // 6 days ago
  },
  {
    id: "morning-sunlight",
    title: "Morning sunlight exposure",
    description:
      "Getting 10-30 minutes of morning sunlight exposure can help regulate your circadian rhythm and improve focus during the day.",
    type: "Focus",
    source: "Huberman",
    actions: {
      primary: {
        label: "Set reminder",
        action: "reminder",
      },
      secondary: {
        label: "Learn more",
        action: "learn",
      },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
  },
  {
    id: "focus-enhancement",
    title: "Focus enhancement",
    description:
      "Try the Pomodoro technique: 25-minute focused work sessions with 5-minute breaks. This can significantly improve productivity.",
    type: "Focus",
    source: "Huberman",
    actions: {
      primary: {
        label: "Set reminder",
        action: "reminder",
      },
      secondary: {
        label: "Learn more",
        action: "learn",
      },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4, // 4 days ago
  },
  {
    id: "nsdr-protocol",
    title: "NSDR for focus recovery",
    description:
      "Non-Sleep Deep Rest (NSDR) for 10-20 minutes can help restore focus and cognitive function, especially in the afternoon slump.",
    type: "Focus",
    source: "Huberman",
    actions: {
      primary: {
        label: "Start NSDR",
        action: "timer",
      },
      secondary: {
        label: "Learn more",
        action: "learn",
      },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
  },
  {
    id: "cold-exposure",
    title: "Cold exposure for alertness",
    description:
      "Brief cold exposure (cold shower for 30-60 seconds) can increase alertness and focus through the release of epinephrine and norepinephrine.",
    type: "Energy",
    source: "Huberman",
    actions: {
      primary: {
        label: "Set reminder",
        action: "reminder",
      },
      secondary: {
        label: "Learn more",
        action: "learn",
      },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
  },
  {
    id: "caffeine-timing",
    title: "Optimize caffeine timing",
    description:
      "Wait 90-120 minutes after waking before consuming caffeine to work with your natural cortisol rhythm rather than against it.",
    type: "Energy",
    source: "Huberman",
    actions: {
      primary: {
        label: "Set reminder",
        action: "reminder",
      },
      secondary: {
        label: "Learn more",
        action: "learn",
      },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1, // 1 day ago
  },
  {
    id: "breathwork",
    title: "Physiological sigh for stress",
    description:
      "The physiological sigh (double inhale through nose, long exhale through mouth) can quickly reduce stress and improve focus.",
    type: "Stress",
    source: "Huberman",
    actions: {
      primary: {
        label: "Start practice",
        action: "timer",
      },
      secondary: {
        label: "Learn more",
        action: "learn",
      },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
  },
  {
    id: "sleep-consistency",
    title: "Maintain sleep consistency",
    description:
      "Going to bed and waking up at the same time each day helps optimize your circadian rhythm and cognitive function.",
    type: "Sleep",
    source: "Huberman",
    actions: {
      primary: {
        label: "Set reminder",
        action: "reminder",
      },
      secondary: {
        label: "Learn more",
        action: "learn",
      },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
  },
  {
    id: "exercise-timing",
    title: "Time your exercise strategically",
    description:
      "Exercise raises body temperature and alertness. Morning exercise can enhance focus, while evening exercise should end 2-3 hours before bedtime.",
    type: "Health",
    source: "Huberman",
    actions: {
      primary: {
        label: "Set reminder",
        action: "reminder",
      },
      secondary: {
        label: "Learn more",
        action: "learn",
      },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
  },
]

// Examine.com evidence-based recommendations
const examineRecommendations: Recommendation[] = [
  {
    id: "omega3-supplementation",
    title: "Omega-3 supplementation",
    description:
      "Research shows that omega-3 fatty acids can improve cognitive function and reduce inflammation. Aim for 1-2g of combined EPA/DHA daily.",
    type: "Health",
    source: "Examine",
    actions: {
      primary: {
        label: "Set reminder",
        action: "reminder",
      },
      secondary: {
        label: "Learn more",
        action: "learn",
      },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
  },
  {
    id: "hydration-cognition",
    title: "Optimize hydration for cognition",
    description:
      "Even mild dehydration can impair cognitive performance. Aim to drink water consistently throughout the day.",
    type: "Health",
    source: "Examine",
    actions: {
      primary: {
        label: "Set reminder",
        action: "reminder",
      },
      secondary: {
        label: "Learn more",
        action: "learn",
      },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
  },
  {
    id: "protein-timing",
    title: "Protein timing for stable energy",
    description:
      "Including protein with each meal helps maintain stable blood glucose and sustained energy levels throughout the day.",
    type: "Energy",
    source: "Examine",
    actions: {
      primary: {
        label: "Set reminder",
        action: "reminder",
      },
      secondary: {
        label: "Learn more",
        action: "learn",
      },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1, // 1 day ago
  },
]

export const useRecommendationsStore = create<RecommendationsState>()(
  persist(
    (set, get) => ({
      recommendations: [...hubermanProtocols, ...examineRecommendations],
      activeFilter: "All",

      generateRecommendations: (type) => {
        // In a real app, this would use AI to generate personalized recommendations
        // For now, we'll just filter the existing recommendations
        if (type) {
          set({ activeFilter: type })
        }
      },

      completeRecommendation: (id) => {
        set((state) => ({
          recommendations: state.recommendations.map((rec) =>
            rec.id === id ? { ...rec, completed: true, completedAt: Date.now() } : rec,
          ),
        }))
      },

      resetRecommendation: (id) => {
        set((state) => ({
          recommendations: state.recommendations.map((rec) =>
            rec.id === id ? { ...rec, completed: false, completedAt: undefined } : rec,
          ),
        }))
      },

      deleteRecommendation: (id) => {
        set((state) => ({
          recommendations: state.recommendations.filter((rec) => rec.id !== id),
        }))
      },

      setActiveFilter: (filter) => {
        set({ activeFilter: filter })
      },

      getFilteredRecommendations: () => {
        const { recommendations, activeFilter } = get()

        if (activeFilter === "All") {
          return recommendations
        }

        if (activeFilter === "Completed") {
          return recommendations.filter((rec) => rec.completed)
        }

        if (activeFilter === "Active") {
          return recommendations.filter((rec) => !rec.completed)
        }

        return recommendations.filter((rec) => rec.type === activeFilter)
      },

      clearCompletedRecommendations: () => {
        set((state) => ({
          recommendations: state.recommendations.filter((rec) => !rec.completed),
        }))
      },

      addCustomRecommendation: (recommendation) => {
        const id = Date.now().toString()

        set((state) => ({
          recommendations: [
            {
              ...recommendation,
              id,
              createdAt: Date.now(),
            },
            ...state.recommendations,
          ],
        }))

        return id
      },
    }),
    {
      name: "windryft-recommendations-storage",
    },
  ),
)
