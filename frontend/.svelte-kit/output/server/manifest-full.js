export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "app",
	appPath: "portal/app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"app/immutable/entry/start.DUDIr43e.js",app:"app/immutable/entry/app.BxGK2vR9.js",imports:["app/immutable/entry/start.DUDIr43e.js","app/immutable/chunks/BWsengzb.js","app/immutable/chunks/DNo6DNG-.js","app/immutable/chunks/BXVTs2KG.js","app/immutable/entry/app.BxGK2vR9.js","app/immutable/chunks/DNo6DNG-.js","app/immutable/chunks/DsnmJJEf.js","app/immutable/chunks/D7l3XPer.js","app/immutable/chunks/DmQgnB4J.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
