import React from "react";

export default class SidebarHeading extends React.Component {
  handleClick = () => {
    const { createNewListCallback, canCreateList } = this.props;
    if (!canCreateList) return;
    createNewListCallback();
  };
  render() {
    const { canCreateList } = this.props;
    const disabled = !canCreateList;

    return (
      <div id="sidebar-heading">
        <input
          type="button"
          id="add-list-button"
          className={`toolbar-button${disabled ? " disabled" : ""}`}
          onClick={this.handleClick}
          disabled={disabled}
          value="+"
          title="Create New Playlist"
          aria-label="Create New Playlist"
        />
        <span>Your Playlists</span>
      </div>
    );
  }
}
