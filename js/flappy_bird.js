// FLAPPY BIRD CLONE
// WRITTEN BY KEVIN PAGEAU
// STARTED ON 2014-02-11

// CURRENT VERSION: 0.2
// 2014-02-24

// TODO:
// - Clean up code
// - Add click control for jumping

// META:
// Document the whole game, explaining what all variables/classes do & how it works

// Add shooting mechanics in the game
// Some obstacles will sometimes have a middle part that you must shoot to get through
// Obstacles have to start farther away to give time to the player to react
// Add a scrolling foreground
// Add animations prompting player to press spacebar to start flying, and E key to try again
// BIG CHALLENGE: Add different kinds of obstacles, maybe for different game modes
// Change bird animation and make it fall down to the ground upon dying
// Idea (rather than using the player for this, create a new class: falling object that spawns in player pos when it dies)
// Make holding the spacebar down jump higher, and lightly tapping it jump lower
// Change player orientation when jumping
// Add options menu (requires redoing the menu system)
// Actually, REDO ENTIRE MENU SYSTEM

// IDEAS: 
// Add multiple difficulties
// Add multiple colors for the character, chosen randomly and/or can be chosen by player
// Add multiple skins for the game (Cram all sprites in one sheet that can be reused)
// Add health to the player, so multiple hits allowed. Upon being hit, flickers and is invulnerable shortly
// For the spritesheets: Add an enumeration containing the sourceRects of each assets on the sheet
// Add multiple game modes, levels, incrementing difficulty, choosable difficulty in main menu
// The current mode should become a "survival" mode. Add a main mode, with a lifebar, levels & more
// Player doesn't die instantly in main mode, so passing obstacles racks up points in 100's
// Passing multiple obstacles can make up combos, which gives more points
// Add enemies in the game, that can be shot
// Add a different flying mode for the shooting parts
// Make a diagonal version of the game, and add it into the game seamlessly - so the game can switch to a diagonal version during gameplay
// Add more characters that can be chosen (or even unlocked?)
// Add more skins/color schemes that can be chosen (or unlocked)
// Add multiple backgrounds that transition between them smoothly
// Add a repository to hold all the animations of the game
// To make scrolling backgrounds repeat modulably: use a while loop that does a ctx.drawImage while
// the currentX is smaller than canvasWidth * 2

// Create different characters that play differently and have different stats on top of different appearances
// Maybe add different types of controls (like in iron pants) & different death conditions, health, etc.
// On top of that, assign different sounds, music & dying animations to each of them
// In other words: a character repository
// Add a character select screen to freely choose from different characters
// Maybe go all the way to add a different title screen/gameover screen for each character
// (Just draw it directly from the character sheet, & assign a different title screen bg to each one)
// Assign a different game skin to each character, or generate it randomly
// Make a different animation play when in gameReady & when in gamePlaying
// Separate hitbox logic from drawing logic
// Fix the background not scrolling smoothly
// Use two backgrounds: One for the sky & one for the clouds, make them scroll at diff. speed



// To draw something with transparence:

/*
ctx.save();
ctx.globalAlpha = 0.4;
this.obstacles[i].draw();
ctx.restore();
*/

// Make a function out of it, use to smoothly transition from one background to another maybe


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

// Current game score
var score = 0;
var bestScore = 0;

// Previous space state
var previousSpaceState = false;

// Previous mouse state
var previousMouseState = false;

// Player attraction to the ground
var gravity = 1;

// Vertical falling speed cap
var yVelocityCap = 15;

// Speed at which game plays
var gameSpeed = 15;
var floorSpeed = gameSpeed;

// Defines distance between obstacles
var obstaclesDistance = (gameSpeed * 100) / 2 + 5;

// Obstacles related variables
// Defines space between top & bottom obstacles
var obstacleSpacing = 150;

// Defines how high the ground is from the bottom of screen
var floorHeight = 62;

// Defines the x point at which obstacles should spawn
var obstacleStartPoint = canvasWidth;

// Calculate maximum possible amount of obstacles onscreen at the same time
// Add one to make sure obstacles won't respawn on the screen
var obstaclesAmount = Math.ceil(canvasWidth / obstaclesDistance) + 1;

// Width of obstacles
var obstaclesWidth = 64;

// The obstacles respawn point
var obstaclesRespawnPoint = obstaclesDistance * obstaclesAmount - obstaclesWidth;

// Height of obstacles ending
var obstacleEndHeight = 50;

// Player jump force
var jumpForce = 3.3;

//*** RESOURCES ***//


// IMAGES

// Image Names object, containing the name of every image used in the game
// To add an image, simply add its name to the list
// Note: assumes all images are in an "images" subfolder and are .png files
// Ex: images/player.png
var imageNames = {
		background: "background",
		background2: "background2",
		background3: "background3",
		floor: "floor",
		buttons: "buttons",
		obstacle: "obstacle",
		obstacleEnds: "obstacleEnds",
		explosion: "explosion",
		bird: "bird",
		bat: "bat",
		logo: "logo",
		gameOver: "gameOver",
		score: "score",
		spacebar: "spacebar",
		eKey: "eKey",
		ghost: "ghost",
		eyebat: "eyebat",
		nyanCat: "nyanCat",
}


// Object containing every images in the game
var ImageRepository = {};

function loadImages(sources) 
{
	var loadedImages = 0;
	var numImages = 0;
	
	// Add the path to the name for each entry in the sources object
	for(var src in sources)
	{
		sources[src] = "images/" + sources[src] + ".png";
	}
	
	// Get num of sources
	for(var src in sources) 
	{
	  numImages++;
	}
	
	// Add the images to the imageRepository object
	for(var src in sources)
	{
		ImageRepository[src] = new Image();
		ImageRepository[src].src = sources[src];
		ImageRepository[src].onload = function()
		{
			if (++loadedImages >= numImages)
			{
				// Once all images are loaded, initialize game
				game.Initialize();
			}
		}
	}
}

// Load images in ImageRepository, then launch game when ready
loadImages(imageNames);

// Define the image used by the player
var playerImage = ImageRepository.bird;
var playerImgRows = 1;
var playerImgPerRows = 5;
var playerImgSpeed = 15;









// SOUNDS

// Repository for all music
var MusicRepository = {
	music : new Audio("audio/music.mp3"),
	nyanCat : new Audio("audio/nyanCat.mp3"),
}

// Lower the volume of everything in the Music Repository
for(var song in MusicRepository)
{
	MusicRepository[song].volume = 0.4;
}

// Repository for sound effects
var SoundRepository = {
	explosion1 : new Audio("audio/explosion1.wav"),
	flap : new Audio("audio/flap.wav"),
}

SoundRepository.flap.volume = 0.5;

// Function to play a sound only if it's not already playing
function playIfNotPlaying(sound)
{
	if(!sound.playing)
	{
		sound.play();
	}
}

// Function to play a sound repeatedly
function playRepeatedly(sound)
{
	sound.src = sound.src;
	sound.play();
}


// Game states enumeration
var GameStates = 
{
	titleScreen: 1,
	gameReady: 2,
	gamePlaying: 3,
	gameOver: 4,
	reset: 5
};

// Define the game music to be used

var gameMusic = MusicRepository.nyanCat;



//** CLASSES **//

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
	
	this.update = function()
	{
	
	};
	
	this.draw = function()
	{
	
	};
}

// Class for menu text
function MenuText(text)
{
	this.text = text;
	this.textColor = "#000000";
	
	// Function to initialize menu text
	this.init = function(x, y, image, textFont, textFontSize)
	{
		this.x = x;
		this.y = y;
		this.image = image; 
		this.textFont = textFont;
		this.textFontSize = textFontSize;
	};
	
	this.draw = function()
	{
		// Draw the text inside the button
		// Get metrics of text in order to place it appropriately
		var metrics = ctx.measureText(this.text);
		var font = this.textFontSize + "pt " + this.textFont;
		
		// Get font info that was passed as an argument when Button object was instantiated
		ctx.font = font;
		ctx.fillStyle = this.textColor;
		ctx.fillText(this.text, this.x + (this.width / 2) - (metrics.width / 2), this.y + (this.height / 2) + (this.textFontSize / 2));
	};
}

// Make menu text inherit from drawable class
MenuText.prototype = new Drawable();

// Class for menu image
function MenuImage(image)
{
	this.image = image;
	
	this.width = this.image.width;
	this.height = this.image.height;
	this.menuWidth;
	
	// Function to initialize menu text
	this.init = function(x, y, image, textFont, textFontSize)
	{
		this.x = x;
		this.y = y;
		this.menuWidth = image.width;
		
		// Center the image by using the menu's width
		this.x -= (this.image.width / 2); 
		this.x += (this.menuWidth / 2);
	};
	
	
	this.update = function()
	{
	
	};
	
	this.draw = function()
	{
		// Draw the image
		ctx.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
	};
}

// Class for menu animations
function MenuAnimation(animation)
{
	this.animation = animation;
	this.x;
	this.y;
	
	
	// Function to initialize menu animation
	this.init = function(x, y, image, textFont, textFontSize)
	{
		this.menuWidth = image.width;
		
		this.x = x;
		this.y = y;
		
		// Center the image by using the menu's width
		this.x -= (this.animation.drawRectangle.width / 2); 
		this.x += (this.menuWidth / 2);
		
		this.animation.drawRectangle.x = this.x;
		this.animation.drawRectangle.y = this.y;
	};
	
	this.update = function()
	{
		this.animation.update();
	}
	
	this.draw = function()
	{
		this.animation.draw();
	}
	
	
}


// Class for menu buttons
function MenuButton(text, gameStateChange)
{
	this.width;
	this.height;
	
	this.text = text;
	this.textFont;
	this.textFontSize;
	this.textColor = "#000000";
	
	this.sourceX = 0;
	this.sourceY = 0;
	
	this.image;
	
	this.gameStateChange = gameStateChange;
	
	// Function to initialize button
	this.init = function(x, y, image, textFont, textFontSize)
	{
		this.x = x;
		this.y = y;
		this.image = image; 
		this.textFont = textFont;
		this.textFontSize = textFontSize;
	};
	
	this.update = function()
	{
		// Check if mouse is hovering over button
		if (mouse.x >= this.x &&
			mouse.y >= this.y &&
			mouse.x <= this.x + this.width &&
			mouse.y <= this.y + this.height)
		{
			this.sourceY = this.height;
			this.textColor = "#4b4b4b";
			
			// Check to see if mouse is clicking
			// Get previous mouse state to make sure it wasn't previously pressed
			if(mouse.down && !previousMouseState)
			{ 
				game.gameState = this.gameStateChange;
			}
		}
		else
		{
			this.sourceY = 0;
			this.textColor = "#000000";
		}
	};
	
	this.draw = function()
	{
		// Draw the button
		ctx.drawImage(this.image, this.sourceX, this.sourceY, 
					  this.width, this.height, 
					  this.x, this.y, 
					  this.width, this.height);
		
		// Draw the text inside the button
		// Get metrics of text in order to place it appropriately
		var metrics = ctx.measureText(this.text);
		var font = this.textFontSize + "pt " + this.textFont;
		
		// Get font info that was passed as an argument when Button object was instantiated
		// TODO: Definitely redo how the text is handled, & ensure it is always centered properly
		ctx.font = font;
		ctx.fillStyle = this.textColor;
		ctx.fillText(this.text, this.x + (this.width / 2) - (metrics.width / 2), this.y + (this.height / 2) + (this.textFontSize / 3));
	};
}

// Make Button inherit properties from Drawable
MenuButton.prototype = new Drawable();

// Class for menus (Used for main menu & game over menu)
function Menu(buttonImage, textFont, textFontSize)
{
	// Array containing the buttons of the menu
	this.buttons = [];
	
	// Text font & font size used by buttons
	this.textFont = textFont;
	this.textFontSize = textFontSize;
	
	// The width of the menu
	this.width = buttonImage.width;
	
	// The image to be used by the menu buttons
	this.buttonImage = buttonImage;
	
	// Button spacing modifier
	// TODO: Use spacing modifier to change the spacing between buttons
	this.spacingModifier = 0.5;
	
	// Initialize the menu and all its buttons
	this.init = function()
	{
		var buttonsAmount = this.buttons.length
		var spacing = canvasHeight / (buttonsAmount + 1);
		
		
		// Initialize all buttons
		for(var i = 0; i < buttonsAmount; i++)
		{
			// Width & height must be initialized first, since they are used for placing the buttons
			this.buttons[i].width = this.width;
			this.buttons[i].height = this.buttonImage.height / 2;
			
			// Initialize the buttons, placing them & giving their image
			this.buttons[i].init(canvasWidth / 2 - (this.buttons[i].width / 2),
								spacing * (i + 1) - (this.buttons[i].height / 2),
								buttonImage,
								this.textFont,
								this.textFontSize);
		}
	};
	
	this.update = function()
	{
		for(var i = 0; i < this.buttons.length; i++)
		{
			this.buttons[i].update();
		}
	};
	
	this.draw = function()
	{
		for(var i = 0; i < this.buttons.length; i++)
		{
			this.buttons[i].draw();
		}
	};

	
	
}

// Class for object holding the score
function Score(image, textFont, fontSize)
{
	this.image = image;
	
	this.textFont = textFont;
	this.fontSize = fontSize;
	
	this.font = this.fontSize + "pt " + this.textFont;
	
	// Initialize the score, place in top right corner
	this.init = function()
	{
		var position = new Vector2(canvasWidth - this.image.width - (this.image.width / 2),
								   0 + (this.image.height / 2) );
		this.drawRectangle = new Rectangle(position.x, position.y, image.width, image.height);
	}
	
	this.draw = function()
	{
		ctx.drawImage(this.image, this.drawRectangle.x, this.drawRectangle.y,
					  this.drawRectangle.width, this.drawRectangle.height);
					  
		// Write current score
		var scoreText = score;
		var metrics = ctx.measureText(scoreText);
		
		ctx.fillStyle = "#000000";
		ctx.font = this.font;
		
		// Draw text in the middle of the image
		ctx.fillText(scoreText, this.drawRectangle.center.x - (metrics.width / 2), 
								this.drawRectangle.center.y + (this.fontSize / 3));
	}
}


// Class for the player
function Player(animation)
{
	this.animation = animation;
	
	this.x;
	this.y;
	
	this.width = this.animation.drawRectangle.width;
	this.height = this.animation.drawRectangle.height;
	
	this.animation.drawRectangle.x = this.width;
	this.animation.drawRectangle.y = canvasHeight / 2 - (this.height / 2);
	
	this.velY = 0;
	this.jumpForce = jumpForce;
	
	this.points = 0;
	this.active = false;
	this.exploded = false;
	
	this.sourceX = 0;
	this.sourceY = 0;
	
	this.animation; 
	
	// Intitialization function
	this.init = function()
	{
		this.x = this.width;
		this.y = canvasHeight / 2 - (this.height / 2);
		
		this.animation.drawRectangle.x = this.width;
		this.animation.drawRectangle.y = canvasHeight / 2 - (this.height / 2);
		
		this.active = true;
		this.exploded = false;
		

		
	};
	
	// Player Update
	this.update = function()
	{
		// Keep position of the animation on the player
		this.animation.drawRectangle.x = this.x;
		this.animation.drawRectangle.y = this.y;
		
		// Update the animation
		this.animation.update();
		
		if(this.active)
		{
			// Spacebar : Jumping (don't jump if position is above canvas)
			if (keys[32] && !previousSpaceState && this.y >= 0 - this.height) 
			{
				this.velY = -5 * this.jumpForce * 0.8;
				this.animation.reset();
				playRepeatedly(SoundRepository.flap);
			}
			
			// Apply gravity to Y velocity
			this.velY += gravity;
			
			// Change y value according to velocity
			this.y += this.velY;
			
			// Change image source according to velocity
			/*
			if (this.velY > 1)
			{
				this.sourceY = this.height;
			}
			else
			{
				this.sourceY = 0;
			}
			*/
			
			// Condition to ensure fall speed never exceeds cap
			if (this.velY >= yVelocityCap)
			{
				this.velY = yVelocityCap;
			}
			
			// Check for collision with floor
			if (this.y + this.height >= canvasHeight - floorHeight)
			{
				this.active = false;
			}
		}
		else
		{
			// If player isn't active, and hasn't exploded yet
			if (!this.exploded)
			{
				// Add an explosion animation at the player's position
				this.exploded = true;
				game.animations.push(new Animation(ImageRepository.explosion,
											   new Vector2(this.x, this.y), 1, 6, 20,
											   true, true));
			}
		}
	};
	
	// Player Draw
	this.draw = function()
	{
		this.animation.draw();
	};
	
}

// Make Player inherit properties from Drawable
Player.prototype = new Drawable();


// Class for rectangles
function Rectangle(x, y, width, height)
{
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	
	this.halfWidth = this.width / 2;
	this.halfHeight = this.height / 2;
	
	this.top = this.y;
	this.bottom = this.y + this.height;
	this.left = this.x;
	this.right = this.x + this.width;
	
	// Coordinates for center
	this.center = new Vector2(this.x + (this.width / 2), this.y + (this.height / 2));
	
	// Update the top, bottom, left, right & center position
	this.update = function()
	{
		this.top = this.y;
		this.bottom = this.y + this.height;
		this.left = this.x;
		this.right = this.x + this.width;
		
		this.center.x = this.x + (this.width / 2);
		this.center.y = this.y + (this.height / 2);
	};

}

// Simple class for holding x & y values 
function Vector2(x, y)
{
	this.x = x;
	this.y = y;
}

/* Class for animations
/
/  Image image: The image sheet used for the animation
/  Vector2 location: The location of the animation
/  int rows: The amount of rows the image sheet uses
/  int framesPerRow: The amount of frames per row
/  int animationSpeed: The speed of the animation
/  bool repeating: Whether the animation should repeat or not
/  bool moving: Whether the animation should scroll with the game or not
*/
function Animation(image, location, rows, framesPerRow, animationSpeed, repeating, moving)
{
	// The image used by the animation
	this.image = image;
	
	// FRAMES SUPPORT
	// Amount of frames
	this.framesAmount = rows * framesPerRow;
	
	// Amount of rows
	this.rows = rows;
	
	// Amount of frames per row
	this.framesPerRow = framesPerRow;
	
	// The current frame
	this.currentFrame = 0;
	
	// LOCATION SUPPORT
	// The draw rectangle
	this.drawRectangle = new Rectangle(location.x, location.y, image.width / this.framesPerRow, image.height / rows);
	
	// The source rectangle
	this.sourceRectangle = new Rectangle(0, 0, this.image.width / this.framesPerRow, this.image.height / rows);

	// TIME SUPPORT
	// Amount of clock ticks before it goes to next frame
	this.frameClockTicks = 100;
	
	// The animation's speed
	this.tickSpeed = animationSpeed;
	
	// The current amount of clock ticks
	this.clockTicks = 0;
	
	// PLAY SUPPORT
	// Whether the animation is still active or not
	this.active = true;
	this.repeating = repeating;
	
	// Whether the animation should scroll
	this.moving = moving;
	
	// Whether the animation is playing
	this.playing = true;
	
	//** ANIMATION MAIN UPDATE FUNCTION **//
	this.update = function()
	{	
		if (this.moving)
		{
			this.drawRectangle.x -= gameSpeed * 0.3;
		}
		if (this.playing)
		{
			// Returns true if the current frame is the last one
			// TODO: return the current frame num instead
			return this.animate();
		}
	};
	
	// Update the animation's frame
	this.animate = function()
	{
		this.clockTicks+= this.tickSpeed;
		
		// If clock ticks has reached the max amount, time to do something
		if (this.clockTicks >= this.frameClockTicks)
		{
			// Reset the clock ticks
			this.clockTicks = 0;
		
			// Change the frame to next one now, only if frames amount is not 2 (due to glitch if only 2 frames)
			if (this.framesAmount != 2)
			{
				this.currentFrame++;
			}
			
			// Max amount of frames not yet reached
			if (this.currentFrame < this.framesAmount)
			{
				// Adjust the source rectangle's position
				this.sourceRectangle.x = (this.currentFrame % this.framesPerRow) * this.sourceRectangle.width;
				this.sourceRectangle.y = Math.floor(this.currentFrame / this.framesPerRow) * this.sourceRectangle.height;
				
				// Change frame to next one now, only if frames amount is 2 (due to glitch if only 2 frames)
				if (this.framesAmount == 2)
				{
					this.currentFrame++;
				}
			}
			// Max amount of frames reached
			else
			{
				// If the animation is non-repeating...
				if (!this.repeating)
				{
					// Set the explosion active property to false, ready to be disposed of
					this.active = false;
				}
				// If it's repeating...
				else
				{
					// Reset the sourceRectangle x position & reset the frame amount
					this.sourceRectangle.x = 0;
					this.sourceRectangle.y = 0;
					this.currentFrame = 0;
				}
				
				// When max amount of frames is reached, return true (in case we want to add sound fx or whatevs)
				// TODO: instead of returning true, return the current frame each update loop
				return true;
			}
		}
	};
	
	// Toggle whether the animation is playing or not
	this.togglePlaying = function()
	{
		this.playing = (this.playing) ? false : true;
	};
	
	// Animation reset function
	this.reset = function()
	{
		this.sourceRectangle.x = 0;
		this.sourceRectangle.y = 0;
		this.clockTicks = 0;
		this.currentFrame = 1;
	};
	
	//** ANIMATION MAIN DRAW FUNCTION **//
	this.draw = function()
	{
		ctx.drawImage(this.image, this.sourceRectangle.x, this.sourceRectangle.y,
					  this.sourceRectangle.width, this.sourceRectangle.height,
					  this.drawRectangle.x, this.drawRectangle.y,
					  this.drawRectangle.width, this.drawRectangle.height);
	};
}


// Obstacle class
function Obstacle(x, speed, image)
{
	this.x = x;
	
	this.image = image;
	
	this.width = obstaclesWidth;
	
	this.speed = speed;

	this.passed = false;
	
	this.update = function()
	{
		this.x -= speed;
		this.topObstacle.x = this.x;
		this.bottomObstacle.x = this.x;
	};
	
	// Function that generates the top and bottom parts of obstacle
	this.generate = function()
	{
		// Get the point where the space start
		this.spaceStart = getRandomInt(0 + obstacleEndHeight, canvasHeight - floorHeight - obstacleSpacing - obstacleEndHeight);
		
		// Get top & bottom obstacle coordinates to initialize them as objects
		this.firstObsY = -100; // -100 so the player can't jump over top obstacle
		this.firstObsHeight = this.spaceStart + 100;
		this.secondObsY = this.spaceStart + obstacleSpacing;
		this.secondObsHeight = canvasHeight - (this.spaceStart + obstacleSpacing);
		
		// Initialize top and bottom obstacle objects to use for checking for collisions
		this.topObstacle = new obstacleHalf(this.x, this.firstObsY, this.width, this.firstObsHeight);
		this.bottomObstacle = new obstacleHalf(this.x, this.secondObsY, this.width, this.secondObsHeight);
	};
	
	this.draw = function()
	{
		// Object used to find which part to draw
		var partToDraw = {
			x : this.x,
			y : this.firstObsHeight - ImageRepository.obstacle.height - 100,
			width : ImageRepository.obstacle.width,
			height : ImageRepository.obstacle.height,
		}
		
		// Draw top obstacle end
		ctx.drawImage(ImageRepository.obstacleEnds, 0, 0,
					  ImageRepository.obstacleEnds.width / 2, ImageRepository.obstacleEnds.height,
					  partToDraw.x, partToDraw.y,
					  partToDraw.width, partToDraw.height);
		partToDraw.y -= partToDraw.height;
		
		// Draw top obstacle
		while (partToDraw.y > -partToDraw.height)
		{
			ctx.drawImage(ImageRepository.obstacle, partToDraw.x, partToDraw.y, partToDraw.width, partToDraw.height);
			partToDraw.y -= partToDraw.height;
		}
		
		
		// Reinitialize object for the lower obstacle
		var partToDraw = {
			x : this.x,
			y : this.secondObsY,
			width : ImageRepository.obstacle.width,
			height : ImageRepository.obstacle.height,
		}
		
		// Draw low obstacle end
		ctx.drawImage(ImageRepository.obstacleEnds, ImageRepository.obstacleEnds.width / 2, 0,
					  ImageRepository.obstacleEnds.width / 2, ImageRepository.obstacleEnds.height,
					  partToDraw.x, partToDraw.y,
					  partToDraw.width, partToDraw.height);
		partToDraw.y += partToDraw.height;
		
		// Draw low obstacle
		while (partToDraw.y < canvasHeight)
		{
			ctx.drawImage(ImageRepository.obstacle, partToDraw.x, partToDraw.y, partToDraw.width, partToDraw.height);
			partToDraw.y += partToDraw.height;
		}
	};
	
	// Generate the obstacle when first creating it
	this.generate();
}

// Obstacle half class
function obstacleHalf(x, y, width, height)
{
	this.x = x;
	this.y = y;
	
	this.width = width;
	this.height = height;
}

// Floor class
function Floor(width, speed)
{
	this.height = ImageRepository.floor.height;
	this.width = ImageRepository.floor.width;
	
	this.update = function()
	{
		this.x -= speed;
		if(this.x <= -this.width)
		{
			this.x = canvasWidth;
		}
	};
	
	this.draw = function()
	{
		// Draw enough floors to fit the entire screen
		ctx.drawImage(ImageRepository.floor,this.x, this.y, this.width, this.height);
		ctx.drawImage(ImageRepository.floor,this.x + this.width, this.y, this.width, this.height);
		ctx.drawImage(ImageRepository.floor,this.x + this.width * 2, this.y, this.width, this.height);
		ctx.drawImage(ImageRepository.floor,this.x - this.width, this.y, this.width, this.height);
		ctx.drawImage(ImageRepository.floor,this.x - this.width * 2, this.y, this.width, this.height);
	};
}

// Make Floor inherit from Drawable
Floor.prototype = new Drawable();

function Background(image)
{

	this.image = image;
	this.height = canvasHeight;
	this.width = canvasWidth;
	
	this.update = function()
	{
		this.x -= gameSpeed * 0.5;
		if(this.x <= 0)
		{
			this.x = canvasWidth;
		}
	};
	
	this.draw = function()
	{
		ctx.drawImage(this.image,this.x, this.y, this.width, this.height);
		ctx.drawImage(this.image,this.x - this.width, this.y, this.width, this.height);
	};
}

// Make Background inherit from Drawable
Background.prototype = new Drawable();


// Main game class
function Game()
{
	// The player
	this.player;
	
	// Object containing the game's current state
	this.gameState;
	
	// Array containing all obstacles
	this.obstacles = [];
	
	// Array containing all global animations
	this.animations = [];
	
	// The game's scrolling floor
	this.floor;
	
	// The game's scrolling background
	this.background;
	
	// The buttons
	this.startButton;
	
	// The current game state
	this.gamestate;
	
	// The place where the score is written
	this.score;
	
	//*** GAME INITIALIZING FUNCTION ***//
	this.Initialize = function()
	{
		// Instantiate game objects
		
		// Player
		
		this.player = new Player(new Animation(playerImage, new Vector2(0,0), 
										       playerImgRows, playerImgPerRows,
											   playerImgSpeed, true));
		this.player.init();
	
		// Game state
		this.gameState = GameStates.titleScreen;
		
		// Add event listeners for keyboard
		document.body.addEventListener("keydown", function(e) 
		{
			// When a key is pressed down, store in keys array with true value
			keys[e.keyCode] = true;
		});
		
		document.body.addEventListener("keyup", function(e) 
		{
			// When a key is let go of, its value becomes false
			keys[e.keyCode] = false;
		});
		
		this.initializeObstacles();
		
		// Add the floor
		this.floor = new Floor(canvasWidth, gameSpeed);
		this.floor.init(canvasWidth, canvasHeight - floorHeight);
	
		// Add the background
		this.background = new Background(ImageRepository.background);
		this.background.init(canvasWidth, 0);
	
		// Add main menu screen
		this.mainMenu = new Menu(ImageRepository.buttons, "pixel_unicoderegular", 25);
		this.mainMenu.buttons[0] = new MenuImage(ImageRepository.logo);
		this.mainMenu.buttons[1] = new MenuButton("Commencer", GameStates.gameReady);

		this.mainMenu.init();
		
		// Add game over screen
		this.gameOverScreen = new Menu(ImageRepository.buttons, "pixel_unicoderegular", 25);
		this.gameOverScreen.buttons[0] = new MenuImage(ImageRepository.gameOver);
		this.gameOverScreen.buttons[1] = new MenuText("Score will go here");
		//this.gameOverScreen.buttons[2] = new MenuButton("Recommencer", GameStates.reset);
		this.gameOverScreen.buttons[2] = new MenuAnimation(
													new Animation(ImageRepository.eKey,
																  new Vector2(0,0), 1, 2, 4,
																  true, false));
		this.gameOverScreen.init();
		
		
		// Add game ready screen
		this.gameReady = new Menu(ImageRepository.spacebar, "", 0);
		this.gameReady.buttons[0] = new MenuAnimation(
													new Animation(ImageRepository.spacebar,
																  new Vector2(0,0), 2, 1, 4,
																  true, false));
		this.gameReady.init();
		
		// Add the score
		this.score = new Score(ImageRepository.score, "pixel_unicoderegular", 25);
		this.score.init();
		
		// Once everything is initialized, launch the main loop function
		main();
	};
	
	// Obstacles initializing method
	this.initializeObstacles = function()
	{
		// Add obstacles
		for (var i = 0; i < obstaclesAmount; i++)
		{
			// Only initialize the first obstacle at obstacleStartPoint 
			// Others go farther away depending on amount already placed
			var obsStartPoint = (!i) ? obstacleStartPoint : obstacleStartPoint + (obstaclesDistance * i);
			this.obstacles[i] = new Obstacle(obsStartPoint, gameSpeed, ImageRepository.obstacle);
		}
	};
	
	// Function to update obstacles
	this.updateObstacles = function()
	{
		// Update obstacles
		for (var i = 0; i < this.obstacles.length; i++)
		{
			// Update the obstacle
			this.obstacles[i].update();
			
			// If an obstacle was passed by the player
			if(this.obstacles[i].x < this.player.x && !this.obstacles[i].passed && this.player.active)
			{
				this.obstacles[i].passed = true;
				if (++score > bestScore)
				{
					bestScore++;
				}
				
			}
			
			// If obstacle has left the screen, regenerate & relocate
			if(this.obstacles[i].x + (this.obstacles[i].width) < 0)
			{
				this.obstacles[i].generate();
				this.obstacles[i].x = obstaclesRespawnPoint;
				this.obstacles[i].passed = false;
			}
			
			// Check for collisions between player & obstacles
			if (checkCollision(this.player, this.obstacles[i].topObstacle) ||
				checkCollision(this.player, this.obstacles[i].bottomObstacle)
				)
			{					   
				this.player.active = false;
			}
		}
	};
	
	
	//*** GAME UPDATE FUNCTION ***//
	this.update = function()
	{
		// Update different things based on the current game state
		if (this.gameState == GameStates.titleScreen)
		{
			this.mainMenu.update();
		}
		
		// PLAYER HAS DIED - GAME OVER
		if (this.gameState == GameStates.gameOver)
		{
			this.gameOverScreen.update();
			this.updateObstacles();
			this.floor.update();
			this.background.update();
			
			// Reset game when 'E' key is pressed
			if (keys[69])
			{
				this.gameState = GameStates.reset;
			}
		}
		
		// GAME IS READY TO PLAY, PLAYER HAS TO HIT SPACEBAR TO START
		if (this.gameState == GameStates.gameReady)
		{
			// Start music, only if now already playing
			//playIfNotPlaying(gameMusic);
			
			this.floor.update();
			this.background.update();
			
			// Update the gameReady screen
			this.gameReady.update();
			
			// Update the player animation, but not the player itself
			if (this.player.animation.update())
			{
				playRepeatedly(SoundRepository.flap);					
			}
			
			if (keys[32] && !previousSpaceState)
			{
				this.gameState = GameStates.gamePlaying;
			}
		}
		
		// GAME IS CURRENTY BEING PLAYED
		if (this.gameState == GameStates.gamePlaying)
		{
			if(!this.player.active)
			{
				// Play explosion sound effect
				playRepeatedly(SoundRepository.explosion1);
				
				// Add score to game over screen, must reinitialize the menu each time
				this.gameOverScreen.buttons[1] = new MenuText("Votre meilleur score: " + bestScore);
				this.gameOverScreen.init();
				
				this.gameState = GameStates.gameOver;
			}
			
			// Update the player
			this.player.update();
			
			// Update obstacles
			this.updateObstacles();
			
			// Update floor & background
			this.floor.update();
			this.background.update();

		}
		
		// Reset game state
		if (this.gameState == GameStates.reset)
		{
			score = 0;
			this.player.init();
			this.initializeObstacles();
			this.gameState = GameStates.gameReady;
		}
		
		// Update animations
		for(var i = 0; i < this.animations.length; i++)
		{
			this.animations[i].update();
			if (!this.animations[i].active)
			{
				this.animations.splice(i, 1);
			}
		}
		
		// Previous mouse state support
		previousMouseState = mouse.down;
		
		// Previous space key state support
		previousSpaceState = keys[32];
		
	};
	
	//*** GAME DRAW FUNCTION ***//
	this.draw = function()
	{
		// Draw different things based on the current game state
		
		// Clear previous screen
		ctx.beginPath();
		ctx.clearRect(0,0,canvasWidth,canvasHeight);
		ctx.fill();
		
		// Draw background
		
		this.background.draw();
		
		// Draw obstacles
		for (var i = 0; i < this.obstacles.length; i++)
		{
			this.obstacles[i].draw();
		}
		
		if (this.gameState == GameStates.titleScreen)
		{
			// Draw title screen main menu
			this.mainMenu.draw();
		}		
		if (this.gameState == GameStates.gameOver)
		{
			// Draw title screen main menu
			this.gameOverScreen.draw();
		}		
		
		if (this.gameState == GameStates.gamePlaying || this.gameState == GameStates.gameReady)
		{
			// Draw character
			this.player.draw();
		}
		
		if (this.gameState == GameStates.gameReady)
		{
			// Draw the gameReady screen
			this.gameReady.draw();
		}
		
		// Draw floor
		this.floor.draw();
		
		// Draw animations
		for(var i = 0; i < this.animations.length; i++)
		{
			this.animations[i].draw();
		}
		
		// Write current score if current gameState isn't the title screen
		if (this.gameState != GameStates.titleScreen)
		{
			this.score.draw();
		}		
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

//*** CONTROLS HANDLING ***//

// Mouse object
var mouse = 
{
	width: 1,
	height: 1,
	down: false
};

// Gets mouse position inside canvas
function getMousePos(evt) 
{
	var rect = canvas.getBoundingClientRect();
	return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
	};
}

// Event listeners to get the current mouse state
canvas.addEventListener('mousemove', function(evt) 
{
	var position = getMousePos(evt);
	mouse.x = position.x;
	mouse.y = position.y;
}, false);
  
canvas.addEventListener('mousedown', function(evt)
{
	mouse.down = true;
}, false);
  
canvas.addEventListener('mouseup', function(evt)
{
	mouse.down = false;
}, false);
