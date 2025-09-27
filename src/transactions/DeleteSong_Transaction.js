import { jsTPS_Transaction } from 'jstps';

export default class DeleteSong_Transaction extends jsTPS_Transaction {
  constructor(app, index) {
    super();
    this.app = app;
    this.index = index;
    this.song = null; // captured lazily in doTransaction
  }
  executeDo() {
    if (this.song === null) this.song = this.app.getSongAt(this.index);
    this.app.deleteSongAt(this.index);
  }
  executeUndo() {
    this.app.addSongAt(this.index, this.song);
  }
}
