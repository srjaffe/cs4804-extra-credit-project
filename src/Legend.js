import * as d3 from 'd3'
const Legend = ({aggregated, selectedTopic, setSelectedTopic}) => {
    var margin = { top: 20, left: 80, bottom: 70, right: 20 };
    
    var names = {politics: "Politics", world: "World", business: "Business", science_health: "Science & Health", sports_ent: "Sports & Entertainment"}

    var colorScale = d3.scaleOrdinal()
          .domain(["politics", "world", "business", "science_health", "sports_ent"])
          .range(["darkred", "orange", "green", "navy", "purple"]);
    return (
 
  <svg width={850} height={50}>
    <g transform={`translate(${margin.left},${margin.top})`}>
      {aggregated.map((item, i) => {
        const spacing = 170; // space between legend items
        const xPos = i * spacing;

        return (
          <g 
              key={item.topic} 
              transform={`translate(${xPos}, 1)`}
              onClick={() => setSelectedTopic(item.topic)}
              style={{cursor: "pointer"}}
              opacity={selectedTopic && selectedTopic !== item.topic ? 0.3 : 1}
          >
            <circle
              cx={-10}
              cy={0}
              r={7}
              fill={colorScale(item.topic)}
            />
            <text
              x={-10}
              y={20}        // text below circle
              textAnchor="middle"
              fill={colorScale(item.topic)}
            >
              {names[item.topic]}
            </text>
          </g>
        );
      })}
    </g>
  </svg>
);
  
}
export default Legend;