// FLAPPY BIRD CLONE
// WRITTEN BY KEVIN PAGEAU
// STARTED ON 2014-02-11

// TODO:
// - Clean up code, make everything object based if possible
// - Make player die upon collision
// - Update different things based on game state
// - Create clickable main menu
// - Make it so you can also move character onclick
// - Make background image scroll
// - Add collision system
// - Create a floor that also scrolls horizontally
// - (Later) Instead of removing from obstacles array and adding a new one everytime, make it so you can simply reposition those that went offscreen. IMPORTANT: Make it modular so it still works for custom amount of spacing between the obstacles. This should vary depending on the max possible amount of obstacles onscreen at the same time
// Optimize obstacles placement and drawing - scratch the two objects into one thing

// TODO: Use the obstaclesMax variable with a for loop to push the needed amount of obstacles in their array

//*** VARIABLES ***//

// Canvas
var canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d"),
	canvasWidth = canvas.width,
	canvasHeight = canvas.height;

// Game object
var game = new Game();

// Array used to store player pressed keys
var keys = [];

// Previous Space State
var previousSpaceState = false;

// Player attraction to the ground
var gravity = 0.65;

// Vertical falling speed cap
var yVelocityCap = 10;

// Obstacles related variables
// Defines spacing between obstacles in pixels
var obstacleSpacing = 150;

// Defines how high the ground is from the bottom of screen
var floorHeight = 62;

// Defines the x point at which obstacles should spawn
var obstacleStartPoint = canvasWidth + 5;

// Defines distance between obstacles
var obstaclesDistance = 280;

// Speed at which obstacles move
var gameSpeed = 4;
var floorSpeed = gameSpeed * 1.1;

// Height of obstacles ending
var obstacleEndHeight = 50;

// Calculate maximum possible amount of obstacles onscreen at the same time
var obstacleAmount = Math.ceil(canvasWidth / obstaclesDistance);

//*** CLASSES ***//

// Class containing all images
var ImageRepository = new function()
{
	// Images
	this.player = new Image();
	this.background = new Image();
	this.obstacle = new Image();
	this.floor = new Image();
	
	// Images sources
	this.player.src = "images/player.png";
	this.background.src = "images/background.png";
	this.obstacle.src = "images/obstacle.png";
	this.floor.src = "images/floor.png";
	
	// Tell the game when images are loaded
	this.player.onload = function() 
	{
		imageLoaded();
	};
	
	this.background.onload = function() 
	{
		imageLoaded();
	};
	
	this.obstacle.onload = function() 
	{
		imageLoaded();
	};
	
	this.floor.onload = function() 
	{
		imageLoaded();
	};
	
	// Verify all images are loaded
	var imagesTotal = 4;
	var imagesLoaded = 0;
	
	function imageLoaded()
	{
		imagesLoaded++;
		if (imagesLoaded == imagesTotal)
		{
			// Once all images are loaded, initialize the game
			game.Initialize();
		}
	}
};

// Class containing all sounds
var SoundRepository = 
{

};

/**
  *	Drawable object, which will be the base class for all
  *	drawable objects in the game. Sets up default variables
  *	to be inherited by all child objects, as well as default
  *	methods.
**/
function Drawable()
{
	this.init = function(x, y)
	{
		// Default variables
		this.x = x;
		this.y = y;
	}
	
	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	
	this.draw = function()
	{
	
	};
}

// Class containing game states
function GameState ()
{
	this.titleScreen = true;
	this.gameReady = false;
	this.gamePlaying = true;
	this.gameOver = false;
}

// Class for the player
function Player()
{
	this.width = 32;
	this.height = 32;
	
	this.velY = 0;
	this.jumpForce = 2.50;
	
	this.points = 0;
	
	// Player Update
	this.update = function()
	{
		// Spacebar : Jumping
		if (keys[32] && !previousSpaceState && this.y >= 0 - this.height) 
		{
			this.velY = -5 * this.jumpForce * 0.8;
		}
		
		// Apply gravity to Y velocity
		this.velY += gravity;
		
		// Condition to ensure fall speed never exceeds cap
		if (this.velY >= yVelocityCap)
		{
			this.velY = yVelocityCap;
		}
		
		// Change y value according to velocity
		this.y += this.velY;
		
		// COLLISIONS CHECK
		
		// Collision with floor
		if (this.y + this.height >= canvasHeight - floorHeight)
		{
			this.y = 1000;
		}
	};
	
	// Player Draw
	this.draw = function()
	{
		ctx.drawImage(ImageRepository.player, this.x, this.y);
	};
	
}

// Make Player inherit properties from Drawable
Player.prototype = new Drawable();

// Obstacle class
function Obstacle(initialPosition, speed)
{
	this.x = initialPosition;
	this.initialPosition = initialPosition;
	
	this.width = 64;
	
	this.speed = speed;
	
	
	// Specifies whether the following obstacle was already spawned or not
	this.nextSpawned = false;

	// Get the point where the space start
	this.spaceStart = getRandomInt(0 + obstacleEndHeight, canvasHeight - floorHeight - obstacleSpacing);
	
	// Get top & bottom obstacle coordinates to initialize them as objects
	this.firstObsY = 0;
	this.firstObsHeight = this.spaceStart;
	this.secondObsY = this.spaceStart + obstacleSpacing;
	this.secondObsHeight = canvasHeight - floorHeight - (this.spaceStart + obstacleSpacing);
	
	// Initialize top and bottom obstacle objects to use for checking for collisions
	this.topObstacle = new obstacleHalf(this.x, this.firstObsY, this.width, this.firstObsHeight, "top");
	this.bottomObstacle = new obstacleHalf(this.x, this.secondObsY, this.width, this.secondObsHeight, "bottom");
	
	
	this.update = function()
	{
		this.x -= speed;
		this.topObstacle.x = this.x;
		this.bottomObstacle.x = this.x;
	};
	
	this.draw = function()
	{
		ctx.drawImage(ImageRepository.obstacle, this.x, this.firstObsY, this.width, this.firstObsHeight);
		ctx.drawImage(ImageRepository.obstacle, this.x, this.secondObsY, this.width, this.secondObsHeight);
	};
	
}

// Obstacle half class
function obstacleHalf(x, y, width, height, name)
{
	this.x = x;
	this.y = y;
	
	this.width = width;
	this.height = height;
	
	this.name = name;
}

// Floor class
function Floor(width, height, speed)
{
	this.height = height;
	this.width = width;
	
	this.update = function()
	{
		this.x -= speed;
		if(this.x <= 0)
		{
			this.x = canvasWidth
		}
	};
	
	this.draw = function()
	{
		ctx.drawImage(ImageRepository.floor,this.x, this.y, this.width, this.height);
		ctx.drawImage(ImageRepository.floor,this.x - this.width, this.y, this.width, this.height);
	};
}

// Make Floor inherit from Drawable
Floor.prototype = new Drawable();

// Main game class
function Game()
{
	// The player
	this.player;
	
	
	// The game's current state
	this.gameState;
	
	// Array containing all obstacles
	this.obstacles = [];
	
	// Two floor objects composing the floor of the game
	this.floor;
	
	
	//*** GAME INITIALIZING METHOD ***//
	this.Initialize = function()
	{
		// Instantiate game objects
		
		// Player
		this.player = new Player();
		this.player.init(this.player.width, canvasHeight / 2);
	
		// Game state
		this.gameState = new GameState();
	
		// Add event listeners
		document.body.addEventListener("keydown", function(e) {
			// When a key is pressed down, store in keys array with true value
			keys[e.keyCode] = true;
		});
		
		document.body.addEventListener("keyup", function(e) {
			
			// When a key is let go of, its value becomes false
			keys[e.keyCode] = false;
		});
		
		// Add initial obstacle
		this.obstacles.push(new Obstacle(obstacleStartPoint, gameSpeed));
		
		// Add obstacles
		for(var i = 0; i < obstacleAmount; i++)
		{
			var initialPosition = obstacleStartPoint * (i + 1);
			this.obstacles.push(new Obstacle(initialPosition, gameSpeed));
		}
		
		// Add the floor
		this.floor = new Floor(canvasWidth, floorHeight, gameSpeed);
		this.floor.init(canvasWidth, canvasHeight - floorHeight);
		
		// Once everything is initialized, launch the main loop function
		main();
	};
	
	
	//*** GAME UPDATE METHOD ***//
	this.update = function()
	{
		// Updates differently depending on the current game state
		if (this.gameState.titleScreen)
		{
		
		}
		
		if (this.gameState.gamePlaying)
		{
			// Update the player
			this.player.update();
			
			// Update obstacles
			for (var i = 0; i < this.obstacles.length; i++)
			{
				// Update the obstacle
				this.obstacles[i].update();
				
				// If obstacle has left the screen, remove from the array
				if(this.obstacles[i].x < 0 - (this.obstacles[i].width * 2))
				{
					this.obstacles[i].x = this.obstacles[i].initialPosition;
				}
				
				// Check for collisions between player & obstacles
				if (checkCollision(this.player, this.obstacles[i].topObstacle) ||
					checkCollision(this.player, this.obstacles[i].bottomObstacle)
					)
				{
					this.player.x = 5000;
				}
			}
			
		}
		
		// Update floor
		this.floor.update();
		
		// Previous space state support
		previousSpaceState = keys[32];
		
	};
	
	
	//*** GAME DRAW METHOD ***//
	this.draw = function()
	{
		ctx.clearRect(0,0,canvasWidth,canvasHeight);
		//ctx.save();
		
		//ctx.beginPath();
		
		// Draw background
		ctx.drawImage(ImageRepository.background, 0, 0);
		
		// Draw character
		this.player.draw();
		
		// Draw obstacles
		for (var i = 0; i < this.obstacles.length; i++)
		{
			this.obstacles[i].draw();
		}
		
		// Draw floor
		this.floor.draw();
		
		//ctx.fill();
		//ctx.restore();
		
	};
	
	
}


//*** FUNCTIONS ***//

// Main game function
function main()
{
	game.update();
	game.draw();
	
	requestAnimationFrame(main);
}

// Random number generator function
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Collision check function
function checkCollision(shapeA, shapeB)
{
	// Get the vectors to compare
	// Vector X : Horizontal distance between center of shapeA and center of shapeB
	// Vector Y : Vertical distance between center of shapeA and center of shapeB
	var vectorX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2));
	var vectorY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2));
	
	//  Add the half widths and half heights of the objects
	var halfWidths = (shapeA.width / 2) + (shapeB.width / 2);
	var halfHeights = (shapeA.height / 2) + (shapeB.height / 2);
	
	// If absolute value of the X-Y vectors are smaller than the half widths-heights,
	// then the objects are colliding
	if (Math.abs(vectorX) < halfWidths && Math.abs(vectorY) < halfHeights )
	{
		return true;
	}
	
}