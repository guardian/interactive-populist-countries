
import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import {event as currentEvent} from 'd3-selection';
import * as d3Queue from 'd3-queue'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3Queue);

const dataURL = '<%= path %>/assets/Copy of EDITED Chief Executives MASTER final scores - ALL_VISUALS_EDITED_UNIQUE.csv';
const populationURL = '<%= path %>/assets/population-year.csv';
const firstYear = 1998;
const lastYear = 2018;

const mapEl = $(".interactive-wrapper");

let width = mapEl.getBoundingClientRect().width;
let height = 400;

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

// Key variables:
let nodes = [];
let strength = -0.25;         // default repulsion
let centeringStrength = 0.02; // power of centering force for two clusters
let velocityDecay = 0.15;     // velocity decay: higher value, less overshooting
let outerRadius = 500;        // new nodes within this radius
let innerRadius = 10;        // new nodes outside this radius, initial nodes within.
let startCenter = [width/4,height/2];  // new nodes/initial nodes center point
let endCenter = [width /4 + width /2,height/2];	  // destination center

let simulation = d3.forceSimulation()
.force("charge", d3.forceManyBody().strength(function(d) { return d.strength; } ))
.force("x1",d3.forceX().x(function(d) { return d.migrated ? endCenter[0] : startCenter[0] }).strength(centeringStrength))
.force("y1",d3.forceY().y(function(d) { return d.migrated ? endCenter[1] : startCenter[1] }).strength(centeringStrength))
.alphaDecay(0)
.velocityDecay(velocityDecay)
.on("tick", ticked);

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

	 	console.log(currentYear)
	 	console.log(Math.floor(currentPopulistPopulation / 1000000), Math.floor(currentNotPopulistPopulation / 1000000))
	 	
	 	console.log('------------------------ ')

		for(let i = currentPopulation; i < Math.floor(totalPopulationByYear[currentYear] / 1000000); i++)
		{
			nodes.push(random())
		}

		nodes.forEach(n => {

			n.migrated = false;
		})
		

		for(let i = 0; i < Math.floor(currentPopulistPopulation / 1000000); i++)
		{
			nodes[i].migrated = true;
		}

		simulation.nodes(nodes);

		currentPopulation = Math.floor(totalPopulationByYear[currentYear] / 1000000);

		d3.select('.population-title').html(currentYear)

		if(currentYear == lastYear){
			

			clearInterval(interval)

			simulation.stop();

			
		}

		currentYear++

	}, 2000)

	simulation.alpha(1).restart();
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
	let angle = Math.random() * Math.PI * 2;
	let distance = Math.random() * (outerRadius - innerRadius) + innerRadius;
	let x = Math.cos(angle) * distance + startCenter[0];
	let y = Math.sin(angle) * distance + startCenter[1];
	
	return { 
	   x: x,
	   y: y,
	   strength: strength,
	   migrated: false
	   }
}


function ticked() {

	context.clearRect(0,0,width,height);
	
	nodes.forEach(d => {
		context.beginPath();
		context.fillStyle = d.migrated ? "#7E57BB" : "#dcdcdc";
		context.arc(d.x,d.y,3,0,Math.PI*2);
		context.fill();
	})
}
