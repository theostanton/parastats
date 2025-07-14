import { 
    DescriptionFormatter as CommonDescriptionFormatter, 
    PreferencesProvider,
    FlightRow,
    StravaAthleteId,
    WindReport,
    withPooledClient,
    DescriptionPreferences,
    isSuccess
} from "@parastats/common";
import { FFVL } from "@/ffvlApi";

// Adapter to bridge FFVL API to common WindProvider interface
class FFVLWindProvider {
    async getReport(baliseId: string, date: Date): Promise<{ success: true; value: WindReport } | { success: false; error: string }> {
        const result = await FFVL.getReport(baliseId, date);
        
        if (isSuccess(result)) {
            const [windReport] = result;
            return {
                success: true,
                value: {
                    windKmh: windReport.windKmh,
                    gustKmh: windReport.gustKmh,
                    direction: windReport.direction as any
                }
            };
        } else {
            const [, error] = result;
            return { success: false, error };
        }
    }
}

// Adapter to bridge DescriptionPreferences to common PreferencesProvider interface
class DBPreferencesProvider implements PreferencesProvider {
    async get(pilotId: StravaAthleteId): Promise<{ success: true; value: any } | { success: false; error: string }> {
        const result = await DescriptionPreferences.get(pilotId);
        
        if (isSuccess(result)) {
            const [preferences] = result;
            return { success: true, value: preferences };
        } else {
            const [, error] = result;
            return { success: false, error };
        }
    }
}

export class DescriptionFormatter {
    static async create(flightRow: FlightRow): Promise<CommonDescriptionFormatter> {
        const preferencesProvider = new DBPreferencesProvider();
        return await CommonDescriptionFormatter.create(flightRow, preferencesProvider);
    }

    static async generateDescription(flightRow: FlightRow): Promise<string | null> {
        const formatter = await DescriptionFormatter.create(flightRow);
        const windProvider = new FFVLWindProvider() as any;
        
        return withPooledClient(async (client) => {
            return await formatter.generate(client, windProvider);
        });
    }
}