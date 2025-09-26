import React, { Component } from "react";

export default class EditSongModal extends Component {
  constructor(props) {
    super(props);
    this.state = this.initFromProps(props);
  }

  initFromProps = (props) => {
    const s = props.song || { title: "", artist: "", year: "", youTubeId: "" };
    return { title: s.title, artist: s.artist, year: s.year, youTubeId: s.youTubeId };
  };

  componentDidUpdate(prevProps) {
    // When a new song is selected to edit, reset the form fields
    if (prevProps.song !== this.props.song) {
      this.setState(this.initFromProps(this.props));
    }
  }

  handleChange = (e) => this.setState({ [e.target.name]: e.target.value });

  handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      this.confirm();
    } 
  };

  confirm = () => {
    const { title, artist, year, youTubeId } = this.state;
    this.props.confirmEditSongCallback({ title, artist, year, youTubeId });
  };

  render() {
    const { hideEditSongModalCallback } = this.props;
    const { title, artist, year, youTubeId } = this.state;

    return (
      <div class="modal" id="edit-song-modal" data-animation="slideInOutLeft">
        <div class="modal-root" onKeyDown={this.handleKeyDown} tabIndex="-1">
          <div class="modal-north">Edit Song</div>

          <div class="modal-center">
            <div id="title-prompt" class="modal-prompt">Title:</div>
            <input
              id="edit-song-modal-title-textfield"
              class="modal-textfield"
              type="text"
              name="title"
              value={title}
              onChange={this.handleChange}
              onKeyDown={this.handleKeyDown}
            />

            <div id="artist-prompt" class="modal-prompt">Artist:</div>
            <input
              id="edit-song-modal-artist-textfield"
              class="modal-textfield"
              type="text"
              name="artist"
              value={artist}
              onChange={this.handleChange}
              onKeyDown={this.handleKeyDown}
            />

            <div id="year-prompt" class="modal-prompt">Year:</div>
            <input
              id="edit-song-modal-year-textfield"
              class="modal-textfield"
              type="text"
              name="year"
              value={year}
              onChange={this.handleChange}
            />

            <div id="you-tube-id-prompt" class="modal-prompt">YouTube Id:</div>
            <input
              id="edit-song-modal-youTubeId-textfield"
              class="modal-textfield"
              type="text"
              name="youTubeId"
              value={youTubeId}
              onChange={this.handleChange}
            />
          </div>

          <div class="modal-south">
            <input
              type="button"
              id="edit-song-confirm-button"
              class="modal-button"
              onClick={this.confirm}
              value="Confirm"
            />
            <input
              type="button"
              id="edit-song-cancel-button"
              class="modal-button"
              onClick={hideEditSongModalCallback}
              value="Cancel"
            />
          </div>
        </div>
      </div>
    );
  }
}
