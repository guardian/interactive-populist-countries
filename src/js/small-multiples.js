import * as d3B from 'd3'
import * as d3Select from 'd3-selection'
import {event as currentEvent} from 'd3-selection';
import * as d3Queue from 'd3-queue'
import * as d3Interpolate from 'd3-interpolate'
import { $ } from "./util"

let d3 = Object.assign({}, d3B, d3Select, d3Queue, d3Interpolate);


const mapEl = $(".interactive-wrapper");
const dataURL = '<%= path %>/assets/Copy of EDITED Chief Executives MASTER final scores - UNIQUE_40.csv';

let container = d3.select('.small-multiples')

const firstYear = 1998;
const lastYear = 2018;

let countries = [];

let y = d3.scaleTime()
.domain([firstYear, lastYear])
.range([5,270])

let x = d3.scaleLinear()
    .domain([-1, 1])
    .range([0,300])

let line = d3.line()
    .defined(d => d.value != null)
    .x(d => x(d.value))
    .y(d => y(d.date))

Promise.all([
	d3.csv(dataURL)
	])
.then(ready)

function ready(csv){

	let data = csv[0]

	let countryName = null;

	d3.map(data, d => {
		if(countryName != d.country){
			countryName = d.country
			countries.push({country: countryName, region: d.region.split('&').join('and')})
		}
	});


	countries.forEach(c => {

		let speechCategory = null;

		let node =  [
	        {date:1998,value:speechCategory, country:c.country},
	        {date:1999,value:speechCategory, country:c.country},
	        {date:2000,value:speechCategory, country:c.country},
	        {date:2001,value:speechCategory, country:c.country},
	        {date:2002,value:speechCategory, country:c.country},
	        {date:2003,value:speechCategory, country:c.country},
	        {date:2004,value:speechCategory, country:c.country},
	        {date:2005,value:speechCategory, country:c.country},
	        {date:2006,value:speechCategory, country:c.country},
	        {date:2007,value:speechCategory, country:c.country},
	        {date:2008,value:speechCategory, country:c.country},
	        {date:2009,value:speechCategory, country:c.country},
	        {date:2010,value:speechCategory, country:c.country},
	        {date:2011,value:speechCategory, country:c.country},
	        {date:2012,value:speechCategory, country:c.country},
	        {date:2013,value:speechCategory, country:c.country},
	        {date:2014,value:speechCategory, country:c.country},
	        {date:2015,value:speechCategory, country:c.country},
	        {date:2016,value:speechCategory, country:c.country},
	        {date:2017,value:speechCategory, country:c.country},
	        {date:2018,value:speechCategory, country:c.country}
      ];
      	let country = data.filter(d => d.country == c.country)
		let years = country.map(c => +c.yearbegin)
		let populism = country.map(c => c.totalaverage)
		let localPopulism = speechCategory;

		for (var i = firstYear; i <= lastYear; i++) {

			if(years.indexOf(i) != -1){
				localPopulism = populism[years.indexOf(i)];
			}

			let variation = localPopulism -1;

			if(localPopulism == null) variation = null;

			node.find(n => n.date == i).value = variation;
		}

		

		let chartContainer = container.append('div')
		.attr('class', 'chart')
		.style('width', '300px')
		.style('height', '300px')
		.html(c.country)

		let chart = chartContainer.append('svg')
		.attr('width', 300)
		.attr('height', 300)
		.attr("class", "chart")

		chart.append("path")
	      .datum(node)
	      .attr("fill", "none")
	      .attr("stroke", "black")
	      .attr("stroke-width", 9.5)
	      .attr("stroke-linejoin", "round")
	      .attr("stroke-linecap", "round")
	      .attr("d", line)
	      
	})

}