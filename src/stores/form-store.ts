import { create } from 'zustand';

interface FormData {
    productName: string;
    businessType: string;
    targetUsers: string;
    researchGoals: string;
    productSolution: ((File & { _content?: string })[]) | null;
}

interface AttachmentItem {
    name: string;
    size: number;
    type: string;
    url?: string;
    originFileObj?: File;  // 原始文件对象
}

interface FormStore {
    formData: FormData;
    attachments: AttachmentItem[];
    initialMessage: string;
    setFormData: (data: Partial<FormData>) => void;
    updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
    setAttachments: (attachments: AttachmentItem[]) => void;
    addAttachment: (attachment: AttachmentItem) => void;
    removeAttachment: (index: number) => void;
    clearAttachments: () => void;
    setInitialMessage: (message: string) => void;
    clearForm: () => void;
    clearAll: () => void;
    hasData: () => boolean;
}

const initialFormData: FormData = {
    productName: "",
    businessType: "",
    targetUsers: "",
    researchGoals: "",
    productSolution: [],
};

export const useFormStore = create<FormStore>()((set, get) => ({
    formData: initialFormData,
    attachments: [],
    initialMessage: "",

    setFormData: (data) => {
        set((state) => ({
            formData: { ...state.formData, ...data }
        }));
    },

    updateField: (field, value) => {
        set((state) => ({
            formData: { ...state.formData, [field]: value }
        }));
    },

    setAttachments: (attachments) => {
        set({ attachments });
    },

    addAttachment: (attachment) => {
        set((state) => ({
            attachments: [...state.attachments, attachment]
        }));
    },

    removeAttachment: (index) => {
        set((state) => ({
            attachments: state.attachments.filter((_, i) => i !== index)
        }));
    },

    clearAttachments: () => {
        set({ attachments: [] });
    },

    setInitialMessage: (message) => {
        set({ initialMessage: message });
    },

    clearForm: () => {
        set({ formData: initialFormData });
    },

    clearAll: () => {
        set({
            formData: initialFormData,
            attachments: [],
            initialMessage: ""
        });
    },

    hasData: (): boolean => {
        const { formData } = get();
        return formData.productName.trim() !== "" ||
            formData.businessType.trim() !== "" ||
            formData.targetUsers.trim() !== "" ||
            formData.researchGoals.trim() !== "" ||
            (formData.productSolution !== null && formData.productSolution.length > 0);
    }
}));
