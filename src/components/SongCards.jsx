import SongCard from './SongCard.jsx';
import React from "react";

export default class SongCards extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectedIndex: null }; // track which card is selected
    }

    handleSelect = (index) => {
        // click toggles select on/off
        this.setState(prev => ({
            selectedIndex: prev.selectedIndex === index ? null : index
        }));
    };

    render() {
        const { currentList, 
                moveSongCallback } = this.props;

        if (!currentList) {
            return (
                <div id="song-cards"></div>
            )
        }

        else {
            return (
                <div id="song-cards">
                    {
                        currentList.songs.map((song, index) => (
                            <SongCard
                                id={'song-card-' + (index+1)}
                                key={'song-card-' + (index+1)}
                                index={index}
                                song={song}
                                selected={index === this.state.selectedIndex}
                                onSelect={this.handleSelect}
                                moveCallback={moveSongCallback}
                                editSongCallback={this.props.openEditSongCallback}
                            />
                        ))
                    }
                </div>
            )
        }
    }
}