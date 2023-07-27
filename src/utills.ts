export default {
	processActivities(activities: any[]) {
		let stats: {[key: string]: number} = {}

		const lastActivitiesRaw = activities.slice(0, 6);

		const lastActivities = lastActivitiesRaw.map(activity => {
			const {name, distance, type, elapsed_time, start_date} = activity;
			const localDate = new Date(start_date);

			const date = new Date(localDate);
			//FOR SAFETY REMOVING TIME OF ACTIVITY
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);

			return {name, distance, type, elapsed_time, date};
		})

		activities.forEach(activity => {
			stats[activity.type] |= 0
			stats[activity.type] += activity.distance
		})

		let newStats: {[key: string]: number} = {};
		for (const [key, value] of Object.entries(stats)) {
			newStats[key] = Number((value / 1000).toFixed(3));
		}

		return {stats: newStats, lastActivities}
	}
}
