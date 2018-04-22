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