import { faFileText } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Main Transcript Component
const Transcript = ({ live, json }) => {
    return (
        <div style={styles.mainDiv}>
            <p style={styles.componentHeader}>
                Call Transcript {live && <span style={styles.liveSpan}>IN PROGRESS</span>}
            </p>
            <div style={styles.divider}></div>
            {json && json.length > 0 ? generateBubbles({ json }) : <p style={styles.noTranscript}>No transcript available, transcript with automatically sync when audio is playing.</p>}
        </div>
    )
}

// Function to generate bubbles
function generateBubbles({ json }) {
    // sort json by start time
    const sortedTranscript = json.sort((a, b) => a.audio_start - b.audio_start)

    return sortedTranscript.map((utt, index) => (
        <div key={index} style={getBubbleStyle(utt.speaker)}>
            <div style={styles.innerDiv}>
                <p style={styles.speakerTime}>{utt.speaker == 'A' ? 'Agent' : 'CUSTOMER'}: {millisToMinutesAndSeconds(utt.audio_start)} – {millisToMinutesAndSeconds(utt.audio_end)}</p>
                <p style={styles.uttText}>{utt.text}</p>
            </div>
        </div>
    ));
}

// Function to convert milliseconds to minutes and seconds
function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

// Styles
const styles = {
    mainDiv: {
        backgroundColor: 'white',
        borderRadius: '8px',
        borderStyle: 'none',
        boxShadow: '0px 8px 4px #0000001a',
        paddingTop: 10,
        paddingBottom: 10,
        margin: 10,
        maxHeight: '750px',
        overflowY: 'auto',
    }, 
    componentHeader: {
        color: '#3d3d3d',
        alignItems: 'center',
        fontSize: 16,
        fontWeight: 600,
        paddingRight: 20,
        paddingLeft: 25,
    },
    liveSpan: {
        color: 'white', 
        fontSize: 12, 
        marginLeft: 2, 
        padding: 5, 
        backgroundColor: 'red', 
        opacity: 0.8, 
        borderRadius: 4
    },
    divider: {
        width: '100%', 
        height: 2, 
        backgroundColor: '#00000010', 
        marginTop: 0, 
        marginBottom: 10, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    noTranscript: {
        color: '#00000040', 
        padding: 20
    },
    innerDiv: {
        width: '100%', 
        paddingRight: 20
    },
    speakerTime: {
        fontWeight: '500', 
        fontSize: 14, 
        marginBottom: '-5px'
    },
    uttText: {
        lineHeight: '1.6', 
        fontSize: 16
    }
}

// Function to get bubble style based on speaker
function getBubbleStyle(speaker) {
    return {
        backgroundColor: speaker == 'B' ? 'white' : '#f1f1f1', 
        border: '1px solid #00000020', 
        paddingLeft: 15, 
        marginLeft: 20, 
        paddingTop: 5, 
        paddingBottom: 5, 
        paddingRight: 15, 
        marginBottom: 15, 
        marginRight: 20, 
        fontSize: 14, 
        fontWeight: '500', 
        borderRadius: 10, 
        color: 'black', 
        justifyContent: speaker == 'A' ? 'right' : 'left', 
        display: 'flex', 
        float: speaker == 'B' ? 'right' : 'left', 
        width: '80%'
    }
}

export default Transcript