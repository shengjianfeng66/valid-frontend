import { create, createStore } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"

interface FormData {
  product_name: string
  business_type: string
  target_users: string
  research_goal: string
  product_solution: {
    name: string
    size: number
    type: string
    file_path: string
  }[]
}

interface AttachmentItem {
  name: string
  size: number
  type: string
  url?: string
  originFileObj?: File // 原始文件对象
}

interface FormStore {
  formData: FormData
  attachments: AttachmentItem[]
  initialMessage: string
  setFormData: (data: Partial<FormData>) => void
  updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void
  setAttachments: (attachments: AttachmentItem[]) => void
  addAttachment: (attachment: AttachmentItem) => void
  removeAttachment: (index: number) => void
  clearAttachments: () => void
  setInitialMessage: (message: string) => void
  clearForm: () => void
  clearAll: () => void
  hasData: () => boolean
}

const initialFormData: FormData = {
  product_name: "",
  business_type: "",
  target_users: "",
  research_goal: "",
  product_solution: [],
}

export const useFormStore = create<FormStore>()((set, get) => ({
  formData: initialFormData,
  attachments: [],
  initialMessage: "",

  setFormData: (data) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }))
  },

  updateField: (field, value) => {
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    }))
  },

  setAttachments: (attachments) => {
    set({ attachments })
  },

  addAttachment: (attachment) => {
    set((state) => ({
      attachments: [...state.attachments, attachment],
    }))
  },

  removeAttachment: (index) => {
    set((state) => ({
      attachments: state.attachments.filter((_, i) => i !== index),
    }))
  },

  clearAttachments: () => {
    set({ attachments: [] })
  },

  setInitialMessage: (message) => {
    set({ initialMessage: message })
  },

  clearForm: () => {
    set({ formData: initialFormData })
  },

  clearAll: () => {
    set({
      formData: initialFormData,
      attachments: [],
      initialMessage: "",
    })
  },

  hasData: (): boolean => {
    const { formData } = get()
    return (
      formData.product_name.trim() !== "" ||
      formData.business_type.trim() !== "" ||
      formData.target_users.trim() !== "" ||
      formData.research_goal.trim() !== "" ||
      formData.product_solution.length > 0
    )
  },
}))
