import React from "react";

export default class EditToolbar extends React.Component {
    render() {
        const { canAddSong, canUndo, canRedo, canClose, 
                addSongCallback, undoCallback, redoCallback, closeCallback} = this.props;
    
        const addDisabled   = !canAddSong;
        const undoDisabled  = !canUndo;
        const redoDisabled  = !canRedo;
        const closeDisabled = !canClose;
        
        return (
            <div id="edit-toolbar">
            <input 
                type="button" 
                id='add-song-button' 
                value="+" 
                onClick={addSongCallback}
                className={`toolbar-button add-song-button${addDisabled ? " disabled" : ""}`}
                disabled={addDisabled} 
            />
            <input 
                type="button" 
                id='undo-button' 
                value="⟲" 
                className={`toolbar-button${undoDisabled ? " disabled" : ""}`}
                disabled={undoDisabled}
                onClick={undoCallback}
            />
            <input 
                type="button" 
                id='redo-button' 
                value="⟳" 
                className={`toolbar-button${redoDisabled ? " disabled" : ""}`}
                disabled={redoDisabled}
                onClick={redoCallback}
            />
            <input 
                type="button" 
                id='close-button' 
                value="&#x2715;" 
                className={`toolbar-button${closeDisabled ? " disabled" : ""}`}
                disabled={closeDisabled}
                onClick={closeCallback}
            />
        </div>
        )
    }
}