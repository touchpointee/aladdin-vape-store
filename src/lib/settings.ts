export async function getWhatsAppNumber(): Promise<string> {
    try {
        // Since this is called from client components mostly or server components where full URL is needed
        // For server components, we can query DB directly if we wanted, but let's keep it simple with API for now
        // OR better: Server components query DB, Client components query API.

        // Actually, for client components, we need an async hook or effect. 
        // Let's make a simple fetcher we can use.
        const res = await fetch('/api/admin/settings?key=whatsapp_number');
        if (!res.ok) return '';
        const data = await res.json();
        return data.value || '';
    } catch (error) {
        console.error("Failed to fetch whatsapp number", error);
        return '';
    }
}
