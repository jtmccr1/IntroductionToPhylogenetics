import {Tree} from "./figtree.esm.js"
export function satBump(color,bump){
    const c = d3.hsl(color)
    c.s+=bump
    return c.formatHex()
}
export const regionalScale = d3.scaleOrdinal(
    d3.schemePaired.filter((d,i)=>i%2).map(d=>satBump(d,-0.2))
)
    .domain(["WPRO","EURO","PAHO","AFRO","EMRO","SEARO"])

export const legendScale=regionalScale.copy()
    .domain(["West Pacific","Europe","Americas","Africa","Eastern Med","SE Asia"])



export function collapsePoorNodes(node){

    if(node.children) {
        let lookAgain = false;
        do {
            lookAgain = false;
            const childrenToKeep = []; //maybe a little too dark
            for (const child of node.children) {
                if (child.annotations.posterior < 0.5) {
                    lookAgain = true
                    for (const kid of child.children) {
                        kid.length += child.length;
                        childrenToKeep.push(kid)
                    }
                } else {
                    childrenToKeep.push(child)
                }
            }
            node.children=childrenToKeep;
        }while (lookAgain) ;
        for(const child of node.children){
            collapsePoorNodes(child)

        }
    }
}

//https://stackoverflow.com/questions/29400171/how-do-i-convert-a-decimal-year-value-into-a-date-in-javascript
/**
 * Helper function to determine if the provided year is a leap year
 * @param year
 * @return {boolean}
 */
export function leapYear(year) {
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
}

/**
 * A function which converts a decimal float into a date object
 * @param decimalDate
 * @return {Date}
 */
export function decimalToDate(decimal){
    const year = Math.trunc(decimal);
    const totalNumberOfDays = leapYear(year)? 366:365;
    const day = Math.round(((decimal-year)*totalNumberOfDays));
    return d3.timeParse("%Y-%j")(`${year}-${day}`)

}

/**
 * A function that converts a date into a decimal.
 * @param date
 * @return {number}
 */
export function dateToDecimal(date){
    const year = parseInt(d3.timeFormat("%Y")(date));
    const day = parseInt(d3.timeFormat("%j")(date));
    const totalNumberOfDays = leapYear(year)? 366:365;
    return year+day/totalNumberOfDays
}
     /**
 * A custom date format that converts a decimal year float into "%Y-%m-%d" format
 * @param d
 * @return {string}
 */
export const customDateFormat =(f)=> (d) => {
    const dateFormat = d3.timeFormat(f);
    return `${dateFormat(decimalToDate(d))}`;
};


export const timeTreeString =  '((((virusA_1975[&region="PAHO"]:20.0,virusB_1965[&region="PAHO"]:10.0)[&region="PAHO"]:10.0,virusC_1985[&region="PAHO"]:44.0)[&region="PAHO"]:15.0,(virusD_1970[&region="EURO"]:35.0,virusE_1955[&region="EURO"]:20.0)[&region="EURO"]:5.0)[&region="EURO"]:25.0,(virusF_2000[&region="WPRO"]:55.0,virusG_1960[&region="WPRO"]:15.0)[&region="WPRO"]:40.0)[&region="WPRO"];';
export const baseTimeTree = Tree.parseNewick(timeTreeString, {datePrefix: "_"});

export function makeDefs(svg,colorScale){
    console.log("adding defs");
    const data = colorScale.domain();
    const defs = svg.append("defs");
    const stops = [0,0.2,1];
    const nodeGrads = defs.selectAll(".nodeGradient");
    const branchGrads = defs.selectAll(".branchGradient");

    nodeGrads
        .data(data)
        .join(
            enter=>enter
                .append("linearGradient")
                .attr("class",d=>"nodeGradient")
                .attr("id",d=>`node-${d}`)
                .each((d,i,n)=>{
                    const element = d3.select(n[i])
                    const color = colorScale(d)
                    element.selectAll("stop")
                        .data(stops)
                        .join("stop")
                        .attr("offset",d=>d)
                        .style("stop-opacity",d=>d>0?"0%":"100%")
                        .style("stop-color",color)
                })
        );
    branchGrads
        .data(data)
        .join(
            enter=>enter
                .append("linearGradient")
                .attr("class",d=>"branchGradient")
                .attr("id",d=>`branch-${d}`)
                .each((d,i,n)=>{
                    const element = d3.select(n[i])
                    const color = colorScale(d)
                    element.selectAll("stop")
                        .data(stops)
                        .join("stop")
                        .attr("offset",d=>d)
                        .style("stop-opacity",d=>d<=0.5?"0%":"100%")
                        .style("stop-color",color)
                })
        )





}