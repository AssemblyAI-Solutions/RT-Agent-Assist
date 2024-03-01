import Labels from "./labels"
import SegmentedBar from "./segmentedBar"
// import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Breakdown = (props) => {
    return (
        <div style={styles.mainDiv}>
        <p style={styles.componentHeader}>
            {/* <span><FontAwesomeIcon icon={faMagnifyingGlass} style={{marginRight: 8}}></FontAwesomeIcon></span> */}
            Call Sentiment Breakdown
        </p>
        <div style={styles.divider}></div>
        <h1 style={styles.sentimentHeader}>
            {getSentimentHeader(props)}
        </h1>
        <SegmentedBar json={props.json}/>
        <Labels json={props.json}/>
        </div>
    )
}

function getSentimentHeader(props) {
    var total = props.json.length

    var positivePerc = props.json.filter(sa => sa.customer >= 50).length / total
    var negativePerc = props.json.filter(sa => sa.customer <= 50).length / total

    if (positivePerc > 0.5) {
        return 'Overwhelmingly Positive'
    }
    else if (positivePerc > 0.3) {
        return 'Mostly Positive'
    }
    else if (negativePerc > 0.5) {
        return 'Overwhelmingly Negative'
    }
    else if (negativePerc > 0.2) {
        return 'Mostly Negative'
    }
    else {
        return 'Mostly Neutral'
    }
}

const styles = {
    mainDiv: {
        backgroundColor: 'white',
        borderRadius: '8px',
        borderStyle: 'none',
        boxShadow: '0px 8px 4px #0000001a',
        maxHeight: 500,
        overflowY: 'scroll',
        paddingTop: 10,
        paddingBottom: 10,
        margin: 10,
    },
    componentHeader: {
        color: '#3d3d3d',
        fontSize: 16,
        fontWeight: 600,
        paddingRight: 20,
        paddingLeft: 25,
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    sentimentHeader: {
        color: '#3d3d3d',
        fontSize: 20,
        fontWeight: 600,
        paddingLeft: 25,
        paddingTop: 20,
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
}

export default Breakdown