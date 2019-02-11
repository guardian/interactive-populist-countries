import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import {event as currentEvent} from 'd3-selection';
import * as d3Queue from 'd3-queue'
import * as d3Interpolate from 'd3-interpolate'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3Queue, d3Interpolate);
const mapEl = $(".interactive-wrapper");
const dataURL = '<%= path %>/assets/Copy of EDITED Chief Executives MASTER final scores - UNIQUE_40.csv';
const populationURL = '<%= path %>/assets/Population size for populism things - Sheet1.csv';
const firstYear = 1998;
const lastYear = 2018;
const countries = [];
let nodes = [];
let currentYear = firstYear;


let i = d3.interpolateLab('#fafafa', '#c70000');



d3.select(".unique-title").html(currentYear)

let width = mapEl.getBoundingClientRect().width;
let height = 300;

let svg = d3.select(".unique-svg")
.append('svg')
.attr("width", width)
.attr("height", height)

let lineGenerator = d3.line();
let points = [
[0,height/2],
[width,height/2]
]

let bees;
let annotations;
let pathData = lineGenerator(points);

let axis = svg.append('path')
.attr('d', pathData)
.attr('class', 'axis');

let center = {x: 0, y:0}

let forceStrength = 0.02;

let simulation = d3.forceSimulation()
.velocityDecay(0.5)
.force('x', d3.forceX().strength(forceStrength).x(center.x))
.force('y', d3.forceY().strength(forceStrength).y(center.y))
.force('charge', d3.forceManyBody().strength(charge))
.force("collide", d3.forceCollide().radius(d => d.radius))
.on('tick', beesTicked);

simulation.stop();

Promise.all([
	d3.csv(dataURL),
	d3.csv(populationURL)
	])
.then(ready)

function ready(csv){

	let data = csv[0];
	let populations = csv[1];
	let countryName = null;

	let maxPopulation = d3.max(populations, d => +d.Population2008);
	let maxRadius = 60;

	let scale = d3.scaleSqrt()
	.domain([0, maxPopulation])
	.range([0, 40]);

	d3.map(data, d => {
		if(countryName != d.country){
			countryName = d.country
			countries.push({country: countryName, region: d.region.split('&').join('and')})
		}
	});

	countries.forEach(c => {

		let population = populations.find(p => p.Country == c.country).Population2008;

		let speechCategory = null;

		let node =  {
			country:c.country.split(' ').join('-'),
			region:c.region,
			population:population,
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
	        radius:scale(population)
      };
      	let country = data.filter(d => d.country == c.country)
		let years = country.map(c => +c.yearbegin)

		let populism = country.map(c => c.totalaverage)
		let localPopulism = speechCategory;

		for (var i = firstYear; i <= lastYear; i++) {

			if(years.indexOf(i) != -1){
				localPopulism = populism[years.indexOf(i)];
			}

			node['populist' + i] = localPopulism
		}

		nodes.push(node)
	})

	simulation.nodes(nodes)

	simulation.force('x', d3.forceX().strength(forceStrength).x(nodePopulismPosX))
	simulation.force('y', d3.forceX().strength(0.2).x(nodePopulismPosX))
	simulation.alpha(1).restart();

	bees = svg.selectAll('circle')
	.data(nodes)
	.enter()
	.append('circle')
	//.attr('class', d => d.region + ' ' + d.country)
	.attr('r', d => d.radius)


	annotations = svg.selectAll('text')
	.data(nodes.filter(d => d.population > 27000000 && d.population < 40500000))
	.enter()
	.append('text')
	.text(d=>d.country)



	setInterval(d => {
		currentYear++
		if(currentYear > lastYear) currentYear = firstYear;

		//console.log(simulation.force('x', d3.forceX().strength(forceStrength).x(nodePopulismPosX)))
		simulation.force('x', d3.forceX().strength(forceStrength).x(nodePopulismPosX))
		simulation.force('y', d3.forceX().strength(0.2).x(nodePopulismPosX))
		d3.select(".unique-title").html(currentYear)
		simulation.alpha(1).restart();
	}, 2000);


}

function nodePopulismPosX(d) {
  return ((width -20) * d['populist'+currentYear] / 2)
}

function nodePopulismPosY(d) {
  return height /2
}

function beesTicked() {
  bees
  .attr('cx', d => d.x + 50)
  .attr('cy', d => d.y + height /2)
  .attr('fill', d => i(d['populist'+currentYear] / 2))

  annotations
  .attr('x', d => {return d.x})
  .attr('y', d => d.y + height /2)
}


function charge(d) {
    return Math.pow(d.radius, 2.0) * forceStrength;
}