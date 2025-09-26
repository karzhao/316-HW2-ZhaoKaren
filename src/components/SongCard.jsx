import React from "react";

export default class SongCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: false,
            draggedTo: false
        }
    }

    // handleClick = () => {
    //     const { onSelect, index } = this.props;
    //     if (onSelect) onSelect(index); // tell parent which card was clicked
    // }

    handleDragStart = (event) => {
        // index is passed from parent
        event.dataTransfer.setData("text/plain", String(this.props.index));
        event.dataTransfer.effectAllowed = "move";
        this.setState({ isDragging: true, draggedTo: false });
    }
    // update state of dragged
    handleDragEnd = (event) => {
        this.setState({ isDragging: false, draggedTo: false })
    }
    // the potential drop target
    handleDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";

        const sourceIndex = Number(event.dataTransfer.getData("text/plain"));
        const targetIndex = this.props.index;

        // If source, don't alter target-hover state
        if (sourceIndex === targetIndex) return;

        if (!this.state.draggedTo) this.setState({ draggedTo: true });
    }
    handleDragEnter = (event) => {
        event.preventDefault();
        this.setState({ draggedTo: true });
    }
    handleDragLeave = (event) => {
        event.preventDefault();
        this.setState({ draggedTo: false });
    }
    handleDrop = (event) => {
        event.preventDefault();

        // Use currentTarget (the card div)
        const targetIndex = this.props.index;
        const sourceIndex = Number(event.dataTransfer.getData("text/plain"));

        this.setState({ isDragging: false, draggedTo: false });

        // Ask parent to move the data
        this.props.moveCallback(sourceIndex, targetIndex);
    }

    render() {
        const { song, index, selected } = this.props;

        if (!song) return null; // guard

        const classes = [
            "song-card",
            selected ? "selected-song-card" : "unselected-song-card", // styles
            this.state.draggedTo ? "song-card-dragged-to" : "",
            this.state.isDragging ? "is-dragging" : "" 
        ].filter(Boolean).join(" ");
        
        // YouTube href
        const youTubeHref = song.youTubeId ? `https://www.youtube.com/watch?v=${song.youTubeId}` : null;


        return (
            <div
                id={`song-${index}`}
                data-index={index}
                className={classes}
                draggable
                // onClick={this.handleClick}
                onDragStart={this.handleDragStart}
                onDragEnd={this.handleDragEnd}
                onDragOver={this.handleDragOver}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop}
                role="button"
            >
                {youTubeHref ? (
                    <a
                    className="song-card-title"
                    href={youTubeHref}
                    target="_blank"
                    draggable={false}
                    onClick={(e) => e.stopPropagation()} // don't interfere with drag/select
                    >
                    {song.title}
                    </a>
                ) : (
                    <span className="song-card-title">{song.title}</span>
                )}
                <span className="song-card-by">&nbsp;by&nbsp;</span>
                <span className="song-card-artist">{song.artist}</span>
            </div>
        )
    }
}