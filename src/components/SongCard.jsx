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

    handleDeleteClick = (e) => {
        e.stopPropagation(); // don’t interfere with drag/select
        if (this.props.deleteSongCallback) {
            this.props.deleteSongCallback(this.props.index);
        }
    }

    handleDuplicateClick = (e) => {
        e.stopPropagation();
        this.props.duplicateSongCallback?.(this.props.index);
    };
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
        const displayTitle = `${index + 1}. ${song.title}`; // numbering

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
                onDoubleClick={() => this.props.editSongCallback(index)}
            >
                {youTubeHref ? (
                    <a
                    className="song-card-title"
                    href={youTubeHref}
                    target="_blank"
                    draggable={false}
                    onClick={(e) => e.stopPropagation()} // don't interfere with drag/select
                    >
                    {displayTitle}
                    </a>
                ) : (
                    <span className="song-card-title">{displayTitle}</span>
                )}
                <span className="song-card-by"> by </span>
                <span className="song-card-artist">{song.artist}</span>
                <span className="song-card-year">({song.year})</span>
                {/* buttons */}
                <span className="card-actions">
                <input
                    type="button"
                    id={`delete-song-${index}`}
                    className="card-button"
                    onClick={this.handleDeleteClick}
                    value="🗑"
                    draggable={false}
                    title="Delete song"
                    aria-label={`Delete ${song.title} by ${song.artist}`}
                />
                <input
                    id={`duplicate-song-${index}`}
                    type="button"
                    className="card-button"
                    value="⎘"
                    onClick={this.handleDuplicateClick}
                    draggable={false}
                    title="Duplicate song"
                    aria-label={`Duplicate ${song.title} by ${song.artist}`}
                />
                </span>
            </div>
        )
    }
}