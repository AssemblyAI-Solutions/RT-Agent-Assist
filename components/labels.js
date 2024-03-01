// import json from '../pages/api/test.json'
import { faFrown, faSmile, faMeh } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Labels = (props) => {
    return (
        <div style={styles.labelDiv}>
            <div>
                <p style={styles.labelHeader}>Negative</p>
                <p style={styles.countText}>
                <FontAwesomeIcon icon={faFrown} color={'#D05554'} style={{marginRight:8}}/>
                {getSentimentSegments(props, 'negative')}</p>
            </div>
            <div>
                <p style={styles.labelHeader}>Neutral</p>
                <p style={styles.countText}>
                    <FontAwesomeIcon icon={faMeh} color={'#FFB552'} style={{marginRight:8}}/>
                {getSentimentSegments(props, 'neutral')}</p>
            </div>
            <div>
                <p style={styles.labelHeader}>Positive</p>
                <p style={styles.countText}>
                    <FontAwesomeIcon icon={faSmile} color={'#62A163'} style={{marginRight:8}}/>
                {getSentimentSegments(props, 'positive')}</p>
            </div>
        </div>
    )
}

function getSentimentSegments(props, sentiment) {
    if (props.json.length == 0) {
        return 0
    }
    var total = props.json.length
    var min = 61
    var max = 100
    if (sentiment == 'neutral') {
        min = 41
        max = 60
    }
    else if (sentiment == 'negative') {
        min = 0
        max = 40
    }
    return props.json.filter(sa => sa.customer >= min && sa.customer <= max).length
}

const styles = {
    labelDiv: {width: '100%', paddingLeft: 40, paddingRight: 40, flexDirection: 'row', display: 'flex', paddingTop: 8, userSelect: 'none', justifyContent: 'space-between'},
    labelHeader: {color: 'gray', fontWeight: '500'},
    countText: {color: 'black', fontWeight: '500', fontSize: 16, marginTop: '-5px'}
}

export default Labels