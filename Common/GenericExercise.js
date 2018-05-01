// Class to manage an Exercise (you must inherit from this class)
function GenericExercise( name, number, callback )
{
    this.UIname = name;
    this.clicked = false;
    this.number = number;
    this.renderTarget_list = new Array();
    this.scene = null;

    this.name = "exo"+number;

    if( callback===undefined) return; 

    // push exercise in UI (assuming node "menu" and "h1-bottom" exist).
    var button = this.createButton(this.name, 
				   this.UIname, 
				   function() { callback(number); } );
    document.getElementById("menu").
	insertBefore(button, document.getElementById("h1-bottom"));
};

GenericExercise.prototype.createButton = function(id, value, onclick) {
    var button = document.createElement("input");
    button.type = "submit";
    button.id = id;
    button.value = value;
    button.setAttribute('class', "button");
    button.onclick = function(){onclick(button);};
    return button;
};

// Get the exercise name
GenericExercise.prototype.GetName = function() {
    return this.name;
};

// Get the exercise number (for UI)
GenericExercise.prototype.GetNumber = function() {
    return this.number;
};

// Reload an exercise (UI) : can (should?) be overloaded
GenericExercise.prototype.Reload = function() 
{
    this.scene.Reload();
};

// Change dimensions ... can be overloaded
GenericExercise.prototype.setDimension = function( width, height ) 
{
    this.scene.setWidth( width );
    this.scene.setHeight( height );
};


// Change the mouse position .. can be overloaded
GenericExercise.prototype.setMouse = function( x, y ) {
    this.scene.setMouse( x, y );
    this.clicked = true;
};
GenericExercise.prototype.mouseMove = function( x, y ) {
    if( this.clicked ) 
	this.scene.setMouse( x, y );
};

// Is the mouse clicked?
GenericExercise.prototype.isClicked = function() {
    return this.clicked;
};

GenericExercise.prototype.releaseMouse = function() {
    this.clicked = false;
};

// some displacements ...
GenericExercise.prototype.addTranslateX = function( x ) 
{ this.scene.addTranslateX( x) ; };
GenericExercise.prototype.addTranslateY = function( x ) 
{ this.scene.addTranslateY( x) ; };
GenericExercise.prototype.multScale = function( x ) 
{ this.scene.multScale( x) ; };

// user actions: you should overload it!
GenericExercise.prototype.onkeypress = function( event ) {
};

// Update the displayed information
GenericExercise.prototype.Display = function(einfo) {
};

// Animate the exercise
GenericExercise.prototype.Animate = function()
{
};

// Show this exercise
GenericExercise.prototype.Show = function() {};

// Hide this exercise
GenericExercise.prototype.Hide = function() {};

// Overload this function in order to compute additionnal items before drawing.
// You should at least specify links between renderTargets and the scene ...
GenericExercise.prototype.Prepare = function( gl )
{
} ;


// Overload this method in order to draw something
GenericExercise.prototype.Draw = function( gl )
{
} ;

GenericExercise.prototype.StartAnimation = function() {};
GenericExercise.prototype.StopAnimation = function() {};
