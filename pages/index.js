import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import logo from '../public/AssemblyAI_White.png'
import Audio from '../components/audio'
import Transcript from '../components/transcript'
// import SentimentChart from '../components/sentiment'
import axios from 'axios'
import ClipLoader from "react-spinners/ClipLoader"
import Modal from 'react-modal';

Modal.setAppElement('#root'); // assuming 'root' is the id of your main app element

import { useEffect, useState, useRef, useMemo } from 'react'
import LemurOutput from '../components/lemur_output'
import SentimentChart from '../components/sentiment'
import Breakdown from '../components/breakdown'

export default function Home() {
  // when websocket is open and sending data
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  // temp token from AAI
  const [token, setToken] = useState('');

  // agent stream websocket connection
  const leftSocketRef = useRef(null);

  // customer stream websocket connection
  const rightSocketRef = useRef(null);

  // Transcription data from both streams
  const [fullTranscript, setFullTranscript] = useState([]);

  // Audio files: combined, left, right
  const [uploadedFile, setUploadedFile] = useState(null);
  const [leftChannelFile, setLeftChannelFile] = useState(null);
  const [rightChannelFile, setRightChannelFile] = useState(null);

  // Lemur outputs
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sentiment, setSentiment] = useState([]);

  // Current audio time from the player
  const [currentAudioTime, setCurrentAudioTime] = useState(3600);

  // Selected call from tabs
  const [selectedCall, setSelectedCall] = useState(0);

  // Static tab names
  const calls = ['Call 1', 'Call 2', 'Call 3', 'Upload'];

  // Loading state for audio files from URL
  const [loading, setLoading] = useState(false);

  // Enabled state for start button
  const [enabled, setEnabled] = useState(false);

  // Lemur API calls loading state
  const [lemurNotesLoad, setLemurNotesLoad] = useState(false);

  // Lemur API calls loading state
  const [lemurTasksLoad, setLemurTasksLoad] = useState(false);

  // Lemur API calls loading state
  const [lemurSentimentLoad, setLemurSentimentLoad] = useState(false);

  // Keeps track of how much context Lemur has summarized, allows us to only send new transcript to Lemur
  const [lemurSummarizedUntil, setLemurSummarizedUntil] = useState(0);

  // Modal state for editing prompts
  const [modalIsOpen, setIsOpen] = useState(false);

  // Custom prompts
  const [notesPrompt, setNotesPrompt] = useState(`You are a helpful customer service agent assistant. Your job is to take notes for the agent during the phone call.`);
  const [tasksPrompt, setTasksPrompt] = useState(`You are a helpful customer service agent assistant. Your job is to make suggestions to the agent during the phone call.
  
  Focus on the following rules for providing suggestions:
  - If customer says they live in an apartment or home, suggest that the agent ask if they own or rent.
  - If a customer says they are using an alternative service that isn't AT&T,suggest that the agent ask them what they don't like about their current service.
  - If a customer wants internet or cable service, suggest that the agent ask them if they'd be interested in bundling other services.`);

  // Modal text value
  const [notesTextArea, setNotesTextArea] = useState(notesPrompt);
  const [tasksTextArea, setTasksTextArea] = useState(tasksPrompt);

  const modalStyle = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '80%', // Set a width for the modal
      height: '60%', // Set a height for the modal
      display: 'flex', // Use flexbox for layout
      flexDirection: 'column', // Stack items vertically
      alignItems: 'center', // Center items horizontally
      justifyContent: 'space-around', // Distribute space evenly
      padding: '20px', // Add some padding
      border: ''
    },
  };

  useEffect(() => {
    // Fetch temp token from AAI
    fetchToken()

    // Load Call 1 audio files
    if (!loading) {
      Promise.all([
        handleFileUrl('https://api.assemblyai-solutions.com/storage/v1/object/public/pathlight/call' + (selectedCall + 1) + '.mp3-channel1.wav', 'left'),
        handleFileUrl('https://api.assemblyai-solutions.com/storage/v1/object/public/pathlight/call' + (selectedCall + 1) + '.mp3-channel0.wav', 'right'),
        handleFileUrl('https://api.assemblyai-solutions.com/storage/v1/object/public/pathlight/call' + (selectedCall + 1) + '.mp3', '')
      ]).then(() => {
        // Do something after all promises have resolved
        setEnabled(true)
        setLoading(false)
      }).catch((error) => {
        // Handle any errors
        setLoading(false)
      });
    }
  }, [])

  // Fetch temp token from AAI
  const fetchToken = async () => {
    try {
      const response = await axios.post('/api/token', {
        expires_in: 3600,
      });
      const { token } = response.data;
      setToken(token);
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

  // Lemur API calls, peroiodically when the transcript length is a multiple of 5
  useEffect(() => {
    if (fullTranscript.length === 0) {
      return;
    }

    var filteredTranscript = filterTranscript();
    filteredTranscript = lemurFilterTranscript(filteredTranscript)

    if (filteredTranscript.length % 5 === 0 && filteredTranscript.length > 0) {
      if (currentAudioTime !== 3600) {
        if (filteredTranscript.length === 0) {
          return;
        }
        setLemurSummarizedUntil(currentAudioTime);
        lemurNotes(filteredTranscript);
        lemurTasks(filteredTranscript);
        lemurSentiment(filteredTranscript);
      } else {
        lemurNotes(fullTranscript);
        lemurTasks(fullTranscript);
        lemurSentiment(fullTranscript);
      }
    }
  }, [fullTranscript]);
  
  // Lemur notes generation request
  function lemurNotes(t) {
    if (lemurNotesLoad) return;
    setLemurNotesLoad(true);

    const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript: t, previousNotes: notes, prompt: notesPrompt }) };
    fetch('/api/lemur_notes', options)
    .then(response => response.json())
    .then(response => {
      console.log(response)
      setLemurNotesLoad(false);
      if (response && response.notes && response.notes.length > 0) {
        // notes is an array of strings
        var newNotes = response.notes.filter((note) => {
          return !notes.includes(note)
        })
        setNotes(previousNotes => [...previousNotes, ...newNotes]);
      }
    })
    .catch(err => { 
      console.error(err); 
      setLemurNotesLoad(false);
    });
  }

  // Lemur suggestions generation request
  function lemurTasks(t) {
    if (lemurTasksLoad) return;
    setLemurTasksLoad(true);

    const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript: t, previousNotes: tasks, prompt: tasksPrompt }) };
    fetch('/api/lemur_tasks', options)
    .then(response => response.json())
    .then(response => {
      console.log(response)
      setLemurTasksLoad(false);
      if (response && response.suggestions && response.suggestions.length > 0) {
        // tasks is an array of strings
        var newTasks = response.suggestions.filter((task) => {
          return !tasks.includes(task)
        })
        setTasks(previousTasks => [...previousTasks, ...newTasks]);

      }
    })
    .catch(err => {
      console.error(err)
      setLemurTasksLoad(false);
    });
  }

  // Lemur sentiment generation request, currently not used
  function lemurSentiment(t) {
    if (lemurSentimentLoad) return;
    setLemurSentimentLoad(true);

    const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript: t }) };
    fetch('/api/lemur_sentiment', options)
    .then(response => response.json())
    .then(response => {
      console.log(response)
      setLemurSentimentLoad(false);
      if (response.response) {
        setSentiment(previousNotes => [...previousNotes, response.response]);
      }
    })
    .catch(err => console.error(err));
  }

  // Create a websocket connection to AAI and start sending audio data
  function createWebsocket(file, socketRef) {
    if (!token) {
      console.error('Token is not available yet.');
      alert('Waiting for transcription token to generate. Try again in a few seconds.')
      return;
    }
    if (!file) {
      return;
    }

    setIsTranscribing(true);

    socketRef.current = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=22050&token=${token}`);

    socketRef.current.onopen = () => {
      console.log('Connected to the WebSocket server');
      startTranscription(file, socketRef);
    };

    socketRef.current.onerror = (error) => {
      console.error('Error:', error);
    }

    socketRef.current.onmessage = (message) => {
      // console.log('Received:', message.data);
      var data = JSON.parse(message.data);
      if (data.message_type === 'FinalTranscript') {
        if (data.text) {
          if (socketRef == rightSocketRef) {
            data.speaker = 'B'
            setFullTranscript(prevCustomerTranscript => [...prevCustomerTranscript, data]);
          }
          else {
            data.speaker = 'A'
            setFullTranscript(prevfullTranscript => [...prevfullTranscript, data]);
          }
        }
      }
    };

    return () => {
      socketRef.current.close();
    };
  }

  // Stop the websocket connection
  function stopWebSocket(ws) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  }

  // Fetch the audio file from the URL and store it in the state
  function handleFileUrl(url, channel) {
    setLoading(true);
    setEnabled(false);

    // Check if the response is in the cache
    return caches.open('audio-cache').then((cache) => {
      return cache.match(url).then((response) => {
        if (response) {
          // If it's in the cache, return the cached response
          return response.blob();
        } else {
          // If it's not in the cache, fetch it from the network
          return fetch(url)
            .then((networkResponse) => {
              // Put the fetched response in the cache
              cache.put(url, networkResponse.clone());
              return networkResponse.blob();
            });
        }
      });
    })
    .then((blob) => {
      return new Promise((resolve, reject) => {
        if (channel === 'left') {
          if (blob != leftChannelFile) {
            console.log('setting left channel file');
            setLeftChannelFile(blob);
            resolve();
          }
        } else if (channel === 'right') {
          if (blob != rightChannelFile) {
            console.log('setting right channel file');
            setRightChannelFile(blob);
            resolve();
          }
        } else {
          if (blob != uploadedFile) {
            setUploadedFile(blob);
            resolve();
          }
        }
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    })
  }
  
  // Handle file upload from the user
  function handleFileUpload(event, channel) {
    const file = event.target.files[0];
    if (channel === 'left') {
      setLeftChannelFile(file);
      setEnabled(true);
      setLoading(false)
    }
    else {
      setRightChannelFile(file);
      setEnabled(true);
      setLoading(false)
    }
  }
  
  // Start sending audio data to the websocket
  function startTranscription(file, socketRef) {
    if (file) {
      // clear state
      setFullTranscript([]);
      setNotes([]);
      setTasks([]);
      setSentiment([]);
      setCurrentAudioTime(3600);
      
      const chunkSize = 4096; // Size of each chunk in bytes
      let offset = 0;

      const reader = new FileReader();
      reader.onload = function(e) {
        const buffer = e.target.result;
        const base64data = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        if (socketRef.current) {
          socketRef.current.send(JSON.stringify({ audio_data: base64data }));
        }

        if (offset < file.size) {
          offset += chunkSize;
          const nextChunk = file.slice(offset, offset + chunkSize);
          reader.readAsArrayBuffer(nextChunk);
        }
      }

      reader.onerror = function(e) {
        console.error('Error reading the file:', e);
        stopTranscription();
      }

      const firstChunk = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(firstChunk);
    }
  }

  // Stop the transcription
  const stopTranscription = () => {
    if (leftSocketRef.current) {
      stopWebSocket(leftSocketRef.current);
      leftSocketRef.current = null; // Reset the ref after closing
    }
    if (rightSocketRef.current) {
        stopWebSocket(rightSocketRef.current);
        rightSocketRef.current = null; // Reset the ref after closing
    }
    setIsTranscribing(false);
    stopWebSocket(leftSocketRef.current);
    stopWebSocket(rightSocketRef.current); 
  }

  // Filter the transcript based on the current audio time, this is to align the transcript / lemur outputs with the audio player
  function filterTranscript() {
    var transcript = fullTranscript.filter((item) => {
      return item.audio_end < currentAudioTime*1000
    })
    // console.log(transcript, currentAudioTime, fullTranscript)
    return transcript
  }

  // Filter the transcript based on the current audio time, this is to align the transcript / lemur outputs with the audio player
  function lemurFilterTranscript(t) {
    var transcript = t.filter((item) => {
      return lemurSummarizedUntil*1000 < item.audio_end
    })
    return transcript
  }

  // Left audio components
  const leftAudioComponent = useMemo(() => {
    // if (!leftChannelFile) return null;
    var score = 0
    if (sentiment && sentiment.length > 0) {
      var lastSentiment = sentiment[sentiment.length - 1]
      score = lastSentiment.agent
    }
    return (
      <div>
        <Audio 
          url={leftChannelFile} 
          start={isTranscribing}
          title={'Agent Stream'}
          name={'Jane Doe'}
          sentiment={score}
          setAudioTime={(t) => setCurrentAudioTime(t)}
          loading={loading}
        />
      </div>
    );
  }, [leftChannelFile]);

  // Main audio component
  const mainAudioComponent = useMemo(() => {
    // if (!uploadedFile) return null;
    var score = 0
    if (sentiment && sentiment.length > 0) {
      var lastSentiment = sentiment[sentiment.length - 1]
      score = lastSentiment.agent
    }
    return (
      <div>
        <Audio 
          url={uploadedFile} 
          start={isTranscribing}
          title={'Live Call Stream'}
          name={'Jane Doe'}
          sentiment={score}
          setAudioTime={(t) => setCurrentAudioTime(t)}
          loading={loading}
        />
      </div>
    );
  }, [uploadedFile]);

  // Right audio component
  const rightAudioComponent = useMemo(() => {
    // if (!rightChannelFile) return null;
    var score = 0
    if (sentiment && sentiment.length > 0) {
      var lastSentiment = sentiment[sentiment.length - 1]
      score = lastSentiment.customer
    }
    return (
      <div>
        <Audio 
          url={rightChannelFile} 
          start={isTranscribing}
          title={'Customer Stream'}
          name={'John Doe'}
          sentiment={score}
          setAudioTime={(t) => setCurrentAudioTime(t)}
          loading={loading}
        />
      </div>
    );
  }, [rightChannelFile]);

  // Select a call from the tabs
  function selectCall(id) {
    if (id == selectedCall) {
      return
    }
    // if (loading) {
    //   alert('Please wait for the audio files to load.');
    //   return
    // }

    setLeftChannelFile(null)
    setRightChannelFile(null)
    setUploadedFile(null)
    setSelectedCall(id)
    setFullTranscript([])
    setNotes([])
    setTasks([])
    setSentiment([])
    setEnabled(false)
    setCurrentAudioTime(3600)

    if (id >= 3) {
      return
    }
    if (loading) {
      return
    }
    Promise.all([
      handleFileUrl('https://api.assemblyai-solutions.com/storage/v1/object/public/pathlight/call' + (id + 1) + '.mp3-channel1.wav', 'left'),
      handleFileUrl('https://api.assemblyai-solutions.com/storage/v1/object/public/pathlight/call' + (id + 1) + '.mp3-channel0.wav', 'right'),
      handleFileUrl('https://api.assemblyai-solutions.com/storage/v1/object/public/pathlight/call' + (id + 1) + '.mp3', '')
    ])
    .then(() => {
      // Do something after all promises have resolved
     
    })
    .catch((error) => {
      // Handle any errors
      console.error(error);
    })
    .finally(() => {
      // This will be executed after all promises have either resolved or rejected
      setLoading(false);
      setEnabled(true);
    });
  }

  // Generate tabs component
  function generateTabs() {
    var buttons = []
    for(let x = 0; x < calls.length; x++) {
      buttons.push(<p onClick={() => selectCall(x)} style={{cursor: 'pointer', padding: 12, backgroundColor: selectedCall == x ? '#ffffff20':'#ffffff00', borderRadius: 10, marginLeft: 5, marginRight: 5, textAlign: 'center', fontSize: 15,padding: 15, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>{calls[x]}</p>)
    }
    return buttons
  }

  // Start/stop transcription button click
  function startClick() {
    if (!leftChannelFile || !rightChannelFile) {
      alert('Please wait for both audio files to load to start transcription.');
      return;
    }
    if (isTranscribing) {
      stopTranscription();
      return;
    }
    createWebsocket(leftChannelFile, leftSocketRef); 
    createWebsocket(rightChannelFile, rightSocketRef);
  }

  // Prompt edit button click
  function promptEditClick(title) {
    console.log('prompt edit clicked')
    console.log(title)
    setIsOpen(true)
  }

  // Start/stop transcription button component
  function startButton() {
    return <div>
    <p onClick={enabled ? startClick:() => {}} style={{fontSize: 14, padding: 15, marginLeft: 15, cursor: 'pointer', backgroundColor: '#ffffff20', display: 'inline-flex', borderRadius: 10, color: !leftChannelFile || !rightChannelFile || !enabled ? '#00000020':'white'}} onMouseOver={(e) => {e.target.style.backgroundColor = '#ffffff05'}} onMouseOut={(e) => {e.target.style.backgroundColor = '#ffffff20'}}>
      {isTranscribing ? 'Stop':'Start'} Live Transcription
    </p>
    </div>
  }

  return (
    <div className={styles.container} id='root'>
      <Head>
        <title>Real-Time Agent Assist Demo</title>
        <meta name="description" content="Generated for demo purposes by AssemblyAI Solutions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {loading && 
        <div style={{
          backgroundColor: '#ffffff80', 
          position: 'fixed', 
          top: '0', 
          right: '0', 
          bottom: '0', 
          left: '0', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center'
        }}>
          <ClipLoader color='#00000040'></ClipLoader>
          <p style={{color: '#00000050', marginLeft: 10}}>Loading audio</p>
        </div>
      }

      <main className={styles.main}>
        <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 40, paddingRight: 30, marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: 20 }}>
            <Image src={logo} height={30} />
          </div>
          <p style={{ color: '#ffffff90' }}>Real-Time Agent Assist</p>
        </div>
        <div className={styles.mainContainer}>
          <div>
            <ul className={styles.tabs}>
              {generateTabs()}
              {selectedCall == 3 && <p style={{fontSize: 10, lineHeight: 1.5, color: '#ffffff40', paddingLeft: 10}}>File must be stereo, PCM16le, 22050 sample rate for best results.</p>}
            </ul>
          </div>
          {selectedCall != 3 && 
            <div style={{ width: '100%' }}>
              {mainAudioComponent}
              <Transcript json={filterTranscript()} live={isTranscribing}></Transcript>
              {startButton()}
            </div>
          }
          {selectedCall == 3 && 
            <div style={{ width: '100%' }}>
              <input style={{ paddingLeft: 10 }} className="custom-file-input" type="file" onChange={(e) => handleFileUpload(e, 'left')} />
              {leftAudioComponent}
              <Transcript json={filterTranscript()} live={isTranscribing}></Transcript>
              {startButton()}
            </div>
          }
          <div style={{ width: '100%' }}>
            {selectedCall == 3 && 
              <input style={{ paddingLeft: 10 }} className="custom-file-input" type="file" onChange={(e) => handleFileUpload(e, 'right')} />
            }
            {selectedCall == 3 && rightAudioComponent}
            <SentimentChart data={sentiment} width={750} height={200}></SentimentChart>
            {/* <Breakdown json={sentiment}></Breakdown> */}
            <LemurOutput title={'AI Suggestions'} loading={lemurTasksLoad} notes={tasks} checkboxes={true} promptEditClick={(title) => promptEditClick(title)}></LemurOutput>
            <LemurOutput title={'AI Notes'} loading={lemurNotesLoad} notes={notes} promptEditClick={(title) => promptEditClick(title)}></LemurOutput>
          </div>
        </div>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setIsOpen(false)}
          style={modalStyle}
        >
          <p style={{fontSize: 15, fontWeight: 600, marginBottom: 20, color: 'black'}}>Edit Notes Prompt</p>
          <textarea 
            value={notesTextArea} 
            onChange={e => setNotesTextArea(e.target.value)} 
            style={{width: '100%', height: '200px', backgroundColor: 'white', color: 'black'}}
          />
          <p onClick={(e) => {
            // Here you can handle the prompt update logic
            console.log('Updated prompt:', notesTextArea);
            if (notesTextArea && notesTextArea != '') {
              setNotesPrompt(notesTextArea);
              alert('Prompt updated');
            }
          }} style={{fontSize: 12, color: 'white', backgroundColor: 'black', padding: 5, borderRadius: 5, cursor: 'pointer'}}
          >
            Update Notes Prompt
          </p>
          <p style={{fontSize: 15, fontWeight: 600, marginBottom: 20, color: 'black'}}>Edit Suggestions Prompt</p>
          <textarea 
            value={tasksTextArea} 
            onChange={e => setTasksTextArea(e.target.value)} 
            style={{width: '100%', height: '200px', backgroundColor: 'white', color: 'black'}}
          />
          <p onClick={(e) => {
            // Here you can handle the prompt update logic
            console.log('Updated prompt:', tasksTextArea);
            if (tasksTextArea && tasksTextArea != '') {
              setTasksPrompt(tasksTextArea);
              alert('Prompt updated');
            }
          }} style={{fontSize: 12, color: 'white', backgroundColor: 'black', padding: 5, borderRadius: 5, cursor: 'pointer'}}
          >
            Update Suggestions Prompt
          </p>
          <p style={{fontSize: 12, color: 'black', cursor: 'pointer'}} onClick={() => setIsOpen(false)}>Close</p>
        </Modal>
      </main>
      <footer className={styles.footer}>
      </footer>
    </div>
  )
}
