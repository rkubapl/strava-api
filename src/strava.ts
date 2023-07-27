export default {
		async getAllActivities(token: string) {
			const response  = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=200",
					{headers: {'Authorization': 'Bearer ' + token}})

			return await response.json();
		}, async authorize(code: string, client_id: string, client_secret: string): Promise<any> {
			const response  = await fetch(`https://www.strava.com/oauth/token?client_id=${client_id}&client_secret=${client_secret}&code=${code}&grant_type=authorization_code`,
					{ method: "POST" })

			return await response.json();
		}, async refreshToken(refresh_token: string, client_id: string, client_secret: string): Promise<any> {
			const response  = await fetch(`https://www.strava.com/oauth/token?client_id=${client_id}&client_secret=${client_secret}&refresh_token=${refresh_token}&grant_type=refresh_token`,
			{ method: "POST" })

		return await response.json();
	}
}
