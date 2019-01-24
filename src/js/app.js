import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import {event as currentEvent} from 'd3-selection';
import * as d3Queue from 'd3-queue'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3Queue);

const dataURL = '<%= path %>/assets/EDITED Chief Executives MASTER final scores - ALL_VISUALS_EDITED_UNIQUE.csv';
const dropDownMenu = d3.select('.dropdown .dropdown-content')
const firstYear = 1998;
const lastYear = 2018;
const countries = ['Argentina','Armenia','Austria','Belarus','Bolivia','Brazil','Bulgaria','Canada','Chile','Colombia','Costa Rica','Croatia','Czech Republic','Dominican Republic','Ecuador','El Salvador','France','Germany','Guatemala','Honduras','Hungary','India','Italy','Latvia','Mexico','Moldova','Netherlands','Nicaragua','Norway','Panama','Paraguay','Peru','Poland','Romania','Russia','Slovakia','Spain','Sweden','Tajikistan','Turkey','UK','Ukraine','United States','Uruguay','Venezuela'];
const categories = ['NA', 'Not populist', 'Somewhat populist', 'Populist', 'Very Populist']

const mapEl = $(".interactive-wrapper");

let width = mapEl.getBoundingClientRect().width;
let height = 300;

let center = {x: 0, y:0}

let currentYear = firstYear;

let populistCenters = {
null:{x:center.x, y: -200},
'NA':{x:-(width / 2) + 30, y:center.y},
'Not populist':{x:-(width / 4), y:center.y},
'Somewhat populist':{x:0, y:center.y},
'Populist':{x:width / 4, y:center.y},
'Very Populist':{x:((width / 4) * 2) -30, y:center.y}
}

let forceStrength = 0.02;

let svg = null;
let bubbles = null;
let nodes = [];

let simulation = d3.forceSimulation()
.velocityDecay(0.2)
.force('x', d3.forceX().strength(forceStrength).x(center.x))
.force('y', d3.forceY().strength(forceStrength).y(center.y))
.force('charge', d3.forceManyBody().strength(charge))
.force("collide", d3.forceCollide().radius(d => d.radius))
.on('tick', ticked);

simulation.stop();

svg = d3.select(".interactive-svg")
.append('svg')
.attr("width", width)
.attr("height", height)

categories.map(c =>{
	svg.append('text')
	.text(c)
	.attr('transform', 'translate(' + (populistCenters[c].x - 10 + width / 2) + ',200)')
	
})

Promise.all([
	d3.csv(dataURL)
	])
.then(ready)

function ready(csv){

	d3.select("h3").html(currentYear)

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
	        radius:5.5
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

	simulation.nodes(nodes)

	bubbles = svg.selectAll('circle')
	.data(nodes)
	.enter()
	.append('circle')
	.attr('class', d => d.country + ' ' + d['populist' + currentYear] )
	.attr('r', d => d.radius)


	simulation.force('x', d3.forceX().strength(forceStrength).x(nodePopulismPosX))
	simulation.force('y', d3.forceY().strength(forceStrength).y(nodePopulismPosY))

	simulation.alpha(1).restart();

	setInterval(d => {
		currentYear++
		if(currentYear > lastYear) currentYear = firstYear;
		d3.select("h3").html(currentYear)
		simulation.force('x', d3.forceX().strength(forceStrength).x(nodePopulismPosX))
		simulation.force('y', d3.forceY().strength(forceStrength).y(nodePopulismPosY))
		simulation.alpha(1).restart();
	}, 2000);

}

function nodePopulismPosX(d) {

d3.select('.' + d.country).attr('class', d.country + ' ' + d['populist' + currentYear])
  return populistCenters[d['populist' + currentYear]].x;
}

function nodePopulismPosY(d) {

d3.select('.' + d.country).attr('class', d.country + ' ' + d['populist' + currentYear])
  return populistCenters[d['populist' + currentYear]].y;
}

function ticked() {
  bubbles
  .attr('cx', function (d) { return d.x + width / 2; })
  .attr('cy', function (d) { return d.y + 100 });
}

function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
 }