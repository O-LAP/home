# Guidelines
Submitted designs have to conform to the following guidlelines:  
- [Presentation & Specification Guidelines](#1-presentation-specification-guidelines)
- [Code Guidelines](#2-code-guidelines)
- [Fabrication Guidelines](#3-fabrication-guidelines)

### 1. Presentation & Specification Guidelines
These are meant so that all designs look good, consistent and show meaningful information about the design in the gallery.  
We only check the content while you are submitting and since the gallery is displayed by fetching content from your the designer's original repository we have no control over how you maintain it. Further moderation action would be taken when reported by someone and may mean actions on the designer for not keeping up with guidelines. We strongly rely on community good behaviour to sustain this model we have.  
The presentation requirements are very low. We only ask you have the following 3 things in place:  
**Basic Information**  
*'design/Design.js'*  
[example](https://raw.githubusercontent.com/amitlzkpa/o-lap_plato/master/design/Design.js)  
This is used to display the name and descriptions wherever it is needed for the design. It is specified in the same file as the design (the same JS object infact, under the property 'info' of the design object).  
```
Design.info = {
	"name": "Massily Chair",
	"designer": "Warcel Breuer",
	"version": "1.0.0",
	"license": "MIT",
	"short_desc": "Designed for Wassily Kandinsky.",		// less than 140 chars
	"long_desc": "I want to ride my bicycle. I want to ride my bike. You say black I say white. You say bark I say bite.",		// less than 2000 chars
	"url": null,											// any external link
	"tags": [ "shiny", "steel", "leather", "tubes" ]
}
```  
**Thumbnail Image**  
*'design/display.jpg' 400 x 400 px*  
[example](https://raw.githubusercontent.com/amitlzkpa/o-lap_plato/master/design/display.jpg)  
This is used to generate the thumbnail image in the design [gallery](https://o-lap.org/designs.html). We request you show a picture of the complete design which fills the image. without cropping out any portion of the design in the same graphic style as seen in the display app. You can ideally extract this by taking the screenshot of the design in the O-LAP viewing page and cropping it to size (400 x 400 px).  
**Developer Readme**  
*'README.md'*  
[example](https://github.com/amitlzkpa/o-lap_plato/blob/master/README.md)  
This is meant to give information to any designer who wishes to fork/extend your project. We request designers to follow a common template for the start of the documents which looks like following:  
```
###### O-LAP Design Page
###### Code and design for [O-LAP](https://o-lap.com)  
---
![Massily Chair](https://raw.githubusercontent.com/amitlzkpa/o-lap_plato/master/design/display.jpg)
# Massily Chair  
###### Designed for Wassily Kandinsky.  
---
```
The content below this can be whatever you wish. It is used to convey information that you think others who are trying to understand your project as a contributor would find useful.

### 2. Code Guidelines
These are meant so that the design can be opened and used by O-LAP framework.  
The file 'designs/Design.js' contains all the code for the design. The file contains a JS object of the same name - Design - which has the following properties and methods which the framework uses.  
```
// contains basic information about the design
Design.info = { ... };

// used to sepcify the parameters the designer would like to expose to a user via the user-interface
Design.inputs = { ... };

// used internally, and contains the current value set by the user for the parameters at all times
Design.inputState = { ... };

// run once at start; designer can use this to initialize any values
Design.init = function() { ... };

// called whenever the user changes a parameter via the user-interface
Design.onParamChange = function(params, group) { ... };

// called when the design is required to be updated in the view
Design.updateGeom = function(group) { ... };
```
We expect designers to use this framework/plugin interface to express their designs. 
The app uses three.js under the hood. The components of the three.js scene are publicly accessible, but we expect that the designs will not change any setting or parameter from this.  
We hope people will submit designs with an openness to share and learn from others. To make your designs easy to understand and read we strongly encourage documenting your project well.  
The community is for furniture design and we hope that is what designers will use this for. Once accepted the designs are free to be changed at anytime and the platform has no way to moderate this. We do this promote complete ownership of designs and nurture an environment where designers can benefit from each other's work. As described above we would like to repeat again, we strongly rely on community good behaviour to sustain this model we have.


### 3. Fabrication Guidelines  
These are meant so that designs can be fabricated from the design generated by the designer's code.  
One of the core aspects of a design in O-LAP is that it should be able to generate fabrication drawings from the design hosted. Digital fabrication can be its whole own endeavor so we will try to just touch the topics relevant for us in this article. (and it has a whole bunch of acronyms so get ready for that).

The parts detailed below are great to know while designing an O-LAP, but not essential since the framework takes care of most of it. However we need the designer to provide certain information so that the framework can do its work.

O-LAP designs are meant to be fabricated using a Computer Aided Manufacturing (CAM) production process, which basically means we need to be able to extract Computer Aided Design Drawings (CADD) from the design.

The method of CAM production we focus on is Computer Numerically Controlled (CNC) manufacturing. This generally means a cutting tool(like a laser or drill) planted at the the tip of a head which moves in 2 dimensions - controlled by a computer - and cuts through a sheet material placed below. The CADD design we extract from our design is fed into this machine which traces and cuts the profiles detailed in the CADD drawing to be manufactured. 

The designs are meant to be assembled by the user by interlocking the individual pieces. For this to happen the cuts needs grooves at the right places so that they can interlock into each other.

An example of what a CADD drawings:
![CADD](https://raw.githubusercontent.com/O-LAP/home/master/imgs/cadd.png)

The shapes that have to be cut have to be continuous (does not have any ends) in order to be able to cut and be seperated from the rest of the sheet. Also based on our experience with working with the materials we have determined the following best practices for the designs.
- Avoid inidvidual pieces smaller than 3" in any dimension.  
- Avoid weak parts in your design where the design can be susceptible to breaking. This might happen near the groove cuts where the meterial gets narrow and heavy material on both sides.
- Think about weight distribution. While you are free from gravity in the browser, it unfornately can't be avoided in the real world. Having grounded surfaces help the weight distribution.
- CNC fabrication machines are available in multiple sizes. The most common ones we have come across which are easy to access are 8' x 4'. So if your individual pieces are bigger than that, it might get difficult to find a fabricator that can make it.
- If you have any members that are not supported directly on ground, plan your groove directions carefully.
