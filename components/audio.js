// import { faSignal } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

// import Image from 'next/image'
// import leylaPic from '../public/leyla.png'
// import malakaiPic from '../public/malakai.png'

const Audio = ({ title, url, setAudioTime }) => {
    return (
        <div style={styles.mainDiv}>
            <p style={styles.componentHeader}>
                {/* {<span><FontAwesomeIcon icon={faSignal} style={{marginRight: 8, color: start ? 'green':'grey'}}></FontAwesomeIcon></span>} */}
                {title ? title : 'Audio'}
            </p>
            <div style={styles.divider}></div>
            {/* <div style={{paddingLeft: 20, paddingTop: 20, flexDirection: 'row', display: 'flex', alignItems: 'center'}}>
                <Image src={name == 'John Doe' ? malakaiPic:leylaPic} width={70} style={{borderRadius: 50}}></Image>
                <div>
                    <p style={{color: 'black', fontSize: 16, marginLeft: 10, fontWeight: 500, marginBottom: -5}}>{name}</p>
                    {sentiment && <p style={{color: '#00000050', fontSize: 12, marginLeft: 10, fontWeight: 400}}>Live sentiment score: {sentiment}%</p>}
                </div>
            </div> */}
            <div style={styles.padding}>
                {/* <Player src={url} /> */}
                {!url ? <p style={styles.loading}>Loading audio...</p> : <AudioPlayer
                    className="audio-player"
                    src={URL.createObjectURL(url)}
                    showDownloadProgress={true}
                    autoPlay={false}
                    autoPlayAfterSrcChange={false}
                    onListen={e => {setAudioTime(e.target.currentTime)}}
                    showSkipControls={false}
                    showJumpControls={false}
                    customControlsSection={['MAIN_CONTROLS']}
                />}
                {/* <audio ref={audioRef} src={url} style={{width: '100%', marginTop: 10}}>Your browser does not support the audio element.</audio> */}
            </div>
        </div>
    )
}

const styles = {
    mainDiv: {
        backgroundColor: 'white',
        borderRadius: '8px',
        borderStyle: 'none',
        boxShadow: '0px 8px 4px #0000001a',
        paddingTop: 10,
        paddingBottom: 15,
        margin: 10
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
        marginBottom: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    padding: {
        padding: 10
    },
    loading: {
        color: '#00000020', 
        fontSize: 12, 
        paddingLeft: 20
    }
}

export default Audio