import strava from './strava';
import utills from './utills';

const corsHeaders = {
	'Access-Control-Allow-Headers': '*', // What headers are allowed. * is wildcard. Instead of using '*', you can specify a list of specific headers that are allowed, such as: Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Authorization.
	'Access-Control-Allow-Methods': 'GET', // Allowed methods. Others could be GET, PUT, DELETE etc.
	'Access-Control-Allow-Origin': '*', // This is URLs that are allowed to access the server. * is the wildcard character meaning any URL can.
}

interface Activity {
	name: string
	distance: number
	goal: number
}

export default {
	async handleRequest(request: Request, env: Env): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response("OK", {
				headers: corsHeaders
			});
		} else if (request.method === 'GET') {
			return this.handle(request, env);
		} else {
			return new Response("Method not allowed", {
				status: 405,
				headers: corsHeaders
			});
		}
	}, async handle(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url)

		if (url.pathname === "/stats") {
			//AUTH PASSWORD
			console.log(url.searchParams.get("password"))
			if (url.searchParams.get("password") !== env.PASSWORD) return new Response(JSON.stringify({ password: false }), { headers: corsHeaders });

			const dataString = await env.STRAVA_DATA.get("DATA");

			if (!dataString) return new Response(JSON.stringify({
				password: true,
				updateTime: -1,
				auth: false,
				stats: [],
				lastActivities: []
			}));

			const data = JSON.parse(dataString);
			const goals = JSON.parse(env.GOALS);

			const stats: Activity[] = []

			for (const [key, value] of Object.entries(goals)) {
				if (typeof value !== 'number') continue

				let activity: Activity = { name: key, distance: 0, goal: value };

				if (key in data.stats) activity.distance = data.stats[key];
				else activity.distance = 0

				stats.push(activity)
			}

			let updateTime = await env.STRAVA_DATA.get("UPDATE_TIME");
			const authorized = await env.STRAVA_DATA.get("AUTHORIZED");

			return new Response(JSON.stringify({
				password: true,
				stats,
				lastActivities: data.lastActivities,
				updateTime: (updateTime ? parseInt(updateTime) : -1),
				auth: (authorized === "true")
			}), {
				headers: {
					"content-type": "application/json;charset=UTF-8",
					...corsHeaders
				}
			});
		}

		if (url.pathname === "/authorize") {
			return Response.redirect(`https://www.strava.com/oauth/mobile/authorize?client_id=${env.CLIENT_ID}&redirect_uri=${env.CALLBACK_URL}&response_type=code&approval_prompt=auto&scope=activity:read_all`)
		}

		if (url.pathname === "/callback") {
			const code = url.searchParams.get("code");

			if (code == null) {
				return new Response("Invalid request", { headers: corsHeaders })
			}

			const json = await strava.authorize(code, env.CLIENT_ID, env.CLIENT_SECRET);

			if (json.errors) {
				return new Response("Error! \n" + JSON.stringify(json.errors))
			}

			if (json.athlete.id.toString() !== env.ATHLETE_ID) {
				return new Response("Wrong athlete.")
			}

			await env.STRAVA_DATA.put("ACCESS_TOKEN", json.access_token)
			await env.STRAVA_DATA.put("REFRESH_TOKEN", json.refresh_token)
			await env.STRAVA_DATA.put("EXPIRES_AT", json.expires_at)
			await env.STRAVA_DATA.put("AUTHORIZED", "true")

			const status = await this.reloadData(env)

			return new Response(`Authorized ${status ? "and loaded data from Strava!" : "but couldn't load data from Strava :("}`)
		}

		return new Response('{\"status\": \"OK\"}');
	}, async refreshToken(env: Env) {
		const expiresAt = await env.STRAVA_DATA.get("EXPIRES_AT");
		const authorized = await env.STRAVA_DATA.get("AUTHORIZED");

		if(expiresAt == null) {
			await env.STRAVA_DATA.put("AUTHORIZED", "false")
			return false;
		}

		if(authorized === "true" && parseInt(expiresAt.toString()) < this.getTimestampInSeconds()) {
			const refreshToken = await env.STRAVA_DATA.get("REFRESH_TOKEN");

			if(refreshToken)  {
				const json = await strava.refreshToken(refreshToken, env.CLIENT_ID, env.CLIENT_SECRET);

				if(json.access_token) {
					await env.STRAVA_DATA.put("ACCESS_TOKEN", json.access_token)
					await env.STRAVA_DATA.put("REFRESH_TOKEN", json.refresh_token)
					await env.STRAVA_DATA.put("EXPIRES_AT", json.expires_at)
					await env.STRAVA_DATA.put("AUTHORIZED", "true")

					console.log("REFRESHED TOKEN!")
					return true;
				}
			}
		} else {
			//CODE DOESN'T NEED REFRESHING
			return true;
		}

		await env.STRAVA_DATA.put("AUTHORIZED", "false")
		return false;
	}, async reloadData(env: Env) {
		const accessToken = await env.STRAVA_DATA.get("ACCESS_TOKEN");

		if(accessToken) {
			const data = await strava.getAllActivities(accessToken);

			if(data && data instanceof Array) {
				// await env.STRAVA_DATA.put("ADDITIONAL_ACTIVITIES", JSON.stringify([{"name":"Pielgrzymka na Jasną Górę","distance":120000,"type":"Walk","elapsed_time":0,"start_date": "2023-08-11T00:00:00.000Z"}]));
				const additionalActivities = await env.STRAVA_DATA.get("ADDITIONAL_ACTIVITIES");
				const processedData = utills.processActivities(data, additionalActivities ? JSON.parse(additionalActivities) : []);

				await env.STRAVA_DATA.put("DATA", JSON.stringify(processedData));
				await env.STRAVA_DATA.put("UPDATE_TIME", this.getTimestampInSeconds().toString());
				console.log("DATA UPDATED")
				return true;
			} else {
				console.log("NO DATA!")
				return false;
			}
		} else {
			console.log("NO ACCESS TOKEN")
			await env.STRAVA_DATA.put("AUTHORIZED", "false")
			return false;
		}
	},
  getTimestampInSeconds() : number {
		return Math.floor(Date.now() / 1000)
	}
}
