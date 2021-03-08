
import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import css from "rollup-plugin-css-only";

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
				stdio: ["ignore", "inherit", "inherit"],
				shell: true
			});

			process.on("SIGTERM", toExit);
			process.on("exit", toExit);
		}
	};
}

export default ["login_dialog", "main_menu"].map( ( name, index ) => ( {
	input: `src/${name}.ts`,
	output: {
		sourcemap: true,
		format: "iife",
		name: `${name}`,
		file: `public/build/${name}.js`
	},
	plugins: [
		svelte({
			preprocess: sveltePreprocess( { sourceMap: !production } ),
			compilerOptions: { dev: !production }
		}),
		css( { output: `${name}.css` } ),
		resolve( {
			browser: true,
			dedupe: ["svelte"]
		} ),
		commonjs(),
		typescript( {
			sourceMap: !production,
			inlineSources: !production
		} ),
		!production && livereload( "public" ),
		production && terser(),
		( index === 0 ) ? !production && serve() : undefined
	],
	watch: { clearScreen: false }
} ) );
