import { jsTPS_Transaction } from 'jstps';

export default class AddSong_Transaction extends jsTPS_Transaction {
  constructor(app, index, song) {
    super();
    this.app = app;
    this.index = index;   // where to insert
    this.song = { ...song };
  }
  executeDo() { this.app.addSongAt(this.index, this.song); }
  executeUndo() { this.app.deleteSongAt(this.index); }
}
