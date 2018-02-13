define(function (require) {

	var d3 = require('d3');

	return function (GEPPETTO) {
		// Enable local storage
		G.enableLocalStorage(false);

		window.turingTest = function(){
			Canvas1.setBackgroundColor("black");
			Canvas2.hide();
			Popup1.hide();
			Popup2.hide();
			VarVis1.hide();
			GEPPETTO.ComponentFactory.addWidget("CANVAS").then(function(w){
				w.setPosition(824,203);
				w.setSize(420.8,555.8);
				w.display([worm]);
				w.incrementCameraZoom(-0.1);
				w.setCameraPosition(50.100,302.085,227.304);
				w.setCameraRotation(-1.432,0.000,0.000,287.359);
				w.setBackgroundColor("white");
				$(".position-toolbar").remove();
				worm.setColor("black")
				worm.matter_2.hide();
				worm.matter_3.hide();
				w.setName("Blue Pill");
			});

			GEPPETTO.ComponentFactory.addWidget("MOVIEPLAYER").then(function(w){
				w.hide();
				w.load("https://www.youtube.com/watch?v=WJDoiR0KIFU");
				w.play();
				w.setPosition(254,203);
				w.setSize(420.8,555.8);
				w.setName("Red Pill");
				w.loop(true);
				window.loop();
				Project.getActiveExperiment().stop();
				GEPPETTO.ExperimentsController.playTimerStep = 120;
				Project.getActiveExperiment().play();
				w.show();
			});
		}

		window.loop = function(){
			GEPPETTO.ExperimentsController.playLoop=true;
		};

		window.lightUpCells = function () {
			for (var i = 1; i < 24; i++) {
				Canvas2.engine.colorController.addColorFunctionBulk(eval(i < 10 ? "c302_C2_FW.MDR0" + i + "[0]" : "c302_C2_FW.MDR" + i + "[0]"), [], [eval("worm.muscle_activation_" + (i + 69))], window.muscle_color)
			}
			for (var i = 1; i < 24; i++) {
				Canvas2.engine.colorController.addColorFunctionBulk(eval(i < 10 ? "c302_C2_FW.MVR0" + i + "[0]" : "c302_C2_FW.MVR" + i + "[0]"), [], [eval("worm.muscle_activation_" + (i + 46))], window.muscle_color)
			}

			for (var i = 1; i < 24; i++) {
				Canvas2.engine.colorController.addColorFunctionBulk(eval(i < 10 ? "c302_C2_FW.MVL0" + i + "[0]" : "c302_C2_FW.MVL" + i + "[0]"), [], [eval("worm.muscle_activation_" + (i + 23))], window.muscle_color)
			}
			for (var i = 1; i < 24; i++) {
				Canvas2.engine.colorController.addColorFunctionBulk(eval(i < 10 ? "c302_C2_FW.MDL0" + i + "[0]" : "c302_C2_FW.MDL" + i + "[0]"), [], [eval("worm.muscle_activation_" + i)], window.muscle_color)
			}
		}


		window.muscle_color = function (x) {
			return [0, x, 0];
		};

		window.voltage_color = function (x) {
			x = (x + 0.07) / 0.1; // normalization
			if (x < 0) { x = 0; }
			if (x > 1) { x = 1; }
			if (x < 0.25) {
				return [0, x * 4, 1];
			} else if (x < 0.5) {
				return [0, 1, (1 - (x - 0.25) * 4)];
			} else if (x < 0.75) {
				return [(x - 0.5) * 4, 1, 0];
			} else {
				return [1, (1 - (x - 0.75) * 4), 0];
			}
		};

		window.getNodeCustomColormap = function () {
			var cells = GEPPETTO.ModelFactory.getAllInstancesOf(
				GEPPETTO.ModelFactory.getAllTypesOfType(GEPPETTO.ModelFactory.geppettoModel.neuroml.network)[0])[0].getChildren();
			var domain = [];
			var range = [];
			for (var i = 0; i < cells.length; ++i) {
				if (cells[i].getMetaType() == GEPPETTO.Resources.ARRAY_INSTANCE_NODE)
					domain.push(cells[i].getName());
				else
					domain.push(cells[i].getPath());
				range.push(cells[i].getColor());
			}
			// if everything is default color, use a d3 provided palette as range
			if (range.filter(function (x) { return x !== GEPPETTO.Resources.COLORS.DEFAULT; }).length == 0)
				return d3.scaleOrdinal(d3.schemeCategory20).domain(domain);
			else
				return d3.scaleOrdinal(range).domain(domain);
		};

		window.showConnectivityMatrix = function (instance) {
			Model.neuroml.resolveAllImportTypes(function () {
				$(".osb-notification-text").html(Model.neuroml.importTypes.length + " projections and " + Model.neuroml.connection.getVariableReferences().length + " connections were successfully loaded.");
				if (GEPPETTO.ModelFactory.geppettoModel.neuroml.projection == undefined) {
					G.addWidget(1, { isStateless: true }).then(w => w.setMessage('No connection found in this network').setName('Warning Message'));
				} else {
					G.addWidget(6).then(w =>
						w.setData(instance, {
							linkType: function (c, linkCache) {
								if (linkCache[c.getParent().getPath()])
									return linkCache[c.getParent().getPath()];
								else if (GEPPETTO.ModelFactory.geppettoModel.neuroml.synapse != undefined) {
									var synapseType = GEPPETTO.ModelFactory.getAllVariablesOfType(c.getParent(), GEPPETTO.ModelFactory.geppettoModel.neuroml.synapse)[0];
									if (synapseType != undefined) {
										linkCache[c.getParent().getPath()] = synapseType.getId();
										return synapseType.getId();
									}
								}
								return c.getName().split("-")[0];
							},
							library: GEPPETTO.ModelFactory.geppettoModel.neuroml,
							colorMapFunction: window.getNodeCustomColormap
						}, window.getNodeCustomColormap())
							.setName('Connectivity Widget on network ' + instance.getId())
							.configViaGUI()
					);
				}
			});
		};

		//		//Canvas initialisation
		GEPPETTO.ComponentFactory.addComponent('CANVAS', {}, document.getElementById("sim"));

		GEPPETTO.ExperimentsController.playTimerStep = 100;

		//Logo initialization
		GEPPETTO.ComponentFactory.addComponent('LOGO', { logo: 'gpt-gpt_logo' }, document.getElementById("geppettologo"));

		//Logo initialization
		GEPPETTO.ComponentFactory.addComponent('LINKBUTTON', { left: 41, top: 390, icon: 'fa-github', url: 'https://github.com/openworm/org.geppetto' }, document.getElementById("github-logo"));

		//Control panel initialization
		GEPPETTO.ComponentFactory.addComponent('CONTROLPANEL', {
			useBuiltInFilters: true,
			enablePagination: true,
			resultsPerPage: 10
		}, document.getElementById("controlpanel"),
			function () {
				// whatever gets passed we keep
				var passThroughDataFilter = function (entities) {
					return entities;
				};

				// set data filter
				GEPPETTO.ControlPanel.setDataFilter(passThroughDataFilter);
			});


		//Spotlight initialization
		GEPPETTO.ComponentFactory.addComponent('SPOTLIGHT', {}, document.getElementById("spotlight"), function () {
			GEPPETTO.Spotlight.addSuggestion(GEPPETTO.Spotlight.plotSample, GEPPETTO.Resources.PLAY_FLOW);
		});

		//Foreground initialization
		GEPPETTO.ComponentFactory.addComponent('FOREGROUND', { dropDown: false }, document.getElementById("foreground-toolbar"));

		//Experiments table initialization
		GEPPETTO.ComponentFactory.addComponent('EXPERIMENTSTABLE', {}, document.getElementById("experiments"));

		//Home button initialization
		GEPPETTO.ComponentFactory.addComponent('HOME', {}, document.getElementById("HomeButton"));

		//Save initialization
		GEPPETTO.ComponentFactory.addComponent('SAVECONTROL', {}, document.getElementById("SaveButton"));

		//Simulation controls initialization
		GEPPETTO.ComponentFactory.addComponent('SIMULATIONCONTROLS', {}, document.getElementById("sim-toolbar"));

		//Share controls initialization
		GEPPETTO.ComponentFactory.addComponent('SHARE', {}, document.getElementById("share-button"));


	};
});
