// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
	// Remove experimental.serverComponentsExternalPackages
	// Use serverExternalPackages instead
	serverExternalPackages: ["mongoose"],

	// Turbopack configuration (replaces webpack config)
	turbopack: {
		// Configure resolve aliases if needed
		resolveAlias: {
			// Add any aliases here if needed
		},
		// Configure resolve extensions
		resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
	},

	// If you still need webpack for some reason (not recommended),
	// you can silence the error by adding an empty turbopack config
	// and use the --webpack flag when building
};

module.exports = nextConfig;
