import { useState, useLayoutEffect, useRef, useEffect } from "react";
import { useStore } from './useStore'
export const Summary = ({sentences}) => {

    const [ setSentences, currentSentences] = useStore((state) => [
        state.setSentences,
        state.currentSentences
    ])

    return(
        <div>
            <h4 ><i style={{backgroundColor: "#444444", padding: "5px 15px 5px 15px", borderRadius: "5px"}}>Summary</i></h4>
            <div style={{marginTop: "25px", overflowY: "scroll", maxHeight: "68vh", padding: "15px"}}>
                {sentences.map((s, index) => {
                    if (index in currentSentences)
                    {
                        return( <p style={{backgroundColor: "white", color: "black", borderRadius: "5px", padding: "5px 10px 5px 10px"}}>{s}</p>)
                    } else {
                        return( <p>{s}</p>)
                    }
                })}
            </div>


        </div>
    
    )
}