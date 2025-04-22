"use client"

import { create } from "zustand"

// Define types for our store
export type Project = {
  id: string
  name: string
  description: string
  tasks: Task[]
  progress: number
  createdAt: string
  updatedAt: string
  deadline?: string
  category?: string
}

export type Task = {
  id: string
  title: string
  completed: boolean
  projectId: string
  createdAt: string
  updatedAt: string
  dueDate?: string
}

export type Session = {
  id: string
  projectId: string
  startTime: string
  endTime?: string
  duration?: number
  notes?: string
}

export type AIMessage = {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export type AIConversation = {
  id: string
  title: string
  messages: AIMessage[]
  createdAt: string
  updatedAt: string
}

type State = {
  projects: Project[]
  currentSession: Session | null
  aiConversations: AIConversation[]
  currentConversationId: string | null
}

type Actions = {
  addProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt" | "progress" | "tasks">) => void
  updateProject: (id: string, project: Partial<Project>) => void
  deleteProject: (id: string) => void
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTaskCompletion: (id: string) => void
  startSession: (projectId: string) => void
  endSession: (notes?: string) => void
  addAIMessage: (message: Omit<AIMessage, "timestamp">) => void
  createAIConversation: (title: string) => string
  setCurrentConversation: (id: string | null) => void
}

// Create the store with persist middleware
export const useStore = create<State & Actions>()((set, get) => ({
  projects: [],
  currentSession: null,
  aiConversations: [],
  currentConversationId: null,

  addProject: (project) => {
    const id = Math.random().toString(36).substring(2, 9)
    const now = new Date().toISOString()
    set((state) => ({
      projects: [
        ...state.projects,
        {
          ...project,
          id,
          createdAt: now,
          updatedAt: now,
          progress: 0,
          tasks: [],
        },
      ],
    }))
    return id
  },

  updateProject: (id, project) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...project, updatedAt: new Date().toISOString() } : p,
      ),
    }))
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    }))
  },

  addTask: (task) => {
    const id = Math.random().toString(36).substring(2, 9)
    const now = new Date().toISOString()
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === task.projectId
          ? {
              ...p,
              tasks: [
                ...p.tasks,
                {
                  ...task,
                  id,
                  createdAt: now,
                  updatedAt: now,
                  completed: false,
                },
              ],
              updatedAt: now,
            }
          : p,
      ),
    }))
  },

  updateTask: (id, task) => {
    set((state) => ({
      projects: state.projects.map((p) => ({
        ...p,
        tasks: p.tasks.map((t) => (t.id === id ? { ...t, ...task, updatedAt: new Date().toISOString() } : t)),
        updatedAt: new Date().toISOString(),
      })),
    }))
  },

  deleteTask: (id) => {
    set((state) => ({
      projects: state.projects.map((p) => ({
        ...p,
        tasks: p.tasks.filter((t) => t.id !== id),
        updatedAt: new Date().toISOString(),
      })),
    }))
  },

  toggleTaskCompletion: (id) => {
    set((state) => ({
      projects: state.projects.map((p) => {
        const updatedTasks = p.tasks.map((t) =>
          t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t,
        )

        // Calculate new progress
        const completedTasks = updatedTasks.filter((t) => t.completed).length
        const totalTasks = updatedTasks.length
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        return {
          ...p,
          tasks: updatedTasks,
          progress,
          updatedAt: new Date().toISOString(),
        }
      }),
    }))
  },

  startSession: (projectId) => {
    const id = Math.random().toString(36).substring(2, 9)
    set({
      currentSession: {
        id,
        projectId,
        startTime: new Date().toISOString(),
      },
    })
  },

  endSession: (notes) => {
    const { currentSession } = get()
    if (!currentSession) return

    const endTime = new Date().toISOString()
    const startDate = new Date(currentSession.startTime)
    const endDate = new Date(endTime)
    const duration = Math.round((endDate.getTime() - startDate.getTime()) / 1000) // in seconds

    set({ currentSession: null })
  },

  addAIMessage: (message) => {
    const { currentConversationId, aiConversations } = get()
    if (!currentConversationId) return

    set({
      aiConversations: aiConversations.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: [...conv.messages, { ...message, timestamp: new Date().toISOString() }],
              updatedAt: new Date().toISOString(),
            }
          : conv,
      ),
    })
  },

  createAIConversation: (title) => {
    const id = Math.random().toString(36).substring(2, 9)
    const now = new Date().toISOString()

    set((state) => ({
      aiConversations: [
        ...state.aiConversations,
        {
          id,
          title,
          messages: [],
          createdAt: now,
          updatedAt: now,
        },
      ],
      currentConversationId: id,
    }))

    return id
  },

  setCurrentConversation: (id) => {
    set({ currentConversationId: id })
  },
}))
