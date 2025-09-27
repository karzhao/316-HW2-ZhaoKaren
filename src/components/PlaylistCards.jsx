import React from "react";
import PlaylistCard from "./PlaylistCard.jsx";

export default class PlaylistCards extends React.Component {
    render() {
        const { currentList,
                keyNamePairs,
                deleteListCallback, 
                loadListCallback,
                renameListCallback} = this.props;

        const sortedPairs = [...keyNamePairs].sort((a, b) =>
        a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
        );

        return (
            <div id="playlist-cards">
                {
                    sortedPairs.map((pair) => (
                        <PlaylistCard
                            key={pair.key}
                            keyNamePair={pair}
                            selected={(currentList !== null) && (currentList.key === pair.key)}
                            deleteListCallback={deleteListCallback}
                            loadListCallback={loadListCallback}
                            renameListCallback={renameListCallback}
                            duplicateListCallback={this.props.duplicateListCallback}
                        />
                    ))
                }
            </div>
        );
    }
}