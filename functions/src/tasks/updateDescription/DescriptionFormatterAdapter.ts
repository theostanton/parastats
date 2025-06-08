import { 
    DescriptionFormatter as CommonDescriptionFormatter, 
    WindProvider, 
    PreferencesProvider,
    FlightRow,
    StravaAthleteId,
    WindReport
} from "@parastats/common";
import { withPooledClient } from "@parastats/common";
import { FFVL } from "@/ffvlApi";
import { DescriptionPreferences } from "@/database/DescriptionPreferences";

// Adapter to bridge FFVL API to common WindProvider interface
class FFVLWindProvider implements WindProvider {
    async getReport(baliseId: string, date: Date): Promise<{ success: true; value: WindReport } | { success: false; error: string }> {
        const result = await FFVL.getReport(baliseId, date);
        
        if (result.success) {
            return {
                success: true,
                value: {
                    windKmh: result.value.windKmh,
                    gustKmh: result.value.gustKmh,
                    direction: result.value.direction
                }
            };
        } else {
            return { success: false, error: result.error };
        }
    }
}

// Adapter to bridge DescriptionPreferences to common PreferencesProvider interface
class DBPreferencesProvider implements PreferencesProvider {
    async get(pilotId: StravaAthleteId) {
        return await DescriptionPreferences.get(pilotId);
    }
}

export class DescriptionFormatter {
    static async create(flightRow: FlightRow): Promise<CommonDescriptionFormatter> {
        const preferencesProvider = new DBPreferencesProvider();
        return await CommonDescriptionFormatter.create(flightRow, preferencesProvider);
    }

    static async generateDescription(flightRow: FlightRow): Promise<string | null> {
        const formatter = await DescriptionFormatter.create(flightRow);
        const windProvider = new FFVLWindProvider();
        
        return withPooledClient(async (client) => {
            return await formatter.generate(client, windProvider);
        });
    }
}