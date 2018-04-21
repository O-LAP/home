# Quick Start
Get the starter project by cloning `https://github.com/O-LAP/starter_project.git`.  
The template project contains all files necessary to get going.
Once you clone the repository you will get the contents as follows:  
```  

- design
  - Design.js
  - EmptyDesignTemplate.js
  - designs.jpg
- olap
  - css
    - materialize.min.css
    - style.css
  - js
    - materialize.js
      - init.js
      - jquery-3.3.1.min.js
      - materialize.min.js
    - three.js
      -	Detector.js
	  - OrbitControls.js
	  - THREEx.FullScreen.js
	  - THREEx.WindowResize.js
	  - THREEx.screenshot.js
	  - three.js
	  - threeScene.js 
	  - verb.js
	  - verbToThreeConversion.js
    - OLAPFramework.js
- README.md
- dev.html
```  

The folder named `olap` contains files for the framework and is meant to be kept as it is.  
The `designs` folder contains the files meant for the designer to work with.  
&nbsp;&nbsp; The `Design.js` file contains some sample code showing a cube which can parametrically modified.  
&nbsp;&nbsp; The `EmptyDesignTemplate.js` file is a blank canvas that you can use to start your design.  
The `README.md` is meant to be the read me file for the design and git repo.  
The `dev.html` file is the development harness which emulates the OLAP web app.  

O-LAP follows a decentralized mode of operations. The designs are logic written by the designer in Javascript which is displayed to the user by fetching the code from the designer's repository and running it in the user's browser. The designs and data themselves are maintained by each Github repository holder (and Github of course).  
For example if you decide to make a design, you would ideally clone the `starter_project` repository, modify it to make your design. Once you think it is at a point you want to publish it, you can submit the link to your repository to the O-LAP app as a pull request (We will cover the exact details later in this post). Once it is accepted, the link to your Github design repo is added to the O-LAP gallery and when someone visits the link to this page (served via Github Pages), the framework directly fetches your design from the last commit on the master branch in your repository. We don't try to curate what/how your design looks or works like. However if we run into issues with unwanted content or abusing the platform we may have to change this.  

The `starter_project` has files in place to let you run and test your design in a development environment and once you push it and register it with the main app, it runs smoothly with the framework. The framework requires the design logic to be captured in a Javascript object which we call ... drumroll ... `Design`. This object has a bunch of methods and properties which makes it play well with the O-LAP framework. They are as follows:  
```  

Design.info = { ... };
Design.inputs = { ... };
Design.inputState = { ... };
Design.init = function() { ... };
Design.onParamChange = function(params, group) { ... };
Design.updateGeom = function(group) { ... };
```  

More details on this to follow.  
You can add more methods/properties as long as you don't modify these core ones.  

You can open up the `dev.html` file in a browser to see what the design looks like.  
It should show a simple cube which can be controlled using parameters in the browser.  
You can use your mouse to rotate and view the design and play with the parameters to explore this 'design'.  
Let's quickly run through the javascript design file for the cube to understand how it works and then we can move on to creating our own design from scratch.  

At the top you will see the design meta information which looks like this.  
```  

Design.info = {
	"name": "Boxy",
	"designer": "Roxy",
	"version": "1.0.0",
	"license": "MIT",
	"short_desc": "Template design file demoing project setup.",
	"long_desc": "",
	"url": null,
	"tags": [ "", "" ]
}
```  

This is used to render information about the design in the gallery and wherever else the relevant information is required. Let's go thorugh each one.  
`name`: Used as the design display name.  
`designer`: Used as the name to be displayed as designer. The design is owned by the designer's repository under his Github account, but this name is used just for display.  
`version`: Like software, the code that generatesyo9ur design can changer overtime. You can use the version number to capture that as your design moves forward.  
`license`: Specify what license type you wish to apply for your designs.  
`short_desc`: Used to show short descriptions of your design wherever needed. Please keep it less than 140 characters.  
`long_desc`: Used to give a more detailed description for your design. Please keep it less than 2000 characters.  
`url`: Used to point to any external link you can maintain for your design.  
`tags`: You can add upto 10 tags for your design.  
`message`: Displayed in the UI to explain anything you may want about the parameters. *******************************  

Let's also quickly glance where these show up the user-interface.
[insert image]

Below this is the section which has the logic for how the code works.  
It starts by declaring some variables that will be useful.  

Let us now look at the design object properties and methods described earlier.
```  

Design.inputs = { ... };
```  

This property is used to sepcify the parameters the designer would like to expose to a user via the user-interface.  
There are 3 types of paramaters you can provide - `slider`, `bool` and `select`.  
&nbsp;&nbsp; `slider` is used to allow the user to pick a numercial value from a continuous range. The values are in integers.  
&nbsp;&nbsp; `bool` allows the user to pick from a yes/no value.  
&nbsp;&nbsp; `select` allows the user to select one from a list of values.  

To add parameters to your design you need to register them at two places.  
- Add a key-value pair to `Design.inputs` with a name for the parameter as key and value as an object which depends on the parameter type. This key is what will be used to refer to the current value of the parameter in the code. Example below.  
- Add the key to the `params` property of the `Design.info`.   
```  

Design.inputs = {

	"params": ["width", "height", "doubleWidth", "colour", "finish"],

	"width": { 
		"type": "slider",								// specify type
		"label": "Width",								// Label name is the name displayed for the property in the UI
		"default": 150,									// The value this parameter will be set on initializiation
		"min": 100,										// The upper range of the slider
		"max": 200										// The lower range of the slider
	},
	"height": { 
		"type": "slider",						
		"label": "Height",
		"default": 150,
		"min": 100,
		"max": 200
	},
	"doubleWidth": {
		"type": "bool",
		"label": "Double Width",
		"default": false
	},
	"colour": {
		"type": "select",
		"label": "Colour",
		"default": COL_RED,
		"choices": [COL_RED, COL_GREEN, COL_BLUE]		// list of choices to be offered
	},
	"finish": {
		"type": "select",
		"label": "Finish",
		"default": FIN_MATT,
		"choices": [FIN_MATT, FIN_GLOSS]
	}
}
```  

Below this you will find the input state property.  
You can use this to access the current value set by the user for the parameters at all times. For eg.  
To access the value for `height` parameter you can use `Design.inputState.height`.  
```  

Design.inputState = { ... };
```  

The initializiation method is run once at start; and can be used this to initialize any values. It is called before loading the UI. The render calls or parameter update calls are made after the UI is updated.  
```  

Design.init = function() { ... };
```  

The parameter change callback is called whenever the user changes a parameter via the user-interface. It is called as soon as the value is changed, so it will be called each time the value updates when a user drags the slider.  
```  

Design.onParamChange = function(params, group) { ... };
```  

The call to update the geometry is made when the design is required to be updated in the view. It happens after every parameter change and on initital load. It passes in an empty `ThreeGroup` object which is the container for the user to add geometries to. The framework removes the group from the previous update call and adds the group from this call to the scene after the end of this call.  
```  

Design.updateGeom = function(group) { ... };
```  

Let us quickly look at what the updateGeometry method looks like for this simple cube.
```  

Design.updateGeom = function(group) {
	var geometry = new THREE.BoxGeometry( 200, Design.inputState.height, Design.inputState.width * ((Design.inputState.doubleWidth) ? 2 : 1) );
	var material = getMaterial(Design.inputState.colour, Design.inputState.finish);
	var cube = new THREE.Mesh( geometry, material );
	cube.position.y = Design.inputState.height/2;
	group.add( cube );
}
```  

This is simple ThreeJS code. On the first line it creates a `BoxGeometry` using values from the current state of inputs for `height` and `width`. The `doubleWidth` boolean doubles the width if set to true.  
The next line creates a new material based on the `colour` and `finish` values. The next line create a ThreeJS mesh.  
The line after that adds it to the group which is added to the scene by the framework after the end of this call.  

