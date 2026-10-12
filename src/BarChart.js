import * as d3 from 'd3'

var names = {politics: "Politics", world: "World", business: "Business", science_health: "Science & Health", sports_ent: "Sports & Entertainment"}

const BarChart = ({aggregated, width, height, margin, xscale, yscale, selectedTopic, setSelectedTopic}) => {

    return (
        <svg
            height={height + margin.top + margin.bottom}
            width={width + margin.left + margin.right}
        >
          <text
            transform={`translate(${margin.left + width / 2},${margin.top + height + 50})`}
            textAnchor="middle"
          >
            Topic
          </text>
          <text
            transform={`translate(${margin.left - 60},${margin.top + height / 2}) rotate(-90)`}
            textAnchor="middle"
          >
            Average Bias Rating
          </text>
        {/* Generate the Bars for chart */}
      <g transform={(`translate(${margin.left},${margin.top})`)}>
            {aggregated.map((item) => (
              <g
                  key={item.topic}
                  opacity={selectedTopic && selectedTopic !== item.topic ? 0.2 : 1}
                  onClick={() => setSelectedTopic(item.topic)}
                  style={{cursor: "pointer"}}
                >
                  <rect
                  x={xscale(item.topic)}
                  y={yscale(item.human_bias_mean)}
                  width={xscale.bandwidth()/2}
                  height={height - yscale(item.human_bias_mean)}
                  fill="#2C6CB0"
                />
                <rect
                  x={xscale(item.topic) + xscale.bandwidth()/2}
                  y={yscale(item.ai_bias_mean)}
                  width={xscale.bandwidth()/2}
                  height={height - yscale(item.ai_bias_mean)}
                  fill="#D62728"
                />
              </g>
            ))}
        {/* X-axis */}
      <g
        transform={`translate(0,${height})`}
        ref={(node) =>
          d3
            .select(node)
            .call(
              d3
                .axisBottom(xscale).tickFormat((d) => names[d])
            )
        }
      />
        {/* Y-axis */}
        <g
            ref={(node) =>
                d3.select(node).call(d3.axisLeft(yscale),
                d3.select(node).selectAll(".tick line").clone()
                .attr("x2", width)
                .attr("stroke-opacity", 0.1)
                )
            }
        />
      </g>
    </svg>
    )
}

const TopicBarChart = ({ data, selectedTopic, setSelectedTopic }) => {
    var margin = {top:20, left:80, bottom:70, right:20};
    var width = 700 - margin.left - margin.right;
    var height = 450 - margin.top - margin.bottom;

    var aggregated = Array.from(
            d3.rollup(
                data,
                (v)=>({human_bias_mean: d3.mean(v, (d)=>d.human_bias_mean), ai_bias_mean: d3.mean(v, (d)=>d.ai_bias_mean),
                }),
                (d)=>d.topic,
            ),
            ([topic,values])=>({topic, human_bias_mean: values.human_bias_mean, ai_bias_mean: values.ai_bias_mean})
        );

        const xscale = d3
            .scaleBand()
            .domain(aggregated.map((d) => d.topic))
            .range([0, width])
            .padding(0.2);

        const yscale = d3
            .scaleLinear()
            .domain([0, 5])
            .range([height, 0]);
    
    return (
        <div>
            <h4>
                <span style={{color: "#2C6CB0"}}>Survey</span> vs. <span style={{color:"#D62728"}}>AI</span> Average Bias Ratings by Topic
            </h4>
            <BarChart aggregated={aggregated} width={width} height={height} margin={margin} xscale={xscale} yscale={yscale} selectedTopic={selectedTopic} setSelectedTopic={setSelectedTopic}/>
        </div>
    );
}
export default TopicBarChart; 