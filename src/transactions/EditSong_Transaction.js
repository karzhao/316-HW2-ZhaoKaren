import { jsTPS_Transaction } from 'jstps';

export default class EditSong_Transaction extends jsTPS_Transaction {
  constructor(app, index, prevSong, newSong) {
    super();
    this.app = app;
    this.index = index;
    this.prev = { ...prevSong };
    this.next = { ...newSong };
  }
  executeDo() { this.app.setSongAt(this.index, this.next); }
  executeUndo() { this.app.setSongAt(this.index, this.prev); }
}
