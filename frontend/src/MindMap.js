import { useState, useLayoutEffect, useRef, useEffect } from "react";
import * as d3 from 'd3';
import SpriteText from "three-spritetext";

import { useStore } from './useStore'

import { ForceGraph2D, ForceGraph3D } from 'react-force-graph';
import * as THREE from "three";
import { CSS2DObject, CSS2DRenderer } from 'three-css2drenderer';

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

    const [ setSentences, currentSentences] = useStore((state) => [
        state.setSentences,
        state.currentSentences
    ])

    return(
        <div id="graph" ref={ref}>
            <ForceGraph3D
                backgroundColor="black"
                graphData={json}
                nodeThreeObject={node => {
                    const sprite = new SpriteText(node.id)
                    sprite.color = "white";
                    sprite.textHeight = 2;
                    return sprite;
                    // const nodeEl = document.createElement('div');
                    // nodeEl.textcontent = node.id;
                    // nodeEl.style.color = "white";
                    
                    // return new CSS2DObject(nodeEl);
                }}
                nodeLabel={node => {
                    console.log(node);
                    if (node.sentences.length > 1)
                    {
                        return node.sentences[0] + " and " + (node.sentences.length-1) + " more."
                    } else {
                        return node.sentences[0]
                    }
                }}

                onNodeClick={(node, event) => {
                    setSentences(node.sentences_index)
                }}

                width={width}
                height={height}

                linkDirectionalArrowLength={1}
                linkDirectionalArrowRelPos={1}

                linkThreeObjectExtend={true}
                linkThreeObject={link => {
                    // extend link with text sprite
                    const sprite = new SpriteText(`${link.explanation}`);
                    sprite.color = 'lightblue';
                    sprite.textHeight = 1;
                    return sprite;
                }}
                linkPositionUpdate={(sprite, { start, end }) => {
                    const middlePos = Object.assign(...['x', 'y', 'z'].map(c => ({
                    [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
                    })));

                    // Position sprite
                    Object.assign(sprite.position, middlePos);
                }}
                linkColor="white"
                linkWidth={0.4}
                linkOpacity={0.2}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.0025}
                >
            </ForceGraph3D>
            {/* <ForceGraph2D
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
            /> */}
        </div>
    
    )
}