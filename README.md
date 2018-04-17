# O-LAP  
Open-source computational furniture design.  
--
## What is O-LAP?
We write code which creates furniture designs. The computer generated design can be fed into computer aided fabrication machines(think 3D printing) to create real useable furniture.  
![O-LAP](https://raw.githubusercontent.com/O-LAP/home/master/imgs/wide_banner.gif)

## What is so cool about it?
Writing code which creates the design instead of the human doing it himself, opens up several possibilities. For eg:
- Designs can be customized down to the tenth of a millimeter, and done at scale.  
- Designs can be customized for every user breaking away from convetional rule-of-thumb measurements enforced by the factory based production.  
- Furniture designs have always been fixed; designed once by the designer and mass-produced for decades. This doesn't conform to that.  
- The same source code can create thousands of unique designs.  
- Designs can grow like software projects, merging and forking from other designs.  
- Designs can be manufactured locally by sending the code rather than the product avoiding shipping rather bulky physical products across the planet.  
- It can allow the full process from designing, to design customization & visualization to production be regulated by code.  
- Keeping it open-source breaks away from few inidviduals/companies owning rights over designs.  

## Useful Links
- [Project Page](https://O-LAP.github.io/home)
- [Design Guidelines](https://O-LAP.github.io/home/design-guidelines.html)
- [Design Gallery](https://O-LAP.github.io/home/designs.html)
- [Make Your First Design](https://O-LAP.github.io/home/make-your-first-design.html)
- [Starter Project](https://github.com/O-LAP/starter_project)

## Goal
This project is an attempt at introducing a new way of thinking about design for furniture.  
Good design is a lot about numbers and delivering a platform for coders and designer to "program" furniture explores an unexlored direction.  
It would be great to see coders and designers work collaboratively on designs which can be accessed by everyone.  
It also fundamentally rethinks the way design is presented. Instead of presenting a narrative of the design after "completing" a design, designs here are dynamic, living ideas. The publicly recorded history of the project is the narrative. While this is nothing new for the software developers, it is a new way of thinking for designers.  
Check out the [project page](https://O-LAP.github.io/home) to read more about the vision.  

## How does it work?
Designs are independent repositories with the code and our framework.  
Designs can be submitted to the master repository (this page) by making a pull request to be added to the collection. Once added the design will be shown in the gallery and viewed by fetching the latest design directly from the original public repository which belongs to the designer. Designs submitted need to follow the design submission guilelines to make sure they play well with the framework. Check out the [design submission guidelines](https://O-LAP.github.io/home/design-guidelines.html) to understand the full process.  
The viewer itself is a 3D web application and viewed from any browser.  
The framework allows creation of fabrication drawings from the design, which can be used directly for fabrication.  

## How are we doing it?
This repository is the heart and soul for the project.  
It is powered by Github pages and delivers Javascript applications for visualizing and customizing to the users. The design visualization and customization happens in the browser (powered by [ThreeJS](https://threejs.org/), [VerbsNURBS](http://verbnurbs.com/) and [Materialize CSS](http://materializecss.com/)). You can check out the [Gallery](https://O-LAP.github.io/home/designs.html) to explore some designs.  
Designs are written in Javascript using ThreeJS and VerbsNURBS. Design collaboration is done using Github. To submit designs to be added to the gallery you make a pull request to this project.  
There is no central server/backup or even a website besides this. It's all a network of git repositories and javascript on the client-side. Designs belongs to the repository owners and exist only as long as the design repository is publicly available on Github.  

Check out the [make your first design](https://O-LAP.github.io/home/make-your-first-design.html) page and you can clone the [starter project](https://github.com/O-LAP/starter_project) to get started.  
We highly encourage you to read about [the vision](https://O-LAP.github.io/home) for this project before you submitting a design.  

![O-LAP](https://raw.githubusercontent.com/O-LAP/home/master/imgs/chair_01.jpg)







------------
------------






# Project Page

# O-LAP
## Open source computational furniture

## What do we do?
-- Writing code which does furniture design.
-- Computational design is a field within the practice of design, where designers write algorithms which create design. 
-- We use this approach to create furniture designs.
-- O-LAP is a open-source community run platform for designers to experiment with this concept.

## How we do it?
-- O-LAP is a very light-weight open-source framework which is hosted entirely on Github.
-- Designers host their designs in their own repositories.   

## New possibilities it opens up?









------------
------------






# Design Guideline
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
This is used to generate the thumbnail image in the design [gallery](https://O-LAP.github.io/home/designs.html). We request you show a picture of the complete design which fills the image. without cropping out any portion of the design in the same graphic style as seen in the display app. You can ideally extract this by taking the screenshot of the design in the O-LAP viewing page and cropping it to size (400 x 400 px).  
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
The community is for furniture design and we hope that is what designers will use this for. Once accepted the designs are free to be changed at anytime and the platform has no way to moderate this. As described above we would like to repeat again, we strongly rely on community good behaviour to sustain this model we have.


### 3. Fabrication Guidelines  
These are meant so that designs can be fabricated from the design generated by the designer's code.  
One of the core aspects of a design in O-LAP is that it should be able to generate fabrication drawings from the design hosted. Digital fabrication can be its whole own endeavor so we will try to just touch the topics relevant for us in this article. (and it has a whole bunch of acronyms so get ready for that).

The parts detailed below are great to know while designing an O-LAP, but not essential since the framework takes care of most of it. However we need the designer to provide certain information so that the framework can do its work.

O-LAP designs are meant to be fabricated using a Computer Aided Manufacturing (CAM) production process, which basically means we need to be able to extract Computer Aided Design Drawings (CADD) from the design.

The method of CAM production we focus on is Computer Numerically Controlled (CNC) manufacturing. This generally means a cutting tool(like a laser or drill) planted at the the tip of a head which moves in 2 dimensions - controlled by a computer - and cuts through a sheet material placed below. The CADD design we extract from our design is fed into this machine which traces and cuts the profiles detailed in the CADD drawing to be manufactured. 

The designs are meant to be assembled by the user by interlocking the individual pieces. For this to happen the cuts needs grooves at the right places so that they can interlock into each other.

Some examples of CADD drawings are:

The shapes that have to be cut have to be continuous (does not have any ends) in order to be able to cut and be seperated from the rest of the sheet. Also based on our experience with working with the materials we have determined the following best practices for the designs.
- No inidvidual piece should be smaller than 3" in any dimension. 








------------
------------






# Make Your First Design

Stuff
