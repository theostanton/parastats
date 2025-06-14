import { UpdateDescriptionTask, TaskResult, StravaActivityId, FlightRow } from '@parastats/common/src/model';
import { DescriptionFormatter, PreferencesProvider, withPooledClient } from '@parastats/common';
import { Pilots } from '../model/database/Pilots';
import { Flights } from '../model/database/Flights';
import { DescriptionPreferences } from '../model/database/DescriptionPreferences';
import { StravaApi } from '../model/stravaApi';

export async function executeUpdateDescriptionTask(
    task: UpdateDescriptionTask
): Promise<TaskResult> {
    console.log(`Executing UpdateDescription for flightId=${task.flightId}`);

    // Fetch flight from database
    const flightResult = await Flights.get(task.flightId);
    if (!flightResult.success) {
        return {
            success: false,
            message: `No flight rows for flightId=${task.flightId}: ${flightResult.error}`
        };
    }
    const flight = flightResult.value;

    // Generate description with preferences snapshot
    const statsResult = await generateStatsWithPreferences(flight);

    if (statsResult.description === null) {
        console.log("Skipping because description is null");
        return {
            success: true,
        };
    }

    const newStats = statsResult.description;
    const preferencesSnapshot = statsResult.preferences;

    // Check if description is already formatted
    const alreadyFormatted = flight.description.includes("🌐 paragliderstats.com");

    // Generate the new description
    let updatedDescription: string;
    if (alreadyFormatted) {
        console.log("Updating existing formatted description");
        updatedDescription = flight.description.replace(/(?:[🪂↘️↗️])[\s\S]*paragliderstats.com/, newStats);
    } else {
        console.log("Appending stats to description");
        updatedDescription = flight.description.replace(`🪂 ${flight.wing}`, newStats);
    }

    console.log('Updated description:');
    console.log(updatedDescription);
    console.log();

    // Update Strava activity description
    const pilotResult = await Pilots.get(flight.pilot_id);
    if (!pilotResult.success) {
        return {
            success: false,
            message: `Couldn't get pilot for pilotId=${flight.pilot_id}: ${pilotResult.error}`
        };
    }

    const stravaApi = await StravaApi.fromUserId(pilotResult.value.pilot_id);
    const updateResult = await stravaApi.updateDescription(flight.strava_activity_id, updatedDescription);
    if (!updateResult.success) {
        return {
            success: false,
            message: updateResult.error || 'Failed to update Strava description'
        };
    }

    // Store updated description in database
    const dbUpdateResult = await Flights.updateDescription(
        task.flightId, 
        updatedDescription
    );
    if (!dbUpdateResult.success) {
        return {
            success: false,
            message: `Failed to update database: ${dbUpdateResult.error}`
        };
    }

    console.log(`Successfully updated description for flight ${task.flightId}`);
    return {
        success: true
    };
}

/**
 * Generate description stats with preferences using Result pattern
 */
async function generateStatsWithPreferences(flight: FlightRow): Promise<{ description: string | null; preferences: any }> {
    return withPooledClient(async (client) => {
        // Create preferences provider that adapts the Result pattern
        const preferencesProvider: PreferencesProvider = {
            get: async (pilotId) => {
                const result = await DescriptionPreferences.get(pilotId);
                if (result.success) {
                    return { success: true, value: result.value };
                } else {
                    return { success: false, error: result.error };
                }
            }
        };

        // Create formatter
        const formatter = await DescriptionFormatter.create(flight, preferencesProvider);
        
        // Generate description 
        const description = await formatter.generate(client);
        
        return {
            description,
            preferences: null // TODO: expose preferences from formatter or handle differently
        };
    });
}