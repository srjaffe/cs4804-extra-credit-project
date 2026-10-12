import './App.css';
import ScatterPlot from './ScatterPlot';
import { useEffect, useState } from 'react';
import * as d3 from "d3"
import DumbbellChart from './DumbbellChart';
import BarChart from './BarChart.js';
import Legend from './Legend';
async function getSummaryData() {
    var data = await d3.csv("headline_summary.csv");
    var cleaned = data.map(function(d){
      return{
        id: d.id,
        headline: d.headline,
        topic: d.category,
        human_bias_mean: +d.human_bias_mean,
        ai_bias_mean: +d.ai_bias_mean,
        gap: +d.gap,
      }
    });
    return cleaned;
}
var titles = [{topic:"politics"}, {topic:"world"}, {topic: "business"}, {topic: "science_health"}, {topic: "sports_ent"}]
function App() {
    const [summaryDataset, setSummaryDataset] = useState([])
    const [legendData, setLegendData] = useState([])
    const [selectedTopic, setSelectedTopic] = useState(null)
    useEffect(() => {
        async function loadData() {
            const summaryData = await getSummaryData()
            setSummaryDataset(summaryData)
            setLegendData(titles)
        }
        loadData()
    }, [])
    if (summaryDataset.length === 0) return <div>Loading...</div>
    return (
        <div className="App">
            <h1>
                <span style={{color: "#2C6CB0"}}>How People Rate Headlines</span>{" "}vs.{" "}
                <span style={{color:"#D62728"}}>How AI Rates Headlines</span>
            </h1>
            <h3 className="sub-title">Comparing human and AI ratings of bias in news headlines</h3>
            <p className="intro-text">
                These visualizations compare how survey participants and an AI model (Gemini 3.8 Flash) rated the same 30 news headlines. Both were asked the same prompt of how much the wording of each headline pushes the reader toward an opinion or emotional reaction, on a scale of 1 (not at all) to 5 (extremely). The headlines cover five top topics in news and range from neutral to strongly loaded. Users can click on a topic in the legend or in any chart to filter the visualizations. The Reset Selection button clears the filter and returns the charts to their original view.
            </p>
            <img
                src="/newspaper_computer.png"
                alt="Newspaper next to a computer"
                className="website-image"
            />
            <p className="image-citation">
                Image source: AI-generated image of newspapers next to a computer.
            </p>
            <p className="author-names">
                BY SHEVLIN JAFFE
            </p>
            <p className="publish-date">Updated on October 12, 2026
            </p>
            <div className="legend-container">
                <Legend aggregated={legendData} selectedTopic={selectedTopic} setSelectedTopic={setSelectedTopic}/>
            </div>
            <button className="reset-button" onClick={() => setSelectedTopic(null)}>Reset Selection</button>
            <h2>Scatter Plot</h2>
            <div className="charts-alignment">
                <ScatterPlot data={summaryDataset} selectedTopic={selectedTopic} setSelectedTopic={setSelectedTopic}/>
            </div>
            <p className="scatter-plot-text">
                Each dot is one headline. Dots on the dashed line are headlines where people and the AI gave the same average rating. Dots above the line are headlines the AI rated as more biased than people did, and dots below the line are headlines people rated as more biased. Hover over a dot to see the headline and its survey and AI ratings.
            </p>
            <h2>Dumbbell Chart</h2>
            <div className='charts-alignment'>
                <DumbbellChart data={summaryDataset} selectedTopic={selectedTopic} setSelectedTopic={setSelectedTopic}/>
            </div>
            <p className="dumbbell-chart-text">
                This chart shows every headline from the survey, sorted from the biggest difference between people and the AI at the top to the smallest at the bottom.
            </p>
            <h2>Bar Chart</h2>
            <div className="charts-alignment">
                <BarChart data={summaryDataset} selectedTopic={selectedTopic} setSelectedTopic={setSelectedTopic}/>
            </div>
            <p className="bar-chart-text">
                This bar chart shows the average bias rating for each topic, with survey participants and the AI side by side.
            </p>
<div className="key-findings">
                <h3>Key Findings</h3>
                <ul>
                    <li>Overall, people and the AI rated the headlines pretty similarly, with their averages within half a point of each other on 14 of the 30 headlines.</li>
                    <li>People's ratings stayed closer to the middle of the scale than the AI's. People rated neutral headlines as more biased than the AI did (1.8 vs. 1.2 average), and strongly loaded headlines as less biased (3.8 vs. 4.3).</li>
                    <li>The biggest difference was on "Trump says 'threat' led US to pull bombers from RAF Fairford," which people rated a 2.9 and the AI rated a 1.0.</li>
                    <li>On average, people rated headlines as more biased than the AI in every topic except Sports & Entertainment.</li>
                </ul>
            </div>
            <p className="disclaimer-text">
                *Disclaimer: The headlines used in this project were collected from news outlets across the political spectrum, with the intention of providing a balanced selection of political leaning, and do not represent the views of this project. Results are based on 17 survey responses, and participants were not a random sample. Most participants described themselves as liberal (12 of the 17), which may have affected how they rated the political headlines. The AI ratings come from one model (Gemini 3.8 Flash), which rated each headline three times. The visualizations are intended to show patterns and should not be interpreted as definitive measures of bias in the news.
            </p>
        </div>
    );
}

export default App;
