class TerrainProgram extends ShaderProgram {
	constructor() {
		super();

		this._initConstants();
		this._initVariables();
		this._initFunctions();

		this.lastFrame = Date.now();
		this.flip = false;
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
		this.map_gen.render();

		// Add rain at (0, 0)
		this.water_increment = new ShaderFunction(
			this,
			"terrain/passes/hydraulic/water_increment.frag",
			{},
			{ height_map: this.height_map1 },
			undefined // this.height_map2
		);

		// // Outflow/Flux Step
		// this.outflow_flux = new ShaderFunction(
		// 	this,
		// 	"terrain/passes/hydraulic/outflow_flux.frag",
		// 	{ dt: { type: 'f', value: 0 }, map_size: this.map_size },
		// 	{ flux_map: this.flux_map1, height_map: this.height_map2 },
		// 	this.flux_map2
		// );

		// // Water Height Step
		// this.water_height = new ShaderFunction(
		// 	this,
		// 	"terrian/passes/hydraulic/water_surface.frag",
		// 	{},
		// 	{ flux_map: this.flux_map2, height_map: this.height_map2 },
		// 	this.height_map1
		// );

		// this.velocity_field = new ShaderFunction(
		// 	this,
		// 	"terrain/passes/hydraulic/velocity_field.frag",
		// 	{},
		// 	{ flux_map: this.flux_map2, height_map: this.height_map1 },
		// 	this.velocity_map
		// );

		// this.erosion_deposition = new ShaderFunction(
		// 	this,
		// 	"terrain/passes/hydraulic/erosion_deposition.frag",
		// 	{},
		// 	{ height_map: this.height_map1, velocity_map: this.velocity_map },
		// 	this.height_map2
		// );

		// this.transportation_evaporation = new ShaderFunction(
		// 	this,
		// 	"terrain/passes/hydraulic/transportation_evaporation.frag",
		// 	{ dt: { type: 'f', value: 0 }, map_size: this.map_size },
		// 	{ height_map: this.height_map2, flux_map: this.flux_map2, velocity_map: this.velocity_map },
		// 	this.height_map1
		// );

		// this.pretty = new ShaderFunction(
		// 	this,
		// 	"terrain/colorShader.frag",
		// 	{},
		// 	{ height_map: this.height_map1 },
		// 	undefined
		// );
	}

	frame() {
		// const dt = { type: 'f', value: (Date.now() - this.lastFrame) / 1000 };
		// this.lastFrame = Date.now();

		// if ( this.flip ) {
		// 	this.outflow_flux.variables['flux_map'] = this.flux_map2;
		// 	this.outflow_flux.output = this.flux_map1;

		// 	this.water_height.variables['flux_map'] = this.flux_map1;
		// 	this.velocity_field.variables['flux_map'] = this.flux_map1;
		// 	this.transportation_evaporation.variables['flux_map'] = this.flux_map1;
		// }
		// else {
		// 	this.outflow_flux.variables['flux_map'] = this.flux_map1;
		// 	this.outflow_flux.output = this.flux_map2;

		// 	this.water_height.variables['flux_map'] = this.flux_map2;
		// 	this.velocity_field.variables['flux_map'] = this.flux_map2;
		// 	this.transportation_evaporation.variables['flux_map'] = this.flux_map2;
		// }

		// this.outflow_flux.constants['dt'] = dt;
		// this.transportation_evaporation.constants['dt'] = dt;

		// this.flip = !this.flip;

		this.water_increment.render();
		// this.outflow_flux.render();
		// this.water_height.render();
		// this.velocity_field.render();
		// this.erosion_deposition.render();
		// this.transportation_evaporation.render();
		// this.pretty.render();
	}
}
const program = new TerrainProgram();
program.start();