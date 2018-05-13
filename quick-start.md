# Quick Start

This guide will help you create your first parametric computational piece of design.  
It assumes you have an understanding of Javascript, Git (basics) and [ThreeJS](https://threejs.org/).  
You can [check out](https://o-lap.org/app.html?a=amitlzkpa&r=o-lap_plato) one of the designs from our gallery to see what that looks like.  
With this guide you will create computational geometry which can be included in the O-LAP Design Gallery.  
Let's get started.  

Get the starter project by cloning `https://github.com/O-LAP/starter_project.git`.  
The starter project is configured to show a simple cube which can be controlled using parameters in the browser.  
You can open up the `dev.html` file in a browser to see what the design looks like.  

The `designs` folder contains all the files you need for the design.  
&nbsp;&nbsp;&nbsp;&nbsp; The `Design.js` file contains some sample code showing a cube which can parametrically modified.  
&nbsp;&nbsp;&nbsp;&nbsp; The `EmptyDesignTemplate.js` file is a blank canvas that you can use to start your design. (Replacing the `Design.js` file).   
The `README.md` is meant to be the read me file for the design and git repo.  
The `dev.html` file is the development harness which emulates the OLAP web app. (This file would later have to be manually copied on updates.)  

The `starter_project` has files in place to let you run and test your design in a development environment and once you push it and register it with the main app, it runs smoothly with the framework as well. The framework requires the design logic to be captured in a Javascript object called `Design`.  
```  
Design.info = { ... };
Design.inputs = { ... };
Design.inputState = { ... };
Design.init = function() { ... };
Design.onParamChange = function(params) { ... };
Design.updateGeom = function(group, sliceManager) { ... };
```  

You can add more methods/properties as you need without altering these.  

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
This is used to show information about the design on the gallery.  
Let's quickly glance where these show up.
![UI](https://raw.githubusercontent.com/O-LAP/home/master/imgs/ui-explain.jpg)

Let us now look at the design object properties and methods described earlier.
```  

Design.inputs = { ... };
```  

This property is used to sepcify the parameters you would like to expose to a user via the user-interface. The UI is only updated once when the design is loaded.  
There are 3 types of paramaters you can provide - `slider`, `bool` and `select`.  
&nbsp;&nbsp;&nbsp;&nbsp; `slider` is used to allow the user to pick a numercial value from a continuous range. The values are in integers.  
&nbsp;&nbsp;&nbsp;&nbsp; `bool` allows the user to pick from a yes/no value.  
&nbsp;&nbsp;&nbsp;&nbsp; `select` allows the user to select one from a list of values.  

To add a parameters to your design you need to register it by adding a key-value pair to `Design.input`.
The key will be used to refer to the current value of the parameter and and the value is the configuration object for the parameter.  
```  

Design.inputs = {
    "width": { 
        // Specify type
        "type": "slider",
        // Label name is the name displayed for the property in the UI
        "label": "Width",
        // The value this parameter will be set on initializiation
        "default": 150,
        // The lower range of the slider
        "min": 100,
        // The upper range of the slider
        "max": 200
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
        // list of choices to be offered
        "choices": [COL_RED, COL_GREEN, COL_BLUE]
    },
    "finish": {
        "type": "select",
        "label": "Finish",
        "default": FIN_MATT,
        "choices": [FIN_MATT, FIN_GLOSS]
    }
}
```  

You can use `Design.inputState` to access the current value set by the user for the parameters at all times. For eg.  
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

Design.onParamChange = function(params) { ... };
```  

The call to update the geometry is made when the design is required to be updated in the view. It happens after every parameter change and on initital load. It passes in an empty `THREE.Object3D` which is the container for you to add geometries to and a `SliceManager` which the you can use to specify how to make the 'slices' for the design. References from the previous update call are discarded and fresh instances for every call are used.  
```  

Design.updateGeom = function(group, sliceManager) { ... };
```  

Let us quickly look at what the `updateGeometry` method looks like for this simple cube.
```  

Design.updateGeom = function(group, sliceManager) {
    var geometry = new THREE.BoxGeometry( 200,
                                          Design.inputState.height,
                                          Design.inputState.width * ((Design.inputState.doubleWidth) ? 2 : 1)
                                        );
    var material = getMaterial(Design.inputState.colour, Design.inputState.finish);
    var cube = new THREE.Mesh( geometry, material );
    cube.position.y = Design.inputState.height/2;

    sliceManager.addSliceSet({uDir: true, start: -80, end: 80, cuts: 3});
    sliceManager.addSliceSet({uDir: false, start: -90, end: 90, cuts: 4});

    group.add( cube );
}
```  

The first 4 lines are pure threeJS code, where it creates a simple `BoxGeometry` based on the parameter values.  
This is the main part of your design which you would need to modify to create a design using the parameter values.  
You can work with any threeJS mesh to define the geometry of your design.  
All geometry passed into the `group` is 'sliced' by the slicing configuration which you will provide in the next step.  

Slicing is the process of going from extracting straight sections from your design which we can us to fabricate the design.  
Read the [general info]() to understand the process.  

Use the `sliceManager` to communicate to the framework how you want the design to be sliced.  
We do this by passing a `config` object to the SliceManager.  
Let us start creating the slices for the cube along the X-axis at -80 and go up +80 with 3 slices equally distributed in that range. All distances are in millimetres.  To do that we pass in an object that looks like this.  
`{uDir: true, start: -80, end: 80, cuts: 3}`  
To create another set of slices along the Y-axis which start at -90 and go up to +90 with 4 cuts , we pass in an object like this.  
`{uDir: true, start: -90, end: 90, cuts: 4}`  
*Make sure to specify the slicing configuration right before adding the geometry.*  
Generally, with two sets of slices in the opposite directions you should have designs which can be fabricated.  
But you need to be careful about how you think of this in your design.  
Read the [design guidelines](https://github.com/O-LAP/home/blob/master/guidelines.md) to get a better understanding of this.  

With this done you have a parametric cube which was modeled in the browser.  
You can download the design by using the 'Download' button on the UI bottom right.  
This file can be used to get the box fabricated.  

While this quick walk through demonstrated how you can paarmetrically model a cube.  
You can adapt this logic to create any kind of parametric furniture design.  
Check out [this](https://medium.com/@olapdesign/design-for-a-rocking-chair-8a1a1e109d7f) article to understand the use of computational techniques for furniture design.  
After you are done with the designing, run through all the possible design scenarios and make sure everything is working correct.  

Once you have a design you are happy with you can progress to submitting your design.  


## Submit Your Design
Designs will be accepted into the main repo via pull requests. This will allow for a meaningful discussion in the add publish process.  
Go to `https://github.com/O-LAP/home/edit/master/data/OLAP_DesignCollection.js`.  
If it is your first time adding a design you will be requested to fork the repo. Do it.  
Add the link to your repository (eg `https://github.com/amitlzkpa/o-lap_plato`) to the list inside `OLAP_DesignCollection` (check you have the commas at the right place).  
Please make only one change at a time. Any proposals with more than one change will be rejected even if everything else is in place. 
Click to propose the change. It will be moderated by one of the maintainers and if any further discussion is required it would happen via this page.  
If accepted...hooray!!...we have a Michenangelo in the making!  
As a community we hope the same process will be used to moderate designs which fail the requirements.  


## Publish An Update For Your Design
Make updates to the design file.  
You don't have to update your file at the same time. In fact its better to make your changes in small steps as seperate commits. With each commit include a meaningful description of what, how and why you made the changes.  
Update the `Design.js` file to make only the version update change.  
**Modify the version number in at `"version": "x.y.z",`(line 11) inside `Design.js`**  
*x.y.z (x: major changes; y: minor changes; z: tweaks)   (more details)[https://semver.org/]*  
In the update commit use following syntax for commit message `publishing update <design version number>`  
That's it!


## Fork Another Design  
Open up bash to a folder. Run `git clone <repo you want to fork>`.  
Open up `Design.js` and make your changes.  
*You might want to rename the folder to whatever you would like to name your design*.  
After you are done making changes, reset the design version to `1.0.0` by modifying `"version": "x.y.z"`, (line 11) inside `Design.js`  
Update other information like `name, short_desc, long_desc, message` etc.  
*Start thinking of this design as a new design from now on.*  
If you want to continue pulling changes from the parent repo follow (page)[https://gist.github.com/CristinaSolana/1885435].  
Submit your forked design as a new design by following the `Submit Your Design` process.  
You are set!   
