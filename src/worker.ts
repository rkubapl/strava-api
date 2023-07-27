/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */


import handler from './handler';

export default {
	async scheduled(controller, env, ctx) {
		const status = await handler.refreshToken(env)
		if(status) {
			const status2 = await handler.reloadData(env)
			console.log(status2 ? "Reloaded data!" : "Failed to reload data")
		}
	},
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	  return handler.handleRequest(request, env);
	}
} as ExportedHandler<Env>;
