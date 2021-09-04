import { useState, useLayoutEffect, useRef, useEffect } from "react";
import * as d3 from 'd3';
import SpriteText from "three-spritetext";

import { ForceGraph2D } from 'react-force-graph';

export const MindMap = ({json, autoPosition}) => {
    const ref = useRef()
    const graph = useRef()
    const [height, setHeight] = useState(1920)
    const [width, setWidth] = useState(1080)

    useLayoutEffect(() => {
        setHeight(ref.current.clientHeight)
        setWidth(ref.current.clientWidth)
        console.log(height, width)
    })

    return(
        <div id="graph" ref={ref}>
            <ForceGraph2D
                    graphData={json}
                    nodeAutoColorBy="group"
                    height={height}
                    width={width}
                    linkDirectionalArrowLength={1}
                    linkDirectionalArrowRelPos={1}
                    dagMode="radialout"
                    ref={graph}
                    cooldownTicks={autoPosition ? Infinity : 0}
                    nodeCanvasObject={(node, ctx, globalScale) => {
                        const label = node.id; // Change this to node.name
                        const fontSize = 12/globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        const textWidth = ctx.measureText(label).width;
                        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = node.color;
                        ctx.fillText(label, node.x, node.y);

                        node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
                    }}
                    linkLabel={link => {
                        return link.explanation
                    }}
                    nodePointerAreaPaint={(node, color, ctx) => {
                        ctx.fillStyle = color;
                        const bckgDimensions = node.__bckgDimensions;
                        bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
                    }}

                    dagNodeFilter={node => false}
            />
        </div>
    
    )
}