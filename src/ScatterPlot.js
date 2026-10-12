import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ScatterPlot = ({ data, selectedTopic, setSelectedTopic }) => {
    const chartRef = useRef();

    useEffect(() => {
        d3.select(chartRef.current).selectAll("svg").remove();

        const margin = {top: 20, right: 60, bottom: 60, left: 90},
            width = 500 - margin.left - margin.right,
            height = 450 - margin.top - margin.bottom;

        const svg = d3.select(chartRef.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

            const x = d3.scaleLinear().domain([1, 5]).range([0, width]);
            const y = d3.scaleLinear().domain([1, 5]).range([height, 0]);

            const color = d3.scaleOrdinal()
                .domain(["politics", "world", "business", "science_health", "sports_ent"])
                .range(["darkred", "orange", "green", "navy", "purple"]);

            // Light Grey Grid Lines
            svg.append("g")
                .attr("class", "grid")
                .call(d3.axisLeft(y).ticks(4).tickSize(-width).tickFormat(""));
            svg.append("g")
                .attr("class", "grid")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).tickSize(-height).tickFormat(""));

            // Axes
            svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(4));
            svg.append("g").call(d3.axisLeft(y).ticks(4));

            // Axis Labels
            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", width / 2)
                .attr("y", height + margin.bottom - 15)
                .style("font-size", "14px")
                .text("Survey Average Bias Rating");

            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 35)
                .attr("x", -height / 2)
                .style("font-size", "14px")
                .text("AI Average Bias Rating");

            svg.append("line")
                .attr("x1", x(1)).attr("y1", y(1))
                .attr("x2", x(5)).attr("y2", y(5))
                .attr("stroke", "gray")
                .attr("stroke-dasharray", "5 5");

            // Dots
            svg.selectAll(".dot")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "dot")
                .attr("cx", d => x(d.human_bias_mean))
                .attr("cy", d => y(d.ai_bias_mean))
                .attr("r", 7)
                .style("fill", d => color(d.topic))
                .style("opacity", d => selectedTopic && selectedTopic !== d.topic ? 0.1 : 0.8)
                .on("click", (event, d) => setSelectedTopic(d.topic))
                .append("title")
                .text(d => d.headline + "\nSurvey Rating: " + d.human_bias_mean.toFixed(1) + "\nAI Rating: " + d.ai_bias_mean.toFixed(1));

    }, [data, selectedTopic, setSelectedTopic]);

    return (
        <div>
            <h4><span style={{color: "#2C6CB0"}}>Survey</span> vs. <span style={{color:"#D62728"}}>AI</span> Average Bias Ratings by Headline</h4>
            <div ref={chartRef}>
                <style>
                    {`.grid line { stroke: #e0e0e0; stroke-opacity: 0.6; shape-rendering: crispEdges; }
                      .grid path { stroke-width: 0; }`}
            </style>
        </div>
    </div>
    );
};

export default ScatterPlot;
