define(
	[
		"jquery",
		"class",
		"sphere",
		"three",
		"js/lib/stats.min.js",
		"js/lib/tween.min.js",
		"js/view_1.js",
		"js/view_sine.js",
		"js/view_random.js",
		"js/view_box2d.js"
	],

	function($, Class, Sphere, THREE, Stats, TWEEN, View_1, View_sine, View_random, View_box2d) {
    //the jquery.alpha.js and jquery.beta.js plugins have been loaded.
   // $(function() {
        //$('body').alpha().beta();
       // console.log(Class);

    var Main = {

        camera: null, scene: null, projector: null, raycaster: null, renderer:null, particle: null,
        INTERSECTED: null, FOCUSED: null,

        Spheres : [],
        Views : [],
        currentView : 0,
        activeSphere : 0,

        init: function(scene, Spheres){
	        this.initTHREEjs();

	    	this.makeBox2dStaticRect(0, 100, 300, 5);
			this.makeBox2dStaticRect(-100, 0, 5, 200);
			this.makeBox2dStaticRect(100, 0, 5, 200);

			var that = this;
			$.getJSON('spheres.json', function(data) {

				data.spheres.sort(function(a,b) { return parseFloat(b.d) - parseFloat(a.d); } );

				$('h1').html(data.spheres.length + " Spheres!");

				$.each(data.spheres, function(key, sphereData) {

					sphereData.id = key;
					sphereData.position = {x: 0, y: 0, z: 0};

					that.addSphere(sphereData);

					

				});

				that.makeViewMenu();
				that.Views[that.currentView].intro();
				that.animate();

			});
		},

		addSphere: function(sphereData){
			var s = new Sphere(sphereData, this.scene);
			this.Spheres.push(s);
		},

		makeViewMenu: function() {

			this.Views.push(new View_random(this.scene, this.Spheres));
			this.Views.push(new View_1(this.scene, this.Spheres));
			this.Views.push(new View_sine(this.scene, this.Spheres));
			this.Views.push(new View_box2d(this.scene, this.Spheres));

			console.log(this.scene);

			var ul = [];
			for (i = 0; i < this.Views.length; i++) {
				if(i == this.currentView){
					ul.push('<li><a id="' + i + '" class="active">' + this.Views[i].title + '</a></li>');
				}else{
					ul.push('<li><a id="' + i + '">' + this.Views[i].title + '</a></li>');
				}
				
			}

			$('<ul/>', {
				'class': 'modes',
				html: ul.join('')
			}).appendTo('#ui');

			$("ul.modes li a").click(function() {
				//alert($(this).attr("id"));
				showView($(this).attr("id"));
			});

		}, 

		showView: function(id){

			$("ul.modes a.active").removeClass("active");
			$("ul.modes #"+id).addClass("active");
			currentView = id;
			Views[currentView].intro();
		},

		//console.log("class: "+THREE);
		/*new TWEEN.Tween( particle.position )
					.delay( delay )
					.to( { x: Math.random() * 4000 - 2000, y: Math.random() * 1000 - 500, z: Math.random() * 4000 - 2000 }, 10000 )
					.start();*/

		initTHREEjs: function() {

			this.container = $("#container");

			this.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 5000 );
			//camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
			this.camera.position.z = 360;

			this.scene = new THREE.Scene();
				var ambientLight = new THREE.AmbientLight( 0x555555 );
				this.scene.add( ambientLight );

			this.projector = new THREE.Projector();
			this.raycaster = new THREE.Raycaster();

			this.renderer = new THREE.CanvasRenderer();
			//renderer = new THREE.WebGLRenderer();
			this.renderer.setSize( window.innerWidth, window.innerHeight );
			this.renderer.sortElements = true;
			this.renderer.setClearColor( 0x000000, 0.25 );
			this.container.append( this.renderer.domElement );

			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.bottom = '0px';
			$('body').append( this.stats.domElement );

			document.addEventListener( 'mousemove', this.onDocumentMouseMove, false );
			document.addEventListener( 'touchstart', this.onDocumentTouchStart, false );
			document.addEventListener( 'touchmove', this.onDocumentTouchMove, false );
			window.addEventListener( 'resize', this.onWindowResize, false );

			document.addEventListener( 'click', this.onDocumentClick, false );

			this.mouse = new THREE.Vector2();

		},

		animate: function() {
			//if(active){
				var that = this;
				window.requestAnimationFrame( that.animate );

				//updateDragging();
				//box2d();
				//console.log(v1);	
				//v1.step();
				Views[currentView].step();

				render();
				stats.update();
				//world.DrawDebugData();

			//}
		},

		radius : 300, theta : 0,
		cameraFocus : {x:0, y:0, z:0},

		render: function() {

			TWEEN.update();

			theta += 0.4;
			//camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
			//camera.position.y = radius * .5 * Math.sin( THREE.Math.degToRad( theta ) );
			//camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );

			if(mouseX && mouseY){
				camera.position.x += ( 0.5 * mouseX - camera.position.x ) * 0.05;
				camera.position.y += ( -0.5 * mouseY - camera.position.y ) * 0.05;
				}
			//camera.lookAt( scene.position );
			camera.lookAt( cameraFocus );
			hitTest();

			for ( var i = 0; i < Spheres.length; i++ ) {

				/*if(i === 10){
					//var projector = new THREE.Projector();
					var p2D = new THREE.Vector3(200, -200, -0.5);

					//p2D = projector.projectVector(p3D, camera);
					var p3D = projector.unprojectVector(p2D, camera);

					p3D.x = (p3D.x + camera.position.x) * 0.5;
					p3D.y = (p3D.y + camera.position.y) * 0.5;
					p3D.z = (p3D.z + camera.position.z) * 0.5;

					//var p3D = camera.matrixWorld.multiplyVector3( p2D );
					//console.log(p3D.x + ", " + p3D.y);
					///Spheres[i].collisionSphere.position.x = -p3D.x;
					//Spheres[i].collisionSphere.position.y = -p3D.y;
					//Spheres[i].collisionSphere.position.z = -p3D.z;
					//Spheres[i].collisionSphere.scale.x = Spheres[i].collisionSphere.scale.y = 10;
				}*/

				Spheres[i].particle.position = Spheres[i].collisionSphere.position;
				Spheres[i].particle.rotation = Spheres[i].collisionSphere.rotation;
				//Spheres[i].particle.position.y = Spheres[i].collisionSphere.position.y;
				//Spheres[i].particle.position.z = Spheres[i].collisionSphere.position.z;
				//Spheres[i].particle.scale = Spheres[i].collisionSphere.scale;

			}

			renderer.render( scene, camera );

		},

		hitTest: function(){
			// find intersections
			var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
			projector.unprojectVector( vector, camera );
			raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

			//var intersects = raycaster.intersectObjects( particles );
			var intersects = raycaster.intersectObjects( scene.children );

			if ( intersects.length > 0 ) {
				//console.log(intersects[0].object.id);
				if ( INTERSECTED != intersects[ 0 ].object ) {
					if(INTERSECTED !== null){
						$("ul.spheres a").removeClass("active");
						//INTERSECTED.visible = false;
					}
					INTERSECTED = intersects[0].object;

					if ( INTERSECTED && INTERSECTED.Sphere ){
						//console.log(INTERSECTED.data);
						//INTERSECTED.visible = true;

						$("ul.spheres a#"+INTERSECTED.Sphere.id).addClass("active");

						showTooltip(INTERSECTED);
						FOCUSED = INTERSECTED;
					}
				}
			} else {

				if(INTERSECTED !== null){
					//INTERSECTED.visible = false;
					$("ul.spheres a").removeClass("active");
					INTERSECTED = null;
					//console.log("null");
				}
			}

			if(FOCUSED){
				positionTooltip(FOCUSED);
			}
		},

		showTooltip: function(collisionSphere){

			//console.log(collisionSphere);

			$("#tooltip").html(collisionSphere.Sphere.title);
			$("#tooltip").css({"display": "block"});

			positionTooltip(collisionSphere);

			/*var x = collisionSphere.position.x;
			var y = collisionSphere.position.y;
			var z = collisionSphere.position.z;
			new TWEEN.Tween( cameraFocus ).to( { x:x, y:y, z:z}, 1000 ).start();*/

		},
		positionTooltip: function(collisionSphere){

			var projector = new THREE.Projector();
			var v3 = new THREE.Vector3().getPositionFromMatrix(collisionSphere.matrixWorld);
			var vector = projector.projectVector( v3, camera );
			vector.x = ( vector.x * this.windowHalfX ) + this.windowHalfX;
			vector.y = - ( vector.y * this.windowHalfY ) + this.windowHalfY;

			$("#tooltip").css({"left":vector.x, "top":vector.y});
		},



		b2_mouseX : 0, b2_mouseY : 0,
		windowHalfX : window.innerWidth / 2,
		windowHalfY : window.innerHeight / 2,
		mouse : new THREE.Vector2(),
		mouseX: 500, mouseY : 500,

		onDocumentMouseMove: function( event ) {

			mouseX = event.clientX - this.windowHalfX;
			mouseY = event.clientY - this.windowHalfY;

			this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

			var s = 260;
			b2_mouseX = (( mouseX / window.innerHeight ) + 0.38) * s;
			b2_mouseY = (( mouseY / window.innerHeight ) + 0.38) * s;

			//$("#debug").html("mousex: "+b2_mouseX + " mousey: "+b2_mouseY);
		},

		onDocumentTouchStart: function( event ) {

			if ( event.touches.length == 1 ) {
				event.preventDefault();
				mouseX = event.touches[ 0 ].pageX - windowHalfX;
				mouseY = event.touches[ 0 ].pageY - windowHalfY;
			}

		},

		onDocumentTouchMove: function( event ) {

			if ( event.touches.length == 1 ) {
				event.preventDefault();
				mouseX = event.touches[ 0 ].pageX - windowHalfX;
				mouseY = event.touches[ 0 ].pageY - windowHalfY;
			}

		},

		onDocumentClick: function() {

			if(INTERSECTED !== null){
				console.log("clickec: "+INTERSECTED.Sphere.title);
			}

		},

		onWindowResize: function() {

			windowHalfX = window.innerWidth / 2;
			windowHalfY = window.innerHeight / 2;
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize( window.innerWidth, window.innerHeight );

		},

		makeBox2dStaticRect: function(x, y, width, height){

			var material_red = new THREE.MeshLambertMaterial({ color: 0xdd0000, overdraw: true });	
			var floor = new THREE.Mesh( new THREE.PlaneGeometry( width, height ), material_red );
			this.scene.add( floor );
			console.log(floor);

			floor.position.x = x;
				floor.position.y = -y; // position the floor

		},

		getScene:function (){
			console.log("ok");
		}


    };

    Main.init();

	//var main = new Main();
	return Main;
});
