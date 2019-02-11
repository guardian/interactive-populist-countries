
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
let currentYear = firstYear;
let currentPopulation = 0;
const countries = [];
const categories = ['Zero', 'Not populist', 'Somewhat populist', 'Populist', 'Very Populist']

const mapEl = $(".interactive-wrapper");

let width = mapEl.getBoundingClientRect().width;
let height = 400;

let canvas = d3.select('.population').append('canvas')
.attr('width', width)
.attr('height', height)

let context = canvas.node().getContext('2d')
context.clearRect(0, 0, width, height);

let population = [];
let totalPopulationByYear =[];
let totalPopulismByCountry =[];
let totalPopulismByYear =[];
let totalPopulationPopulist = 0;
let totalPopulationNotPopulist = 0;


// Key variables:
let nodes = [];
let strength = -0.25;         // default repulsion
let centeringStrength = 0.02; // power of centering force for two clusters
let velocityDecay = 0.15;     // velocity decay: higher value, less overshooting
let outerRadius = 500;        // new nodes within this radius
let innerRadius = 10;        // new nodes outside this radius, initial nodes within.
let startCenter = [width/4,height/2];  // new nodes/initial nodes center point
let endCenter = [width /4 + width /2,height/2];	  // destination center
let n = 1700;		          // number of initial nodes
let cycles = 1000;	          // number of ticks before stopping.


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

	let countryName = null;

	for (let i = firstYear; i <= lastYear; i++) {
		totalPopulationByYear[i] = getTotalPopulation(i)
	}

	d3.map(populism,d => {
		if(countryName != d.country){
			countryName = d.country
			countries.push(countryName)
		}
	});



	countries.forEach(c => {

		let speechCategory = false;

		let results =  {
	        populist1998:speechCategory,
	        populist1999:speechCategory,
	        populist2000:speechCategory,
	        populist2001:speechCategory,
	        populist2002:speechCategory,
	        populist2003:speechCategory,
	        populist2004:speechCategory,
	        populist2005:speechCategory,
	        populist2006:speechCategory,
	        populist2007:speechCategory,
	        populist2008:speechCategory,
	        populist2009:speechCategory,
	        populist2010:speechCategory,
	        populist2011:speechCategory,
	        populist2012:speechCategory,
	        populist2013:speechCategory,
	        populist2014:speechCategory,
	        populist2015:speechCategory,
	        populist2016:speechCategory,
	        populist2017:speechCategory,
	        populist2018:speechCategory,
      };

      	let country = populism.filter(d => d.country == c)
		let years = country.map(c => +c.yearbegin)

		let populismCount = country.map(c => c.speech_category)
		let localPopulism = speechCategory;

		for (var i = firstYear; i <= lastYear; i++) {

			if(years.indexOf(i) != -1){


				if(populismCount[years.indexOf(i)] == 'Somewhat populist' || populismCount[years.indexOf(i)] == 'Very Populist' || populismCount[years.indexOf(i)] == 'Populist')
				{
					localPopulism = true;

				}
				else
				{
					localPopulism = false
				}
				
			}

			results['populist' + i] = localPopulism
		}

		totalPopulismByCountry[c] = results

	})


	setInterval(d => {

		if(currentYear > lastYear){
			currentYear = firstYear;
			nodes.splice(Math.floor(totalPopulationByYear[firstYear] / 1000000), nodes.length);
			currentPopulation = Math.floor(totalPopulationByYear[firstYear] / 1000000);

			totalPopulationPopulist = 0;
			totalPopulationNotPopulist = 0;
		}

		for(let i = currentPopulation; i < Math.floor(totalPopulationByYear[currentYear] / 1000000); i++)
		{
			nodes.push(random())
		}

		countries.map(c =>{


			//console.log(totalPopulismByCountry[c]['populist' + currentYear])


			/*if(getPopulismByCountryAndYear(c, currentYear))
			{
				totalPopulationPopulist = getPopulationByCountryAndYear(c, currentYear);
			}*/
		})

		//totalPopulationNotPopulist = Math.floor(getTotalPopulation(currentYear) / 1000000) - totalPopulationPopulist;

		//console.log(currentYear , '-------------------------<br>' , totalPopulationPopulist, totalPopulationNotPopulist, Math.floor(getTotalPopulation(currentYear) / 1000000))


/*		for(let i = 0; i = Math.floor(Math.random() * 100); i++){

			!nodes[i].migrated ? nodes[i].migrated = true : nodes[i].migrated = false;
		}


*/
/*		populism.map(p => {

			//if(speech.indexOf(p.speech_category) == -1)speech.push( p.speech_category)


			if(+p.yearbegin === currentYear){


				if(p.speech_category != 'Not populist' && p.speech_category != 'Zero')
				{
					console.log(p.country, p.speech_category, getPopulationByCountryAndYear(p.country, currentYear))
				}
				//console.log(p.country, p.speech_category, getPopulationByCountryAndYear(p.country, currentYear))
			}
		})*/

		simulation.nodes(nodes);

		currentPopulation = Math.floor(totalPopulationByYear[currentYear] / 1000000);

		d3.select('.population-title').html(currentYear)

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


function getPopulismByCountryAndYear(country, year){
	return totalPopulismByCountry[country]['populist' + year]
}



// Create a random node:
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



let tick = 0;
	
function ticked() {
	/*//tick++;
	
	//if(tick > cycles) this.stop();



	




	//nodes.push(random()); // create a node
	    // update the nodes.

	

	// Select a random node to migrate:
	let migrating = simulation.find((Math.random() - 0.5) * 50 + startCenter[0], (Math.random() - 0.5) * 50 + startCenter[1], 10);
	if(migrating) migrating.migrated = true; // if one was chosen.

	//console.log('tick')

	//if(tick > 100) this.stop();

	*/
	
	context.clearRect(0,0,width,height);
	
	nodes.forEach(function(d) {
		context.beginPath();
		context.fillStyle = d.migrated ? "steelblue" : "orange";
		context.arc(d.x,d.y,3,0,Math.PI*2);
		context.fill();
	})
}
