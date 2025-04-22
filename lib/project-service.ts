import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabase"

export type ProjectStatus = "On track" | "Needs attention" | "At risk" | "Completed"
export type ProjectType = "Design" | "Development" | "Content" | "Research" | "Marketing"

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  completedAt?: string
  dueDate?: string
  user_id?: string
}

export interface Project {
  id: string
  title: string
  description: string
  progress: number
  status: ProjectStatus
  deadline: string | null
  type: ProjectType
  createdAt: string
  updatedAt: string
  files: number
  user_id?: string
}

export interface ProjectNote {
  id: string
  projectId: string
  content: string
  createdAt: string
  updatedAt: string
  user_id?: string
}

export interface ProjectFile {
  id: string
  projectId: string
  name: string
  type: string
  size: number
  url: string
  createdAt: string
  user_id?: string
}

interface ProjectState {
  projects: Project[]
  tasks: Task[]
  notes: ProjectNote[]
  files: ProjectFile[]
  isLoading: boolean
  error: string | null
  initialized: boolean
  addProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => Promise<string>
  updateProject: (id: string, updates: Partial<Omit<Project, "id" | "createdAt">>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<string>
  updateTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => Promise<void>
  toggleTaskCompletion: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  addNote: (note: Omit<ProjectNote, "id" | "createdAt" | "updatedAt">) => Promise<string>
  updateNote: (id: string, content: string) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  addFile: (file: Omit<ProjectFile, "id" | "createdAt">) => Promise<string>
  deleteFile: (id: string) => Promise<void>
  getProjectById: (id: string) => Project | undefined
  getTasksByProjectId: (projectId: string) => Task[]
  getNotesByProjectId: (projectId: string) => ProjectNote[]
  getFilesByProjectId: (projectId: string) => ProjectFile[]
  calculateProjectProgress: (projectId: string) => number
  resetAllData: () => Promise<void>
  fetchUserData: () => Promise<void>
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      tasks: [],
      notes: [],
      files: [],
      isLoading: false,
      error: null,
      initialized: false,

      fetchUserData: async () => {
        try {
          set({ isLoading: true, error: null })

          // Get current user
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) {
            set({ isLoading: false, error: "User not authenticated" })
            return
          }

          // Fetch projects
          const { data: projects, error: projectsError } = await supabase
            .from("projects")
            .select("*")
            .eq("user_id", user.id)

          if (projectsError) throw projectsError

          // Fetch tasks
          const { data: tasks, error: tasksError } = await supabase.from("tasks").select("*").eq("user_id", user.id)

          if (tasksError) throw tasksError

          // Fetch notes
          const { data: notes, error: notesError } = await supabase
            .from("project_notes")
            .select("*")
            .eq("user_id", user.id)

          if (notesError) throw notesError

          // Fetch files
          const { data: files, error: filesError } = await supabase
            .from("project_files")
            .select("*")
            .eq("user_id", user.id)

          if (filesError) throw filesError

          set({
            projects: projects || [],
            tasks: tasks || [],
            notes: notes || [],
            files: files || [],
            isLoading: false,
            initialized: true,
          })
        } catch (error) {
          console.error("Error fetching user data:", error)
          set({ isLoading: false, error: "Failed to fetch data" })
        }
      },

      addProject: async (project) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) throw new Error("User not authenticated")

          const now = new Date().toISOString()
          const newProject = {
            ...project,
            createdAt: now,
            updatedAt: now,
            user_id: user.id,
          }

          const { data, error } = await supabase.from("projects").insert(newProject).select().single()

          if (error) throw error

          set((state) => ({
            projects: [...state.projects, data],
          }))

          return data.id
        } catch (error) {
          console.error("Error adding project:", error)
          throw error
        }
      },

      updateProject: async (id, updates) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) throw new Error("User not authenticated")

          const updatedProject = {
            ...updates,
            updatedAt: new Date().toISOString(),
          }

          const { error } = await supabase.from("projects").update(updatedProject).eq("id", id).eq("user_id", user.id)

          if (error) throw error

          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === id ? { ...project, ...updatedProject } : project,
            ),
          }))
        } catch (error) {
          console.error("Error updating project:", error)
          throw error
        }
      },

      deleteProject: async (id) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) throw new Error("User not authenticated")

          // Delete project
          const { error: projectError } = await supabase.from("projects").delete().eq("id", id).eq("user_id", user.id)

          if (projectError) throw projectError

          // Delete related tasks
          const { error: tasksError } = await supabase.from("tasks").delete().eq("projectId", id).eq("user_id", user.id)

          if (tasksError) throw tasksError

          // Delete related notes
          const { error: notesError } = await supabase
            .from("project_notes")
            .delete()
            .eq("projectId", id)
            .eq("user_id", user.id)

          if (notesError) throw notesError

          // Delete related files
          const { error: filesError } = await supabase
            .from("project_files")
            .delete()
            .eq("projectId", id)
            .eq("user_id", user.id)

          if (filesError) throw filesError

          set((state) => ({
            projects: state.projects.filter((project) => project.id !== id),
            tasks: state.tasks.filter((task) => task.projectId !== id),
            notes: state.notes.filter((note) => note.projectId !== id),
            files: state.files.filter((file) => file.projectId !== id),
          }))
        } catch (error) {
          console.error("Error deleting project:", error)
          throw error
        }
      },

      addTask: async (task) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) throw new Error("User not authenticated")

          const newTask = {
            ...task,
            createdAt: new Date().toISOString(),
            user_id: user.id,
          }

          const { data, error } = await supabase.from("tasks").insert(newTask).select().single()

          if (error) throw error

          set((state) => ({
            tasks: [...state.tasks, data],
          }))

          // Recalculate project progress
          const projectId = task.projectId
          const progress = get().calculateProjectProgress(projectId)
          await get().updateProject(projectId, { progress })

          return data.id
        } catch (error) {
          console.error("Error adding task:", error)
          throw error
        }
      },

      updateTask: async (id, updates) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) throw new Error("User not authenticated")

          const { error } = await supabase.from("tasks").update(updates).eq("id", id).eq("user_id", user.id)

          if (error) throw error

          let projectId: string | null = null

          set((state) => {
            const updatedTasks = state.tasks.map((task) => {
              if (task.id === id) {
                projectId = task.projectId
                return { ...task, ...updates }
              }
              return task
            })

            return { tasks: updatedTasks }
          })

          // Recalculate project progress if we have a projectId
          if (projectId) {
            const progress = get().calculateProjectProgress(projectId)
            await get().updateProject(projectId, { progress })
          }
        } catch (error) {
          console.error("Error updating task:", error)
          throw error
        }
      },

      toggleTaskCompletion: async (id) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) throw new Error("User not authenticated")

          let projectId: string | null = null
          const now = new Date().toISOString()

          // Get current task state
          const task = get().tasks.find((t) => t.id === id)
          if (!task) throw new Error("Task not found")

          const completed = !task.completed
          const updates = {
            completed,
            completedAt: completed ? now : null,
          }

          const { error } = await supabase.from("tasks").update(updates).eq("id", id).eq("user_id", user.id)

          if (error) throw error

          set((state) => {
            const updatedTasks = state.tasks.map((task) => {
              if (task.id === id) {
                projectId = task.projectId
                return {
                  ...task,
                  completed,
                  completedAt: completed ? now : undefined,
                }
              }
              return task
            })

            return { tasks: updatedTasks }
          })

          // Recalculate project progress if we have a projectId
          if (projectId) {
            const progress = get().calculateProjectProgress(projectId)
            await get().updateProject(projectId, { progress })
          }
        } catch (error) {
          console.error("Error toggling task completion:", error)
          throw error
        }
      },

      deleteTask: async (id) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) throw new Error("User not authenticated")

          let projectId: string | null = null
          const task = get().tasks.find((t) => t.id === id)
          if (task) projectId = task.projectId

          const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id)

          if (error) throw error

          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          }))

          // Recalculate project progress if we have a projectId
          if (projectId) {
            const progress = get().calculateProjectProgress(projectId)
            await get().updateProject(projectId, { progress })
          }
        } catch (error) {
          console.error("Error deleting task:", error)
          throw error
        }
      },

      addNote: async (note) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) throw new Error("User not authenticated")

          const now = new Date().toISOString()
          const newNote = {
            ...note,
            createdAt: now,
            updatedAt: now,
            user_id: user.id,
          }

          const { data, error } = await supabase.from("project_notes").insert(newNote).select().single()

          if (error) throw error

          set((state) => ({
            notes: [...state.notes, data],
          }))

          return data.id
        } catch (error) {
          console.error("Error adding note:", error)
          throw error
        }
      },

      updateNote: async (id, content) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) throw new Error("User not authenticated")

          const updates = {
            content,
            updatedAt: new Date().toISOString(),
          }

          const { error } = await supabase.from("project_notes").update(updates).eq("id", id).eq("user_id", user.id)

          if (error) throw error

          set((state) => ({
            notes: state.notes.map((note) => (note.id === id ? { ...note, ...updates } : note)),
          }))
        } catch (error) {
          console.error("Error updating note:", error)
          throw error
        }
      },

      deleteNote: async (id) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) throw new Error("User not authenticated")

          const { error } = await supabase.from("project_notes").delete().eq("id", id).eq("user_id", user.id)

          if (error) throw error

          set((state) => ({
            notes: state.notes.filter((note) => note.id !== id),
          }))
        } catch (error) {
          console.error("Error deleting note:", error)
          throw error
        }
      },

      addFile: async (file) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) throw new Error("User not authenticated")

          const newFile = {
            ...file,
            createdAt: new Date().toISOString(),
            user_id: user.id,
          }

          const { data, error } = await supabase.from("project_files").insert(newFile).select().single()

          if (error) throw error

          set((state) => ({
            files: [...state.files, data],
          }))

          // Update file count in project
          const projectId = file.projectId
          const projectFiles = get().getFilesByProjectId(projectId).length + 1
          await get().updateProject(projectId, { files: projectFiles })

          return data.id
        } catch (error) {
          console.error("Error adding file:", error)
          throw error
        }
      },

      deleteFile: async (id) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) throw new Error("User not authenticated")

          let projectId: string | null = null
          const file = get().files.find((f) => f.id === id)
          if (file) projectId = file.projectId

          const { error } = await supabase.from("project_files").delete().eq("id", id).eq("user_id", user.id)

          if (error) throw error

          set((state) => ({
            files: state.files.filter((file) => file.id !== id),
          }))

          // Update file count in project
          if (projectId) {
            const projectFiles = get().getFilesByProjectId(projectId).length
            await get().updateProject(projectId, { files: projectFiles })
          }
        } catch (error) {
          console.error("Error deleting file:", error)
          throw error
        }
      },

      getProjectById: (id) => {
        return get().projects.find((project) => project.id === id)
      },

      getTasksByProjectId: (projectId) => {
        return get().tasks.filter((task) => task.projectId === projectId)
      },

      getNotesByProjectId: (projectId) => {
        return get().notes.filter((note) => note.projectId === projectId)
      },

      getFilesByProjectId: (projectId) => {
        return get().files.filter((file) => file.projectId === projectId)
      },

      calculateProjectProgress: (projectId) => {
        const tasks = get().getTasksByProjectId(projectId)

        if (tasks.length === 0) {
          return 0
        }

        const completedTasks = tasks.filter((task) => task.completed)
        return Math.round((completedTasks.length / tasks.length) * 100)
      },

      resetAllData: async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (!user) throw new Error("User not authenticated")

          // Delete all user data from Supabase
          const { error: projectsError } = await supabase.from("projects").delete().eq("user_id", user.id)

          if (projectsError) throw projectsError

          const { error: tasksError } = await supabase.from("tasks").delete().eq("user_id", user.id)

          if (tasksError) throw tasksError

          const { error: notesError } = await supabase.from("project_notes").delete().eq("user_id", user.id)

          if (notesError) throw notesError

          const { error: filesError } = await supabase.from("project_files").delete().eq("user_id", user.id)

          if (filesError) throw filesError

          // Reset local state
          set({
            projects: [],
            tasks: [],
            notes: [],
            files: [],
          })
        } catch (error) {
          console.error("Error resetting data:", error)
          throw error
        }
      },
    }),
    {
      name: "windryft-project-storage",
    },
  ),
)

// Fix the deleteTask function to properly handle the Promise
export const deleteTask = async (taskId: string) => {
  try {
    // Ensure taskId is a string, not a Promise
    if (taskId instanceof Promise) {
      taskId = await taskId // Resolve the promise to get the actual ID
    }

    const { error } = await supabase.from("tasks").delete().eq("id", taskId)

    if (error) {
      console.error("Error deleting task:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error deleting task:", error)
    throw error
  }
}
