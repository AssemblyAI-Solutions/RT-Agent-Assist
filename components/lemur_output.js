const LemurOutput = ({ title, notes }) => {
    return (
        <div style={styles.mainDiv}>
            <p style={styles.componentHeader}>
                {title || 'AI Notes'}
            </p>
            <div style={styles.divider}></div>
            <p style={getNoteStyle(notes)}>
                {notes && notes.length > 0 ? formatNotes(notes) : 'No new items. Listening...'}
            </p>
        </div>
    )
}

// Function to format notes
function formatNotes(notes) {
    let formattedNotes = '';
    for (let i = 0; i < notes.length; i++) {
        if (formattedNotes.includes(notes[i].trim())) {
            continue;
        }
        formattedNotes += '• ' + notes[i].replace('-', '').trim() + '\n';
    }
    return formattedNotes;
}

// Function to get note style based on notes
function getNoteStyle(notes) {
    return {
        padding: 20, 
        paddingBottom: 0, 
        paddingTop: 0, 
        color: notes && notes.length > 0 ? 'black':'#00000040', 
        whiteSpace: 'pre-wrap', 
        lineHeight: 2
    }
}

// Styles
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
    }
}

export default LemurOutput