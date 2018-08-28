class TerrainProgram extends ShaderProgram {
	constructor() {
		super();

		this._initConstants();
		this._initVariables();
		this._initFunctions();

		this.lastFrame = Date.now();
		this.flip = false;
		this.frames = 0;
	}

	_initConstants() {
		this.map_size = v2(this.width, this.height);
	}

	_initVariables() {
		this.height_map1 = new ShaderVariable(this);
		this.height_map2 = new ShaderVariable(this);

		this.flux_map1 = new ShaderVariable(this);
		this.flux_map2 = new ShaderVariable(this);

		this.velocity_map = new ShaderVariable(this);
	}

	_initFunctions() {
		// Initial map generation
		this.map_gen = new ShaderFunction(
			this,
			"terrain/mapgen.frag",
			{ map_size: this.map_size },
			{},
			this.height_map1
		);

		// Do inital step
		console.log('Doing initial mapgen');
		this.map_gen.render();
		console.log('Done');

		// Add rain at (0, 0)
		this.water_increment = new ShaderFunction(
			this,
			"terrain/passes/hydraulic/water_increment.frag",
			{ map_size: this.map_size },
			{ height_map: this.height_map1 },
			this.height_map2
		);

		// Outflow/Flux Step
		this.outflow_flux = new ShaderFunction(
			this,
			"terrain/passes/hydraulic/outflow_flux.frag",
			{ dt: { type: 'f', value: 0 }, map_size: this.map_size },
			{ flux_map: this.flux_map1, height_map: this.height_map2 },
			this.flux_map2
		);

		// Water Height Step
		this.water_height = new ShaderFunction(
			this,
			"terrain/passes/hydraulic/water_surface.frag",
			{ dt: { type: 'f', value: 0 }, map_size: this.map_size },
			{ flux_map: this.flux_map2, height_map: this.height_map2 },
			this.height_map1
		);

		this.velocity_field = new ShaderFunction(
			this,
			"terrain/passes/hydraulic/velocity_field.frag",
			{  map_size: this.map_size  },
			{ flux_map: this.flux_map2, height_map: this.height_map1 },
			this.velocity_map
		);

		this.erosion_deposition = new ShaderFunction(
			this,
			"terrain/passes/hydraulic/erosion_deposition.frag",
			{ map_size: this.map_size },
			{ height_map: this.height_map1, velocity_map: this.velocity_map },
			this.height_map2
		);

		this.transportation_evaporation = new ShaderFunction(
			this,
			"terrain/passes/hydraulic/transportation_evaporation.frag",
			{ dt: { type: 'f', value: 0 }, map_size: this.map_size },
			{ height_map: this.height_map2, flux_map: this.flux_map2, velocity_map: this.velocity_map },
			this.height_map1
		);

		this.pretty = new ShaderFunction(
			this,
			"terrain/colorShader.frag",
			{ map_size: this.map_size },
			{ height_map: this.height_map1 },
			undefined
		);

		this.debug = new ShaderFunction(
			this,
			"terrain/debugShader.frag",
			{ map_size: this.map_size },
			{ debug_map: this.velocity_map },
			undefined
		);

		this.map_gen.render();
		this.water_increment.render();
	}

	frame() {
		const dt = { type: 'f', value: (Date.now() - this.lastFrame) / 1000 };
		this.lastFrame = Date.now();

		if ( this.flip ) {
			this.outflow_flux.variables['flux_map'] = this.flux_map2;
			this.outflow_flux.output = this.flux_map1;

			this.water_height.variables['flux_map'] = this.flux_map1;
			this.velocity_field.variables['flux_map'] = this.flux_map1;
			this.transportation_evaporation.variables['flux_map'] = this.flux_map1;

			// this.debug.variables['debug_map'] = this.flux_map1;
		}
		else {
			this.outflow_flux.variables['flux_map'] = this.flux_map1;
			this.outflow_flux.output = this.flux_map2;

			this.water_height.variables['flux_map'] = this.flux_map2;
			this.velocity_field.variables['flux_map'] = this.flux_map2;
			this.transportation_evaporation.variables['flux_map'] = this.flux_map2;

			// this.debug.variables['debug_map'] = this.flux_map2;
		}

		this.outflow_flux.constants['dt'] = dt;
		this.transportation_evaporation.constants['dt'] = dt;
		this.water_height.constants['dt'] = dt;

		this.flip = !this.flip;

		this.outflow_flux.render();
		this.water_height.render();
		this.velocity_field.render();
		this.erosion_deposition.render();
		this.transportation_evaporation.render();
		// this.debug.render();
		this.pretty.render();

		// Debug info
		const flux = this.flux_map2.rawData;
		const avg_flux = flux.reduce((a, b) => a + b, 0.0) / flux.length;
		const vel = this.velocity_map.rawData;
		const avg_vel = vel.reduce((a, b) => a + b, 0.0) / vel.length;
		console.log('Avg flux / vel', avg_flux.toFixed(24), avg_vel.toFixed(24));
		this.frames++;
	}
}
const program = new TerrainProgram();

window.setInterval(() => {
	program.frame();
}, 1000 / 60);