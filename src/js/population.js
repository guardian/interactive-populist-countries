
import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import * as d3Polygon from 'd3-polygon'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3Polygon);

const dataURL = '<%= path %>/assets/Copy of EDITED Chief Executives MASTER final scores - ALL_VISUALS_EDITED_UNIQUE.csv';
const populationURL = '<%= path %>/assets/population-year.csv';
const firstYear = 2002;
const lastYear = 2018;

const mapEl = $(".interactive-wrapper");

let isMobile = window.matchMedia('(max-width: 420px)').matches;

let width = mapEl.getBoundingClientRect().width;
let height = isMobile ? width * 5 / 3: width * 3 / 5;

let flag = false;

let canvas = d3.select('.population').append('canvas')
.attr('width', width)
.attr('height', height)

let context = canvas.node().getContext('2d')
context.clearRect(0, 0, width, height);

let population =[];
let totalPopulationByYear = [];
let currentYear = firstYear;
let currentPopulation = 0;

let currentPopulistCountries = [];
let currentNotPopulistCountries = [];

let minimumGroup = 2000000;

// Key variables:
let nodes = [];
let strength = isMobile ? -1 :-1.9;         // default repulsion
let centeringStrength = isMobile ? 0.05 : 0.04; // power of centering force for two clusters
let velocityDecay = 0.3;     // velocity decay: higher value, less overshooting
/*let outerRadius = 1000;        // new nodes within this radius
let innerRadius = 100;     */   // new nodes outside this radius, initial nodes within.
let startCenter = isMobile ? [width/2, height/4] : [width/4, height/2];  // new nodes/initial nodes center point
let endCenter = isMobile ? [width/2,height/4 + height/2]: [width /4 + width /2, height/2];	  // destination center

let notPopulistText = d3.select('.population').append('text')
.style('left','200px' )
.style('top',startCenter[1] - 10 + 'px')
.attr('class', 'populist-text')

let populistText = d3.select('.population').append('text')
.style('left',endCenter[0] + 'px' )
.style('top',endCenter[1] - 10 + 'px'  )
.attr('class', 'populist-text')


let simulation = d3.forceSimulation()
.force("charge", d3.forceManyBody().strength(function(d) { return d.strength; } ))
.force("x1",d3.forceX().x(function(d) { return d.migrated ? endCenter[0] : startCenter[0] }).strength(centeringStrength))
.force("y1",d3.forceY().y(function(d) { return d.migrated ? endCenter[1] : startCenter[1] }).strength(centeringStrength))
.alphaDecay(0)
.velocityDecay(velocityDecay)
.on("tick", ticked);

let interpotation = d3.interpolateLab("#dcdcdc", "#7E57BB");


simulation.stop();

Promise.all([
	d3.csv(dataURL),
	d3.csv(populationURL)
	])
.then(ready)

function ready(csv){

	let populism = csv[0];
	population = csv[1];

	for (let i = firstYear; i <= lastYear; i++) {
		totalPopulationByYear[i] = getTotalPopulation(i)
	}

	let interval = setInterval(d => {

		if(!flag){

			if(currentYear == 2005 || currentYear == 2003){
			pause(5)
		}

			let currentCountries = populism.filter(p => +p.yearbegin === currentYear);
	 	     
	 	let currentPopulist = currentCountries.filter(c => c.speech_category === "Very Populist" || c.speech_category === "Populist" || c.speech_category === "Somewhat populist")
	 	let currentNotPopulist = currentCountries.filter(c => c.speech_category === "Not populist" || c.speech_category === "Zero" || c.speech_category === "NA")

	 	currentPopulist.map(c=> {
	 		if(currentNotPopulistCountries.indexOf(c.country) != -1)currentNotPopulistCountries.splice(currentNotPopulistCountries.indexOf(c.country),1)
	 		if(currentPopulistCountries.indexOf(c.country) == -1)currentPopulistCountries.push(c.country)
	 	})
	 	currentNotPopulist.map(c=>{
	 		if(currentPopulistCountries.indexOf(c.country) != -1)currentPopulistCountries.splice(currentPopulistCountries.indexOf(c.country),1)
	 		if(currentNotPopulistCountries.indexOf(c.country) == -1)currentNotPopulistCountries.push(c.country)
	 	})

	 	let currentPopulistPopulation = 0;

	 	currentPopulistCountries.map(c => {
	 		currentPopulistPopulation += +getPopulationByCountryAndYear(c, currentYear)
	 	})

	 	let currentNotPopulistPopulation = 0;

	 	currentNotPopulistCountries.map(c => {
	 		currentNotPopulistPopulation += +getPopulationByCountryAndYear(c, currentYear)
	 	})

	 	/*console.log(currentYear)
	 	console.log(Math.floor(currentPopulistPopulation / minimumGroup), Math.floor(currentNotPopulistPopulation / minimumGroup))*/
	 	
	 	console.log('------------------------')

	 	populistText.text(currentPopulistCountries[currentPopulistCountries.length -1])
	 	notPopulistText.text(currentNotPopulistCountries[currentNotPopulistCountries.length -1])//.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))

		for(let i = currentPopulation; i < Math.floor(totalPopulationByYear[currentYear] / minimumGroup); i++)
		{
			nodes.push(random())
		}

		currentPopulation = Math.floor(totalPopulationByYear[currentYear] / minimumGroup);

		nodes.forEach(n => {

			n.migrated = false;
		})
		

		for(let i = 0; i < Math.floor(currentPopulistPopulation / minimumGroup); i++)
		{
			nodes[i].migrated = true;
		}

		simulation.nodes(nodes);

		d3.select('.population-title').html(currentYear)

		if(currentYear == lastYear){

			clearInterval(interval)

		}


		currentYear++



		}

	}, 2000 )

	simulation.alpha(1).restart();
}




function pause(timeLapse){

	flag = true;

	let sec = 0;

	let timer = setInterval(d => { console.log(sec);

		sec++;

		if(sec == timeLapse){

			clearInterval(timer)
			flag = false
		}
	}, 1000)

}




function getTotalPopulation(year){

	let totalPopulation = 0;

	population.forEach(p => {
		totalPopulation += +p['population' + year];
	})

	return totalPopulation
}

function getPopulationByCountryAndYear(country, year){

	let totalPopulation = 0;

	population.forEach(p => {
		if(p.Country === country){

			totalPopulation = p['population' + year];

		}
	})

	return totalPopulation

}

function random(){
/*	let angle = Math.random() * Math.PI * 2;
	let distance = Math.random() * (outerRadius - innerRadius) + innerRadius;
	let x = Math.cos(angle) * distance + startCenter[0];
	let y = Math.sin(angle) * distance + startCenter[1];*/

	return { 
	   x: startCenter[0],
	   y: startCenter[1],
	   strength: strength,
	   migrated: false
	   }
}


let tick = 0;


function ticked() {

	context.clearRect(0,0,width,height);

	/*if(tick >= 1000) simulation.stop();

	tick++

	let angle = Math.PI / 2 + tick;
	let x = Math.cos(angle) * tick + startCenter[0];
	let y = Math.sin(angle) * tick + startCenter[1];

	var migrating = simulation.find(startCenter[0], startCenter[1]);
	console.log(migrating)
	if(migrating) !migrating.migrated ? migrating.migrated = true : migrating.migrated = false; // if one was chosen.*/
	
	nodes.forEach(d => {

		context.beginPath();
		
		context.fillStyle = d.migrated ? "#7E57BB" : "#dcdcdc";
		context.arc(d.x,d.y,3,0,Math.PI*2);

		context.fill();
	})
}