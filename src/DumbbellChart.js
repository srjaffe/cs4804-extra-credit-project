import * as d3 from 'd3'

const DumbbellChart = ({aggregated, width, height, margin, xscale, yscale, colorscale, selectedTopic, setSelectedTopic}) => {

    return (
        <svg
            height={height + margin.top + margin.bottom}
            width={width + margin.left + margin.right}
        >
          <text
            transform={`translate(${margin.left + width / 2},${margin.top + height + 45})`}
            textAnchor="middle"
          >
            Average Bias Rating
          </text>
        <g transform={(`translate(${margin.left},${margin.top})`)}>
        {/* X-axis */}
      <g
        transform={`translate(0,${height})`}
        ref={(node) =>
          d3
            .select(node)
            .call(
              d3
                .axisBottom(xscale)
                .ticks(5)
            )
        }
      />
      {/* Generate a row for each headline */}
        {aggregated.map((item) => (
        <g
          key={item.id}
          opacity={selectedTopic && selectedTopic !== item.topic ? 0.1 : 1}
          onClick={() => setSelectedTopic(item.topic)}
          style={{cursor: "pointer"}}
        >
           <text
            x={-10}
            y={yscale(item.id) + 4}
            textAnchor="end"
            fontSize={12}
            fill={colorscale(item.topic)}
          >
            {item.headline.length > 70 ? item.headline.substring(0, 70) + "..." : item.headline}
            </text>
            <line
              x1={xscale(item.human_bias_mean)}
              x2={xscale(item.ai_bias_mean)}
              y1={yscale(item.id)}
              y2={yscale(item.id)}
              stroke="lightgrey"
              strokeWidth={3}
            />
            <circle
              cx={xscale(item.human_bias_mean)}
              cy={yscale(item.id)}
              r={5}
              fill="#2C6CB0"
            />
            <circle
              cx={xscale(item.ai_bias_mean)}
              cy={yscale(item.id)}
              r={5}
              fill="#D62728"
            />
          </g>
        ))}
    </g>
</svg>
    )
}

const HeadlinesDumbbellChart = ({ data, selectedTopic, setSelectedTopic }) => {
    var margin = {top:20, left:500, bottom:60, right:20};
    var width = 1000 - margin.left - margin.right;
    var height = 750 - margin.top - margin.bottom;

    var aggregated = data.slice().sort((a, b) => Math.abs(b.human_bias_mean - b.ai_bias_mean) - Math.abs(a.human_bias_mean - a.ai_bias_mean));

        const xscale = d3
            .scaleLinear()
            .domain([1, 5])
            .range([0, width]);

        const yscale = d3
            .scalePoint()
            .domain(aggregated.map((d) => d.id))
            .range([0, height])
            .padding(0.5);

        const colorscale = d3
            .scaleOrdinal()
            .domain(["politics", "world", "business", "science_health", "sports_ent"])
            .range(["darkred", "orange", "green", "navy", "purple"]);
    
    return (
        <div>
            <h4>
                <span style={{color: "#2C6CB0"}}>Survey</span> vs. <span style={{color:"#D62728"}}>AI</span> Average Bias Ratings for Each Headline
            </h4>
            <DumbbellChart aggregated={aggregated} width={width} height={height} margin={margin} xscale={xscale} yscale={yscale} colorscale={colorscale} selectedTopic={selectedTopic} setSelectedTopic={setSelectedTopic}/>
        </div>
    );
}

export default HeadlinesDumbbellChart