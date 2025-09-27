import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import { jsTPS } from 'jstps';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import AddSong_Transaction from './transactions/AddSong_Transaction.js';
import DeleteSong_Transaction from './transactions/DeleteSong_Transaction.js';
import DuplicateSong_Transaction from './transactions/DuplicateSong_Transaction.js';
import EditSong_Transaction from './transactions/EditSong_Transaction.js';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.jsx';
import EditSongModal from './components/EditSongModal.jsx';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.jsx';
import EditToolbar from './components/EditToolbar.jsx';
import SidebarHeading from './components/SidebarHeading.jsx';
import SidebarList from './components/PlaylistCards.jsx';
import SongCards from './components/SongCards.jsx';
import Statusbar from './components/Statusbar.jsx';



class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            currentList : null,
            sessionData : loadedSessionData,
            songIndexMarkedForEdit: null
        }
    }

    getSongAt = (i) => {
    const list = this.state.currentList;
    return list ? list.songs[i] : null;
    };

    addSongAt = (i, song) => {
    if (!this.state.currentList) return;
    const songs = [...this.state.currentList.songs];
    songs.splice(i, 0, { ...song });
    const list = { ...this.state.currentList, songs };
    this.setStateWithUpdatedList(list);
    };

    deleteSongAt = (i) => {
    if (!this.state.currentList) return;
    const songs = this.state.currentList.songs.filter((_, idx) => idx !== i);
    const list  = { ...this.state.currentList, songs };
    this.setStateWithUpdatedList(list);
    };

    setSongAt = (i, newSong) => {
    if (!this.state.currentList) return;
    const songs = [...this.state.currentList.songs];
    songs[i] = { ...newSong };
    const list = { ...this.state.currentList, songs };
    this.setStateWithUpdatedList(list);
    };

    
    
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        if (start === end) return;

        const songs = [...this.state.currentList.songs];
        const [moved] = songs.splice(start, 1);
        songs.splice(end, 0, moved);

        const list = { ...this.state.currentList, songs };
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.processTransaction(transaction);
        this.setState(s => s);
    }
    // FUNCTIONS FOR EDITING
    markSongForEdit = (index) => {
    this.setState({ songIndexMarkedForEdit: index }, () => this.showEditSongModal());
    };

    showEditSongModal = () => {
    const modal = document.getElementById("edit-song-modal");
    if (modal) modal.classList.add("is-visible");
    };

    hideEditSongModal = () => {
    const modal = document.getElementById("edit-song-modal");
    if (modal) modal.classList.remove("is-visible");
    this.setState({ songIndexMarkedForEdit: null });
    };

    confirmEditSong = (updated) => {
    const i = this.state.songIndexMarkedForEdit;
    const prev = this.getSongAt(i);
    const next = { ...prev, ...updated };
    const t = new EditSong_Transaction(this, i, prev, next);
    this.tps.processTransaction(t);
    this.hideEditSongModal();
    this.setState(s => s);
    };

    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.setState(s => s);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToDo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.setState(s => s);
        }
    }
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
    }
    // THIS FUNCTION DELETE SONG
    deleteSong = (index) => {
        if (!this.state.currentList) return;
        const t = new DeleteSong_Transaction(this, index);
        this.tps.processTransaction(t);
        this.setState(s => s);
    };
    
    // duplicate list
    // in class App
    duplicateList = (key) => {
    const original = this.db.queryGetList(key);
    if (!original) return;

    const newKey = this.state.sessionData.nextKey;
    const newName = `${original.name} (Copy)`;

    // deep copy songs (flat objects -> spread is enough)
    const newSongs = original.songs.map(s => ({ ...s }));

    const newList = { key: newKey, name: newName, songs: newSongs };
    const newPair = { key: newKey, name: newName };
    const updatedPairs = [...this.state.sessionData.keyNamePairs, newPair];
    this.sortKeyNamePairsByName(updatedPairs);

    this.setState(prev => ({
        currentList: newList,
        listKeyPairMarkedForDeletion: null,
        sessionData: {
        nextKey: prev.sessionData.nextKey + 1,
        counter: prev.sessionData.counter + 1,
        keyNamePairs: updatedPairs
        }
    }), () => {
        this.db.mutationCreateList(newList);
        this.db.mutationUpdateSessionData(this.state.sessionData);
    });
    };

    duplicateSong = (index) => {
        if (!this.state.currentList) return;
        const t = new DuplicateSong_Transaction(this, index);
        this.tps.processTransaction(t);
    };

    addSong = () => {
        if (!this.state.currentList) return;
        const index = this.getPlaylistSize();
        // HW1 defaults
        const newSong = {
            title: "Untitled",
            artist: "???",
            youTubeId: "dQw4w9WgXcQ",
            year: 2000
        };

        // append to end
        const t = new AddSong_Transaction(this, index, newSong);
        this.tps.processTransaction(t);
        this.setState(s => s);
    };

    componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown, true);
    }
    componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, true);
    }
    handleKeyDown = (e) => {
    

    // Avoid stealing shortcuts inside inputs if you want:
    // if ((e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && meta) return;

    const isMod = e.metaKey || e.ctrlKey; 
    if (!isMod) return;
    if (e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault();
        this.undo();
    } else if (e.code === 'KeyY' || (e.code === 'KeyZ' && e.shiftKey)){
        e.preventDefault();
        this.redo();
    }
    }

    render() {
        let canAddSong = !!this.state.currentList; // true only if list is open
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToDo();
        let canClose = this.state.currentList !== null;
        return (
            <div id="root">
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                    duplicateListCallback={this.duplicateList}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    addSongCallback={this.addSong}
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                />
                <SongCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction}
                    openEditSongCallback={this.markSongForEdit} 
                    deleteSongCallback={this.deleteSong}
                    duplicateSongCallback={this.duplicateSong}
                    />

                    <EditSongModal
                song={
                    this.state.currentList && this.state.songIndexMarkedForEdit != null
                    ? this.state.currentList.songs[this.state.songIndexMarkedForEdit]
                    : null
                }
                confirmEditSongCallback={this.confirmEditSong}
                hideEditSongModalCallback={this.hideEditSongModal}
                />
                
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
            </div>
        );
    }
}

export default App;
