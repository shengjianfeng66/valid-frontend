import { createClient } from "@/lib/supabase/client";
async function getAuthHeaders(): Promise<Record<string, string>> {
    try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        // console.log("🚀 ~ getAuthHeaders ~ session:", session)
        const token = session?.access_token;
        return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
        return {};
    }
}

export default getAuthHeaders;