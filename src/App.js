import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textToSpeak: '',
      recognizedText: '',
      voices: [],
      selectedVoice: '',
    };

    // Check for support
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    } else {
      alert('Sorry, your browser does not support text-to-speech!');
    }

    this.startRecognition = this.startRecognition.bind(this);
    this.handleRecognitionResult = this.handleRecognitionResult.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleVoiceChange = this.handleVoiceChange.bind(this);
    this.speakText = this.speakText.bind(this);
    this.cancelSpeech = this.cancelSpeech.bind(this);
    this.pauseSpeech = this.pauseSpeech.bind(this);
    this.resumeSpeech = this.resumeSpeech.bind(this);
    this.demoTaskDivert = this.demoTaskDivert.bind(this);

  }

  componentDidMount() {
    this.populateVoices();
  }

  populateVoices = () => {
    const voices = this.synthesis.getVoices();
    this.setState({voices});
  };

  handleVoiceChange = (event) => {
    this.setState({selectedVoice: event.target.value});
  };

  speakText = (text, onend) => {
    if (this.synthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = this.state.voices.find(voice => voice.name === this.state.selectedVoice);
      if(onend) {
        utterance.onend = onend;
      }
      this.synthesis.speak(utterance);
    }
  };

  handleRecognitionResult = (event, responseActions) => {
    const lastResult = event.results[event.results.length - 1];
    if (lastResult.isFinal) {
      this.setState(
          {
            recognizedText: lastResult[0].transcript
          }, () => {
            if (this.state.recognizedText.toLocaleLowerCase() === 'yes') {
              this.speakText("Acknowledged");
            }
          }
      );
    }
  };

  startRecognition = (responseActions) => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      console.log(responseActions)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      let recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.onresult = function(event){
        console.log(event);
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          console.log(lastResult);
          const recognizedText = lastResult[0].transcript
          if(responseActions[recognizedText.toLocaleLowerCase()]) {
            responseActions[recognizedText.toLocaleLowerCase()]();
          }
        }
      };
      recognition.start();
    } else {
      alert('Sorry, your browser does not support speech recognition!');
    }
  };

  handleChange = (event) => {
    this.setState({textToSpeak: event.target.value});
  };

  cancelSpeech = () => {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  };

  pauseSpeech = () => {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  };

  resumeSpeech = () => {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  };

  demoTaskDivert = () => {
    this.speakText("Container destination changed to Door 123. Do you accept?", () => {
      this.startRecognition({
        "yes": () => {
          this.speakText("Acknowledged");
        },
        "no": () => {
          this.speakText("Fine, I will cancel the task.");
        }
      });
    });
  }

  demoJoke = () => {
    this.speakText("knock knock", () => {
      this.startRecognition({
        "who's there": () => {
          this.speakText("boo", () => {
            this.startRecognition({
              "boohoo": () => {
                this.speakText("Don't cry, it's just a joke");
              }
            });
          });
        }
      });
    });
  }

  render() {
    return (
        <div>
          <h2>Web Speech API Demo</h2>
          <div>
            <h3>Text-to-Speech</h3>
            <input
                id={'textToSpeak'}
                type="text"
                value={this.state.textToSpeak}
                onChange={this.handleChange}
                placeholder="Enter text to speak"
            />
            <select onChange={this.handleVoiceChange}>
              {this.state.voices.map((voice, index) => (
                  <option key={index} value={voice.name}>{voice.name}</option>
              ))}
            </select>
            <button onClick={()=>{this.speakText(document.getElementById('textToSpeak').value)}}>Speak</button>
            <button onClick={this.cancelSpeech}>Cancel</button>
            <button onClick={this.pauseSpeech}>Pause</button>
            <button onClick={this.resumeSpeech}>Resume</button>
          </div>
          <div>
            <h3>Speech-to-Text</h3>
            <button onClick={this.startRecognition}>Start Recognition</button>
            <p>Recognized Text: {this.state.recognizedText}</p>
          </div>
          <div>
            <button onClick={this.demoTaskDivert}>Demo Task Divert</button>
            <button onClick={this.demoJoke}>Demo Joke</button>
          </div>
        </div>
    );
  }
}

export default App;