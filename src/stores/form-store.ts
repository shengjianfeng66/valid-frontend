import { create } from 'zustand';

interface FormData {
    productName: string;
    businessType: string;
    targetUsers: string;
    researchGoals: string;
    productSolution: (File & { _content?: string }) | null;
}

interface FormStore {
    formData: FormData;
    setFormData: (data: Partial<FormData>) => void;
    updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
    clearForm: () => void;
    hasData: () => boolean;
}

const initialFormData: FormData = {
    productName: "",
    businessType: "",
    targetUsers: "",
    researchGoals: "",
    productSolution: null,
};

export const useFormStore = create<FormStore>()((set, get) => ({
    formData: initialFormData,

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

    clearForm: () => {
        set({ formData: initialFormData });
    },

    hasData: () => {
        const { formData } = get();
        return formData.productName.trim() !== "" ||
            formData.businessType.trim() !== "" ||
            formData.targetUsers.trim() !== "" ||
            formData.researchGoals.trim() !== "" ||
            formData.productSolution !== null;
    }
}));
