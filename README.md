# webfejl
Webfejlesztés tutorial
CHEK DIS

<!DOCTYPE html>

<html>
	<head>
		<style>
			#canvas {
				margin:auto;
				display:block;
				border: 1px solid blue;
			}
		</style>
	</head>
	<body>
		<canvas width="600" height="600" id="canvas"></canvas>
	</body>
	
	<script>
		var c = document.getElementById('canvas');
		var ctx = c.getContext("2d");
		ctx.clear = function(){
			this.fillStyle = "white";
			this.fillRect(0,0,w,h);
		};
		
		var w = h = 600;
		
		var time;
		var render = function(){
			window.requestAnimationFrame(render);

		    var now = new Date().getTime(),
			dt = now - (time || now);
			time = now;
			
			doRender(dt);
		};
		
		var doRender = function(delta){
			world.animate(delta);
			world.render();
		};
		
		var start = function(){
			var world = window.world = new World();
			//for(var i =0 ;i<5; i++){
			//	world.entities.push(new PixelEntity());
			//}
			
			setInterval(function(){
				world.entities.forEach(function(e){
					if (Math.random()>0.6) return;
					e.body.speed.x += (Math.random()*0.1-0.05); e.body.speed.y += (Math.random()*0.1-0.05);
					e.body.speed.clamp(-0.02,0.02);
					//e.color.shiftHue((Math.random())*30);
					e.color.shiftHue(10);
				});
			},100);
			setInterval(function(){
				world.entities.push(new PixelEntity());
			},300);
			render();
		};
		
		var merge = function(where, what){
			where = where || {};
			what = what || {};
			
			Object.keys(what).forEach(function(k){
				if (typeof what[k]!=='undefined') {
					if (what[k].clone){
						where[k] = what[k].clone();
					} else if (what[k].slice) {
						where[k] = what[k].slice();
					} else {
						where[k] = what[k];
					}
				}
			});
			if (arguments.length>2){
				var args = [].slice.call(arguments,0);
				var base = args.shift();
				var consumed = args.shift();
				return merge.apply(null, [base].concat(args));
			}
			return where;
		};
		
		var Color = function(r,g,b) {
			merge(this,Color.defaults,{r:r,g:g,b:b});
		};
		Color.defaults = {
			r:0,
			g:0,
			b:0
		};
		Color.prototype = {
			clone: function(){
				return new Color(this.r,this.g,this.b);
			},
			asArray: function(){
				return [this.r,this.g,this.b];
			},
			setFrom: function(){
				if (arguments.length == 3){
					this.r = arguments[0];
					this.g = arguments[1];
					this.b = arguments[2];
				} else if (arguments.length==1 && arguments[0].hasOwnProperty('h')) {
					this.setFrom.apply(this, this._hslToRGB(arguments[0]));
				}
			},
			toHexString: function(){
				return this.rgbToHex.apply(this,this.asArray());
			},
			_componentToHex: function(c) {
				var hex = c.toString(16);
				return hex.length == 1 ? "0" + hex : hex;
			},
			rgbToHex: function(r, g, b) {
				return "#" + this.asArray().map(this._componentToHex).join("");
			},
			
			toHSL: function(){
				return this._rgbToHSL.apply(null,this.asArray());
			},
			
			shiftHue: function(degree) {
				var hsl = this.toHSL();
				hsl.h += degree;
				if (hsl.h > 360) {
					hsl.h -= 360;
				}
				else if (hsl.h < 0) {
					hsl.h += 360;
				}
				return this.setFrom(hsl);
			},
			
			_rgbToHSL:function(r,g,b) {

				var r = r / 255,
					g = g / 255,
					b = b / 255,
					cMax = Math.max(r, g, b),
					cMin = Math.min(r, g, b),
					delta = cMax - cMin,
					l = (cMax + cMin) / 2,
					h = 0,
					s = 0;

				if (delta == 0) {
					h = 0;
				}
				else if (cMax == r) {
					h = 60 * (((g - b) / delta) % 6);
				}
				else if (cMax == g) {
					h = 60 * (((b - r) / delta) + 2);
				}
				else {
					h = 60 * (((r - g) / delta) + 4);
				}

				if (delta == 0) {
					s = 0;
				}
				else {
					s = (delta/(1-Math.abs(2*l - 1)))
				}

				return {
					h: h,
					s: s,
					l: l
				};
			},

			_hslToRGB: function (hsl) {
				var h = hsl.h,
					s = hsl.s,
					l = hsl.l,
					c = (1 - Math.abs(2*l - 1)) * s,
					x = c * ( 1 - Math.abs((h / 60 ) % 2 - 1 )),
					m = l - c/ 2,
					r, g, b;

				if (h < 60) {
					r = c;
					g = x;
					b = 0;
				}
				else if (h < 120) {
					r = x;
					g = c;
					b = 0;
				}
				else if (h < 180) {
					r = 0;
					g = c;
					b = x;
				}
				else if (h < 240) {
					r = 0;
					g = x;
					b = c;
				}
				else if (h < 300) {
					r = x;
					g = 0;
					b = c;
				}
				else {
					r = c;
					g = 0;
					b = x;
				}

				r = this._normalizeRGBValue(r, m);
				g = this._normalizeRGBValue(g, m);
				b = this._normalizeRGBValue(b, m);

				return [r,g,b];
			},

			_normalizeRGBValue:function(color, m) {
				color = Math.floor((color + m) * 255);
				if (color < 0) {
					color = 0;
				}
				return color;
			}
		};
		
		var Vector = function (x, y) {
			this.x = x || 0;
			this.y = y || 0;
		};

		Vector.prototype = {
			add : function (other) {
				return new Vector(this.x + other.x, this.y + other.y);
			}

			,subtract : function (other) {
				return new Vector(this.x - other.x, this.y - other.y);
			}

			,addInPlace : function (other) {
				this.x += other.x;
				this.y += other.y;
				return this;
			}

			,scale : function (scaler) {
				return new Vector(this.x * scaler, this.y * scaler);
			}

			,scaleInPlace : function (scaler) {
				this.x *= scaler;
				this.y *= scaler;
				return this;
			}

			,length : function () {
				return Math.sqrt(this.x * this.x + this.y * this.y);
			}

			,normalize : function () {
				this.scaleInPlace(1 / this.length());
				return this;
			}

			,clamp : function (min, max) {
				if (min > max) throw new Error("Inverse ranges");
				if (this.x > max) {
					this.x = max;
				} else if (this.x < min) {
					this.x = min;
				}
				if (this.y > max) {
					this.y = max;
				} else if (this.y < min) {
					this.y = min;
				}
			}

			,scalar : function(other){
				return other.x * this.x + other.y * this.y;
			}

			,clone : function () {
				return this.scale(1);
			}
		};
		Vector.random = function (scaleX, scaleY) {
			if (arguments.length == 0) {
				scaleX = scaleY = 1;
			} else if (arguments.length == 1) {
				scaleY = scaleX;
			}

			return new Vector((Math.random() - 0.5) * scaleX, (Math.random() - 0.5) * scaleY);
		};
		
		var Body = function(opts){
			merge(this,Body.defaults,opts);
		};
		Body.defaults = {
			speed: new Vector(0,0),
			position: new Vector(w/2,h/2)
		};
		Body.prototype = {
				animate: function(dt){
				this.position.addInPlace(this.speed.scale(dt));
			},
			clone: function(){
				return new Body({speed:this.speed.clone(), position: this.position.clone()});
			}
		};
		
		var PixelEntity = function(opts){
			merge(this,PixelEntity.defaults,opts);
		};
		PixelEntity.defaults = {
			color: new Color(255,100,100),
			body: new Body(),
			width: 2,
			height: 2
		};
		PixelEntity.prototype = {
			render: function(){
				ctx.save();
					ctx.translate(this.body.position.x, this.body.position.y);
					ctx.fillStyle = this.color.toHexString();
					ctx.fillRect(-this.width/2,-this.height/2,this.width,this.height);
				ctx.restore();
			},
			animate: function(dt){
				this.body.animate(dt);
			}
		};
		
		var World = function(opts){
			merge(this,World.defaults,opts);
		};
		World.prototype = {
			animate: function(dt){
				this.entities.forEach(function(e){
					e.animate(dt);
					if (e.body.position.x<0 || e.body.position.y<0 || e.body.position.x > 600 || e.body.position.y > 600){
						//this.entities.splice(this.entities.indexOf(e),1);
						e.body.speed.scaleInPlace(-1);
					}
				},this);
			},
			render: function(){
				this.entities.forEach(function(e){
					e.render();
				});
			}
		};
		World.defaults = {
			entities:[]
		};
		
		start();
	</script>
</html>
