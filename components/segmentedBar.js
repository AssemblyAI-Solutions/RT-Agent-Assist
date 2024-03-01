const SegmentedBar = (props) => {
    return (
        <div style={{width: '100%', height: '30px', flexDirection: 'row', display: 'flex', paddingTop: 8, paddingLeft: 25, paddingRight: 25}}>
            <div style={{backgroundColor: '#FF7C7C', width: getSentimentSegments(props, 'negative') + '%', marginRight: 5, borderTopLeftRadius: 10, borderBottomLeftRadius: 10}}>
            {}
            </div>
            <div style={{backgroundColor: '#FFAB7C', width: getSentimentSegments(props, 'neutral') + '%', marginRight: 5}}>
            </div>
            <div style={{backgroundColor: '#7CFF89', width: getSentimentSegments(props, 'positive') + '%', borderTopRightRadius: 10, borderBottomRightRadius: 10}}>
            </div>
        </div>
    )
}

function getSentimentSegments(props, sentiment) {
    if (props.json.length == 0) {
        return 1
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
    return props.json.filter(sa => sa.customer >= min && sa.customer <= max).length / total * 100
}

export default SegmentedBar