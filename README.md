# Strava Goal Setter

This application was created by me to track my summer biking and walking goals.

## Deployment Instructions

To deploy the Strava Goal Setter, please ensure you have the following prerequisites set up:

- [Node.js](https://nodejs.org/) installed on your local machine.
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed. If you haven't installed it yet, you can do so globally using npm with the following command:
```bash
npm install -g @cloudflare/wrangler
```
- A Cloudflare account. If you don't have one, sign up at https://www.cloudflare.com/.
- A Strava account. If you don't have one, you can sign up at https://www.strava.com/register.
- An application on Strava. Create it by visiting https://www.strava.com/settings/api.

### Deployment Steps

1. **Clone the Project:**

Clone this project to your local machine using Git.

2. **Configure Environment Variables:**

- Rename `_wrangler.toml` to `wrangler.toml` and open it in a text editor.
- Set the following environment variables in the `wrangler.toml` file:
  - `CLIENT_ID`: Your application ID from Strava. Obtain it at https://www.strava.com/settings/api.
  - `GOALS`: Your goals in JSON format, where each key represents an [activity type](https://developers.strava.com/docs/reference/#api-models-ActivityType) and the value is the target number of kilometers. For example: `{"Walk": 250, "Ride": 500, "Swim": 200}`.
  - `CALLBACK_URL`: Set it to the domain of your API and add `/callback` at the end. For example: `https://strava-api.yourdomain.com/callback`.
  - `PASSWORD`: Password to access the `/stats` endpoint.


3. **Create a KV database**

Access your [Cloudflare dashboard](https://dash.cloudflare.com/), then navigate to Workers & Pages > KV and proceed to create a new namespace. Provide a name for the namespace and click Add. Upon creation, locate the namespace in the list below, and copy its unique ID.

In the `wrangler.toml` configuration file, ensure you paste the copied KV namespace ID into the appropriate section:
```toml
kv_namespaces = [
    { binding = "STRAVA_DATA",  id = "PASTE_YOUR_COPIED_KV_NAMESPACE_ID_HERE }
]
```

4. **Deploy the Worker:**

Deploy the Strava Goal Setter to Cloudflare Workers by running the following command in your project's root directory:
```bash
wrangler deploy
```
5. **Configure Environmental Secrets:**

Go to your [Cloudflare dashboard](https://dash.cloudflare.com/), navigate to Workers & Pages, select `strava-api`, and go to Settings > Variables > Edit Variables > Add Variable (check Encrypt). Configure the following environmental secrets:
- `ACCESS_TOKEN`: Obtain it from your Strava application settings at https://www.strava.com/settings/api.
- `CLIENT_SECRET`: Also available in your Strava application settings.

Congratulations! Your Strava Goal Setter app is now deployed and ready to help you achieve your goals this summer.

## License

The Strava Goal Setter app is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0). Feel free to modify and use it according to your needs.

