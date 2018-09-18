import React, { Component } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faDownload, faUndoAlt, faUpload } from '@fortawesome/free-solid-svg-icons';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      images: [],
      target: null,
      display: "active",
      upload: false,
      delete: false,
    }
  }
  componentDidMount(){
    fetch('http://localhost:3001/')
    .then(res => res.json())
    .then(images => this.setState({images}))
    .catch(err => console.log(err))
  }
  footer = () => {
    const { target, display, images } = this.state;
    if(target){
      if(display === "active"){
        return <div className="bar">
          <div className="delete" onClick={this.switchDelete}>
            <FontAwesomeIcon icon={faTrashAlt} color="white" />
          </div>
          <a className="download" href={"http://localhost:3001/download/" + images.find(img => img.id === target).filename}>
            <FontAwesomeIcon icon={faDownload} color="white" />
          </a>
        </div>
      } else{
        return <div className="bar">
          <div className="restore" onClick={() => this.switchImgType("restore")}>
            <FontAwesomeIcon icon={faUndoAlt} color="white" />
          </div>
        </div>
      }
    }
  }
  switchDelete = () => {
    this.setState({delete: !this.state.delete})
  }
  setTarget = target => {
    this.setState({target})
  }
  setDisplay = display => {
    this.setState({display})
  }
  switchUpload = () => {
    const { upload } = this.state;
    this.setState({upload: !upload})
  }
  content = () => {
    const { images, display } = this.state;
    const displays = ["active", "deleted"];

    const getImages = () => images
      .filter(image => image.type === display)
      .map(image =>
        <div
          key={image.id}
          onClick={() => this.setTarget(image.id)}
          className={this.state.target === image.id ? "target" : "nontarget"}
        >
          <img src={"images/" + image.filename} alt={image.id} />
          <p className="name">{image.name}</p>
        </div>
    );
    const getDisplays = () => displays.map(disp =>
      <div 
        className={display === disp ? "target" : "nontarget"} 
        onClick={() => this.setDisplay(disp)}
        key={disp}
      >
        <p className="displayName">{disp}</p>
      </div>
    );

    return <div className="content">
      <div className="displays">
        {getDisplays()}
      </div>
      <div className="images">
        {getImages()}
      </div>
    </div>
  }
  switchImgType = to => {
    fetch('http://localhost:3001/switchtype', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
          id: this.state.target,
          type: to
      })
    }).then(() => {
      const images = this.state.images.map(image => {
        if(image.id === this.state.target){
          return{...image,
            type: to === "delete" ? "deleted" : "active"
          }
        } else {
          return image
        }
      });
      this.setState({images})
      to === "delete" && this.switchDelete()
    }).catch(err => console.log(err))
  }
  render() {
    return (
      <div className="App">
        <header>
          <h1>My Library</h1>
          <div className="upload" onClick={this.switchUpload}>
            <FontAwesomeIcon icon={faUpload} color="white" />
          </div>
        </header>
        {this.content()}
        {this.state.upload &&
          <div className="cover">
            <form ref='uploadForm' 
              id='uploadForm' 
              action='http://localhost:3001/upload' 
              method='post' 
              encType="multipart/form-data">
                <input type="file" name="image" />
                <input type="text" name="name" placeholder="name"/>
                <input type='submit' value='Upload!' />
                <button type="reset" value="Cancel" onClick={this.switchUpload}>Cancel</button>
            </form>
          </div>
        }
        {this.state.delete &&
           <div className="cover">
            <div className="msg">
              <p>Are you sure?</p>
              <div className="buttons">
                <button onClick={this.switchDelete}>No</button>
                <button onClick={() => this.switchImgType("delete")}>Yes</button>
              </div>
            </div>
           </div>
        }
        <footer>
          {this.footer()}
        </footer>
      </div>
    );
  }
}

export default App;
