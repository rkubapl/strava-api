export default {
	processActivities(activities: any[], additionalActivities: any[]) {
		let stats: {[key: string]: number} = {}

		// const additionalActivities = [{"name":"Pielgrzymka na Jasną Górę","distance":120000,"type":"Walk","elapsed_time":0,"start_date": "2023-08-11T00:00:00.000Z"}]
		activities.push(...additionalActivities);
		activities.sort((a,b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())

		console.log(JSON.stringify(activities))

		const lastActivitiesRaw = activities.slice(0, 9);

		let lastActivities = lastActivitiesRaw.map(activity => {
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

		// const additionalActivities = [{"name":"Pielgrzymka na Jasną Górę","distance":120000,"type":"Walk","elapsed_time":0,"date": new Date("2023-08-11T00:00:00.000Z")}]
		// lastActivities.push(...additionalActivities);
		//
		// console.log(JSON.stringify(lastActivities))
		//
		// lastActivities.sort((a,b) => {
		// 	return b.date.getTime() - a.date.getTime()
		// })
		//
		// lastActivities = lastActivities.slice(0, 6)

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
