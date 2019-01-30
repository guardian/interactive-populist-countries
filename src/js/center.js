import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import {event as currentEvent} from 'd3-selection';
import * as d3Queue from 'd3-queue'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3Queue);

const dataURL = '<%= path %>/assets/Copy of EDITED Chief Executives MASTER final scores - ALL_VISUALS_EDITED_UNIQUE.csv';
const firstYear = 1998;
const lastYear = 2018;
let currentYear = 1998;
const countries = ['Argentina','Armenia','Austria','Belarus','Bolivia','Brazil','Bulgaria','Canada','Chile','Colombia','Costa Rica','Croatia','Czech Republic','Dominican Republic','Ecuador','El Salvador','France','Germany','Guatemala','Honduras','Hungary','India','Italy','Latvia','Mexico','Moldova','Netherlands','Nicaragua','Norway','Panama','Paraguay','Peru','Poland','Romania','Russia','Slovakia','Spain','Sweden','Tajikistan','Turkey','UK','Ukraine','United States','Uruguay','Venezuela'];
const categories = ['null', 'NA','Zero', 'Not populist', 'Somewhat populist', 'Populist', 'Very Populist']

const mapEl = $(".interactive-wrapper");

let width = mapEl.getBoundingClientRect().width;
let height = 900;

let nodes = [];
let circle = null;
let annotations = null;

let svg = d3.select(".center-svg")
.append('svg')
.attr('width', width)
.attr('height', height)

svg
.selectAll('circle')
.data(categories)
.enter()
.append('circle')
.attr('cx', width /2)
.attr('cy', height /2)
.attr('r', (d,i) => i * 50)
.style('fill', 'none')
.style('stroke', '#dcdcdc')

var simulation = d3.forceSimulation()
    .force("charge", d3.forceCollide().radius(5))
    .on("tick", ticked);

simulation.stop()

Promise.all([
	d3.csv(dataURL)
	])
.then(ready)

function ready(csv){
	d3.select(".center-title").html(currentYear)

	let data = csv[0];

	countries.forEach(c => {

		let speechCategory = null;

		let node =  {
			country:c.split(' ').join('-'),
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
	        radius:5
      };

		let country = data.filter(d => d.country == c)
		let years = country.map(c => +c.yearbegin)
		let populism = country.map(c => c.speech_category)
		let localPopulism = speechCategory;

		for (var i = firstYear; i <= lastYear; i++) {

			if(years.indexOf(i) != -1){
				localPopulism = populism[years.indexOf(i)];
			}

			node['populist' + i] = localPopulism
		}

		nodes.push(node)
	})

	console.log(nodes)

	annotations = svg.selectAll('text')
		.data(nodes)
		.enter()
		.append('text')
		.attr('class', d => {return'text' + d['populist' + currentYear] })
		.text(d=> {return d.country})





    circle = svg.selectAll('rect')
	.data(nodes)
	.enter()
	.append('rect')
	.attr('width', 8)
	.attr('height', 8)
	/*.attr('cx', 0)
	.attr('cy', 0)*/
	.attr('class', d => d['populist' + currentYear] )
	//.attr('d', d => {console.log(d.country, d.radius); return d.radius})

	
 simulation
    .nodes(nodes)
    .force("r", d3.forceRadial(function(d) { return (categories.length-1 - categories.indexOf(d['populist' + currentYear])) * 50 }))
    .restart();

	setInterval(d => {
		currentYear++
		if(currentYear > lastYear) currentYear = firstYear;

		
		
		simulation.force("r", d3.forceRadial(d => (categories.length-1 - categories.indexOf(d['populist' + currentYear])) * 50 ))
		.force("collide", d3.forceCollide().radius(6))
		
		d3.select(".center-title").html(currentYear)
		simulation.alpha(1).restart();
	}, 2000);


}



function ticked() {
  circle
  .attr('class', d => d.country + ' ' +d['populist' + currentYear] )
  .attr("x", function(d) { return d.x + width /2; })
  .attr("y", function(d) { return d.y + height /2; });

  annotations
  .attr('class', d => {return'text' + d['populist' + currentYear] })
  .attr('x', d => d.x + width/2)
  .attr('y', d => d.y + height /2)
}