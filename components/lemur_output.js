import { useState } from 'react'

const LemurOutput = ({ title, notes, promptEditClick, checkboxes=false }) => {
    const [checkedP, setCheckedP] = useState([]);

    return (
        <div style={styles.mainDiv}>
            <p style={styles.componentHeader}>
                {title || 'AI Notes'}
                <span onClick={() => promptEditClick(title)} style={styles.editButton}>Edit Prompt</span>
            </p>
            <div style={styles.divider}></div>
            {!checkboxes && <div style={getNoteStyle(notes)}>
                {notes && notes.length > 0 ? formatNotes(notes) : 'No new items. Listening...'}
            </div>}
            {checkboxes && <div style={getCheckboxStyle(notes)}>
                {notes && notes.length > 0 ? formatCheckboxes(notes) : 'No new items. Listening...'}
            </div>}
        </div>
    )

    // Function to format notes
    function formatNotes(notes) {
        var divs = []
        for (let i = 0; i < notes.length; i++) {
            let formattedNotes = notes[i].replace('-', '').trim() + '\n';
            divs.push(<li>{formattedNotes}</li>)
        }
        return divs;
    }

    // Function to format notes
    function formatCheckboxes(notes) {
        var divs = []
        for (let i = 0; i < notes.length; i++) {
            let formattedNotes = notes[i].replace('-', '').trim() + '\n';
            divs.push(
            <div style={{flexDirection: 'row', display: 'flex'}}>
                <input 
                    type='checkbox' 
                    style={{width: 15}} 
                    onChange={() => {
                        if (!checkedP.includes(formattedNotes)) {
                            setCheckedP(previous => [...previous, formattedNotes]);
                        } else {
                            setCheckedP(previous => previous.filter(item => item !== formattedNotes));
                        }
                    }}
                />
                <p 
                    style={{
                        marginLeft: 5, 
                        color: checkedP.includes(formattedNotes) ? 'grey':'black', 
                        fontStyle: checkedP.includes(formattedNotes) ? 'italic': ''
                    }}
                >
                    {formattedNotes}
                </p>
            </div>
            )
        }
        return divs;
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

    // Function to get note style based on notes
    function getCheckboxStyle(notes) {
        return {
            padding: 20, 
            paddingBottom: 0, 
            paddingTop: 0, 
            color: notes && notes.length > 0 ? 'black':'#00000040', 
            whiteSpace: 'pre-wrap', 
        }
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
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
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
    editButton: {
        color: '#00000040', 
        cursor: 'pointer', 
        fontSize: 10,
        fontWeight: 500,
    }
}

export default LemurOutput